import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

export const ProfileCard = () => {
    const { user } = useAuth();
    const { myProfile, updateProfile } = useFriends();
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [username, setUsername] = useState("Username");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync username with user metadata when it changes or loads
    useEffect(() => {
        if (myProfile?.username) {
            setUsername(myProfile.username);
        } else if (user?.user_metadata?.username) {
            setUsername(user.user_metadata.username);
        }
    }, [myProfile, user]);

    useEffect(() => {
        if (myProfile) {
            setAvatarUrl(myProfile.avatar_url);
        }
    }, [myProfile]);

    const handleSaveUsername = async () => {
        setIsEditingUsername(false);
        if (username !== myProfile?.username) {
            await updateProfile({ username });
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                setAvatarUrl(base64String);
                await updateProfile({ avatar_url: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pt-5 pb-4">
                <CardTitle className="text-[20px] font-bold text-[#1d1d1f]">Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
                <div className="relative group mb-3">
                    <Avatar className="h-20 w-20 bg-neutral-100 transition-opacity group-hover:opacity-80">
                        <AvatarImage src={avatarUrl || "/default-avatar.png"} className="object-cover" />
                        <AvatarFallback className="text-2xl">
                            {username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        className="absolute -top-1 -right-1 bg-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50"
                        onClick={handleAvatarClick}
                    >
                        <PenLine className="h-4 w-4 text-[#324dc7]" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />
                </div>
                
                {isEditingUsername ? (
                    <div className="flex justify-center items-center h-[28px] w-full px-4">
                        <div className="relative">
                            <Input 
                                value={username} 
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-8 w-40 text-center text-lg md:text-lg font-medium rounded-xl border-none bg-[#f5f5f7] ring-1 ring-neutral-200 hover:ring-2 hover:ring-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none focus-visible:ring-offset-0 transition-all font-sans"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                            />
                            <Button size="icon" className="h-8 w-8 rounded-xl absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#324dc7] text-white hover:bg-[#324dc7]/90" onClick={handleSaveUsername}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-[28px] group relative w-full px-4">
                        <div className="relative">
                            <span className="font-medium text-lg text-[#1d1d1f]">{username}</span>
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center gap-2">
                                <div className="bg-[#324dc7] rounded-full p-[2px] shrink-0">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                                <button 
                                    className="opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white text-[#324dc7] hover:bg-blue-50 rounded-xl"
                                    onClick={() => setIsEditingUsername(true)}
                                >
                                    <PenLine className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
