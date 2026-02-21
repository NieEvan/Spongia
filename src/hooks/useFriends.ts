import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FriendProfile {
  id: string;
  email: string | null;
  friend_tag: string | null;
  username: string | null;
  avatar_url: string | null;
  share_activity: boolean;
  share_score: boolean;
}

export interface FriendRequest {
    id: string; // friendship id
    user: FriendProfile; // the person who sent the request
    sent_at: string;
}

export interface LeaderboardEntry extends FriendProfile {
  questionsThisWeek: number;
  score: number;
  isMe: boolean;
}

export const useFriends = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. My Profile Query
  const { data: myProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;

      let profileData = data as FriendProfile;
      if (!profileData.friend_tag) {
          const newTag = "#" + Math.floor(10000 + Math.random() * 90000).toString();
          await (supabase as any)
              .from("profiles")
              .update({ friend_tag: newTag })
              .eq("id", user.id);
          profileData = { ...profileData, friend_tag: newTag };
      }
      return profileData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Friends Query
  const { data: friends = [] } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: friendships, error: friendError } = await (supabase as any)
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (friendError) throw friendError;

      const friendIds = (friendships || []).map((f: any) => f.user_id === user.id ? f.friend_id : f.user_id);
      const uniqueFriendIds = Array.from(new Set(friendIds)) as string[];

      if (uniqueFriendIds.length === 0) return [];

      const { data: profiles, error: profileError } = await (supabase as any)
          .from("profiles")
          .select("*")
          .in("id", uniqueFriendIds);

      if (profileError) throw profileError;
      return profiles as FriendProfile[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Pending Requests Query
  const { data: requests = [] } = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: rawRequests, error } = await (supabase as any)
        .from("friendships")
        .select(`
            id,
            created_at,
            user:user_id (
                id, email, friend_tag, username, avatar_url
            )
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending");
      
      if (error) throw error;

      return (rawRequests || []).map((r: any) => ({
          id: r.id,
          user: Array.isArray(r.user) ? r.user[0] : r.user,
          sent_at: r.created_at
      })).filter(r => r.user) as FriendRequest[];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000,
  });

  // 4. Leaderboard Query
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", user?.id, friends.length, myProfile?.id, myProfile?.avatar_url, myProfile?.username, myProfile?.friend_tag, friends],
    queryFn: async () => {
      if (!user || !myProfile) return [];

      const allUserIds = [user.id, ...friends.map(f => f.id)];
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: progressData, error } = await (supabase as any)
        .from("user_progress")
        .select("user_id")
        .in("user_id", allUserIds)
        .gte("answered_at", startOfWeek.toISOString());

      if (error) throw error;

      const counts: Record<string, number> = {};
      (progressData || []).forEach((row: any) => {
        counts[row.user_id] = (counts[row.user_id] || 0) + 1;
      });

      const entries: LeaderboardEntry[] = [];
      entries.push({
        ...myProfile,
        questionsThisWeek: counts[user.id] || 0,
        score: (counts[user.id] || 0) * 10,
        isMe: true
      });

      friends.forEach(friend => {
        if (friend.share_score !== false) {
          entries.push({
            ...friend,
            questionsThisWeek: counts[friend.id] || 0,
            score: (counts[friend.id] || 0) * 10,
            isMe: false
          });
        }
      });

      return entries.sort((a, b) => b.score - a.score);
    },
    enabled: !!user && !!myProfile,
    staleTime: 5 * 60 * 1000,
  });

  const sendRequest = async (tag: string) => {
    if (!user) return;
    try {
      const { data: foundUsers } = await (supabase as any)
        .from("profiles")
        .select("id, friend_tag")
        .eq("friend_tag", tag)
        .limit(1);

      if (!foundUsers || foundUsers.length === 0) {
        toast.error("User not found with this tag");
        return;
      }

      const friendToAdd = foundUsers[0];
      if (friendToAdd.id === user.id) {
          toast.error("You cannot add yourself");
          return;
      }

      const { data: existing } = await (supabase as any)
        .from("friendships")
        .select("id, status, user_id, friend_id")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendToAdd.id}),and(user_id.eq.${friendToAdd.id},friend_id.eq.${user.id})`);

      if (existing && existing.length > 0) {
        const relation = existing[0];
        if (relation.status === 'accepted') toast.info("You are already friends!");
        else if (relation.user_id === user.id) toast.info("Request already sent.");
        else toast.info("This user already sent you a request!");
        return;
      }

      const { error: addError } = await (supabase as any)
        .from("friendships")
        .insert({ user_id: user.id, friend_id: friendToAdd.id, status: 'pending' });

      if (addError) throw addError;
      toast.success(`Friend request sent to ${tag}`);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    } catch (err) {
        toast.error("Error sending request");
    }
  };

  const acceptRequest = async (requestId: string) => {
      if (!user) return;
      try {
          const { error } = await (supabase as any)
            .from("friendships")
            .update({ status: 'accepted' })
            .eq('id', requestId);
          
          if (error) throw error;
          toast.success("Friend request accepted!");
          queryClient.invalidateQueries({ queryKey: ["friends"] });
          queryClient.invalidateQueries({ queryKey: ["requests"] });
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      } catch (error: any) {
          toast.error("Failed to accept");
      }
  };

  const declineRequest = async (requestId: string) => {
      if (!user) return;
      try {
          const { error } = await (supabase as any)
            .from("friendships")
            .delete()
            .eq('id', requestId);
          if (error) throw error;
          toast.success("Request removed");
          queryClient.invalidateQueries({ queryKey: ["requests"] });
      } catch (error) {
          toast.error("Failed to decline");
      }
  };

  const updateSettings = async (shareActivity: boolean, shareScore: boolean) => {
      if(!user) return;
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ share_activity: shareActivity, share_score: shareScore })
        .eq('id', user.id);
      
      if (error) toast.error("Failed to update");
      else {
          toast.success("Settings updated");
          queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Also update auth metadata for username if present
      if (updates.username) {
        await (supabase as any).auth.updateUser({
          data: { username: updates.username }
        });
      }

      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  // Compatibility with old hook interface
  return {
    friends,
    requests,
    leaderboard,
    myProfile: myProfile || null,
    loading: leaderboardLoading && !leaderboard.length,
    sendRequest,
    acceptRequest,
    declineRequest,
    updateSettings,
    updateProfile
  };
};
