import { Sidebar } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { Camera, Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const { myProfile, updateProfile } = useFriends();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (myProfile?.username) {
      setUsername(myProfile.username);
    } else if (user?.user_metadata?.username) {
      setUsername(user.user_metadata.username);
    }
    if (myProfile?.avatar_url) {
      setAvatarUrl(myProfile.avatar_url);
    }
  }, [myProfile, user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: { username?: string; avatar_url?: string } = {};
      if (username !== myProfile?.username) updates.username = username;
      if (avatarUrl !== myProfile?.avatar_url) updates.avatar_url = avatarUrl ?? undefined;
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        toast.success("Profile updated!");
      } else {
        toast.info("No changes to save.");
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = username || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      <Sidebar />
      <main className="flex-1 pt-[60px] pb-[20px] px-6 md:px-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">Settings</h1>

          {/* Profile Section */}
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-bold text-[#1d1d1f]">Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <Avatar className="h-20 w-20 ring-2 ring-neutral-100">
                    <AvatarImage src={avatarUrl || "/default-avatar.png"} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-neutral-100 text-[#1d1d1f]">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-[#1d1d1f]">Profile photo</p>
                  <p className="text-xs text-muted-foreground">Click the avatar to upload a new photo</p>
                  <button
                    onClick={handleAvatarClick}
                    className="mt-1 text-xs font-medium text-[#324dc7] hover:underline text-left w-fit"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="username" className="text-sm font-medium text-[#1d1d1f]">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="rounded-xl border-neutral-200 focus-visible:ring-[#324dc7]"
                  placeholder="Your username"
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1d1d1f]">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="rounded-xl border-neutral-200 bg-neutral-50 text-muted-foreground cursor-default"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              {/* Friend tag (read-only) */}
              {myProfile?.friend_tag && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-[#1d1d1f]">Friend tag</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-neutral-100 rounded-lg px-3 py-1.5 text-[#1d1d1f]">
                      {myProfile.friend_tag}
                    </span>
                    <p className="text-xs text-muted-foreground">Share this to add friends</p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#324dc7] hover:bg-[#324dc7]/90 text-white rounded-xl px-6"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
