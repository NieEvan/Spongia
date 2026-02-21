
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  email: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (mounted) {
          setProfile(data as unknown as Profile);
        }
      } catch (error) {
        console.error("Error in getProfile:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  return { profile, loading };
};
