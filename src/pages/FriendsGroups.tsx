import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus, Settings, Loader2, Check, X, ChevronDown, ChevronUp, Bell, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";

const FriendsGroups = () => {
    const { user } = useAuth();
    const { leaderboard, requests, myProfile, loading, sendRequest, acceptRequest, declineRequest, updateSettings } = useFriends();
    const [inviteCode, setInviteCode] = useState("");

    // Settings state
    const [shareActivity, setShareActivity] = useState(true);
    const [shareScore, setShareScore] = useState(true);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // Requests dropdown state
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (myProfile) {
            setShareActivity(myProfile.share_activity);
            setShareScore(myProfile.share_score);
        }
    }, [myProfile]);

    const handleSendRequest = () => {
        if (!inviteCode) return;
        sendRequest(inviteCode);
        setInviteCode("");
    };

    const handleSettingsChange = async (activity: boolean, score: boolean) => {
        setShareActivity(activity);
        setShareScore(score);
        setIsUpdatingSettings(true);
        await updateSettings(activity, score);
        setIsUpdatingSettings(false);
    }


    return (
        <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
            <Sidebar />
            <main className="flex-1 pt-[60px] pb-[20px] px-6 md:px-10 overflow-y-auto">
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-brand-blue rounded-l-3xl -z-10" />
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">Social</h1>
                            <p className="text-[#75757A] mt-2 text-lg">Compete with friends and track your progress together.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main Content: Leaderboard / Friend List */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Friends Leaderboard */}
                                <Card className="border-none shadow-sm bg-white rounded-3xl">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-5 w-5 text-[#1D1D1F]" />
                                            <CardTitle className="text-[20px]">Weekly Leaderboard</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            {loading ? (
                                                <div className="p-8 flex justify-center text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                </div>
                                            ) : (leaderboard?.length ?? 0) <= 1 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    <p>No friends added yet.</p>
                                                    <p className="text-sm mt-1">Add friends using their tag to see them here!</p>
                                                </div>
                                            ) : (
                                                leaderboard?.map((friend, index) => (
                                                    <div key={friend.id} className={`flex items-center justify-between p-3 px-4 rounded-2xl transition-colors ${friend.isMe ? 'bg-[#324dc7]/5' : 'hover:bg-neutral-50'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="font-bold text-neutral-400 w-6 text-center text-sm">#{index + 1}</div>
                                                            <Avatar className="h-11 w-11 bg-neutral-100 border border-neutral-100">
                                                                <AvatarImage src={friend.avatar_url || "/default-avatar.png"} className="object-cover" />
                                                                <AvatarFallback>{(friend.username || "?")[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-bold text-[#1d1d1f] flex items-center gap-2">
                                                                    {friend.username || "Unknown"}
                                                                    {friend.isMe && <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-[#324dc7] text-white hover:bg-[#324dc7]">YOU</Badge>}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground font-medium">{friend.friend_tag}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-[#1d1d1f]">{friend.score}</span>
                                                            <div className="flex items-center gap-1 text-[14px] text-muted-foreground font-medium uppercase tracking-wider">
                                                                <span>{friend.questionsThisWeek}</span>
                                                                <span>Questions</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Sidebar: Add Friend & Settings */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* Add Friend Card */}
                                <Card className="border-none shadow-sm bg-white rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="text-[20px] flex items-center gap-2">
                                            <UserPlus className="h-5 w-5 text-[#1d1d1f]" />
                                            Add Friend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter your friend's tag, e.g. #00000"
                                                value={inviteCode}
                                                onChange={(e) => setInviteCode(e.target.value)}
                                                className="rounded-xl bg-[#f5f5f7] border-none ring-1 ring-neutral-200 hover:ring-2 hover:ring-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none transition-all"
                                            />
                                            <Button size="icon" className="rounded-xl shrink-0 bg-[#324dc7] hover:bg-[#324dc7]/90 text-white border-none" onClick={handleSendRequest}>
                                                <Plus className="h-6 w-6" strokeWidth={3} />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 px-1 py-1 bg-white">
                                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Your Tag</span>
                                            <code className="h-8 flex items-center px-2 text-sm font-bold text-muted-foreground font-mono tracking-wider rounded-xl">
                                                {myProfile?.friend_tag || "..."}
                                            </code>
                                            <motion.button
                                                whileTap={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                className="h-7 px-3 text-xs font-medium text-[#1D1D1F] bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center overflow-hidden"
                                                onClick={() => {
                                                    if (myProfile?.friend_tag) {
                                                        navigator.clipboard.writeText(myProfile.friend_tag);
                                                        setIsCopied(true);
                                                        setTimeout(() => setIsCopied(false), 2000);
                                                    }
                                                }}
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={isCopied ? "copied" : "copy"}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="inline-flex items-center leading-none mt-[1px]"
                                                    >
                                                        {isCopied ? "Copied!" : "Copy"}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </motion.button>
                                        </div>

                                        {/* Friend Requests Dropdown */}
                                        {(requests?.length ?? 0) > 0 && (
                                            <div className="pt-2 border-t border-neutral-100 mt-4">
                                                <button
                                                    onClick={() => setIsRequestsOpen(!isRequestsOpen)}
                                                    className="flex items-center justify-between w-full p-2 -ml-2 rounded-xl hover:bg-neutral-50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <Bell className="h-4 w-4 text-[#1d1d1f]" />
                                                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-[#1d1d1f]">Friend Requests</span>
                                                        <Badge className="ml-1 h-5 px-1.5 text-[10px] rounded-full bg-[#324dc7] hover:bg-[#324dc7]/90">
                                                            {requests?.length ?? 0}
                                                        </Badge>
                                                    </div>
                                                    {isRequestsOpen ?
                                                        <ChevronUp className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" /> :
                                                        <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                                                    }
                                                </button>

                                                {isRequestsOpen && (
                                                    <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                        {requests?.map((req) => (
                                                            <div key={req.id} className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <Avatar className="h-8 w-8 bg-white border border-neutral-200 shrink-0">
                                                                        <AvatarImage src={req.user.avatar_url || "/default-avatar.png"} className="object-cover" />
                                                                        <AvatarFallback>{(req.user.username || "?")[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-semibold text-[#1d1d1f] truncate">
                                                                            {req.user.username || "Unknown"}
                                                                        </div>
                                                                        <div className="text-[10px] text-muted-foreground font-mono">{req.user.friend_tag}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 shrink-0">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 rounded-xl text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => acceptRequest(req.id)}
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => declineRequest(req.id)}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Settings Card */}
                                <Card className="border-none shadow-sm bg-white rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="text-[20px] flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-[#1d1d1f]" />
                                            Privacy Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between space-x-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="share-activity" className="text-[16px] font-medium">Share Activity</Label>
                                                <p className="text-sm text-muted-foreground">Allow friends to see when you practice.</p>
                                            </div>
                                            <Switch
                                                id="share-activity"
                                                checked={shareActivity}
                                                onCheckedChange={(c) => handleSettingsChange(c, shareScore)}
                                                disabled={isUpdatingSettings}
                                                className="data-[state=checked]:bg-[#324dc7]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="share-score" className="text-[16px] font-medium">Share Score</Label>
                                                <p className="text-sm text-muted-foreground">Show your question count on leaderboards.</p>
                                            </div>
                                            <Switch
                                                id="share-score"
                                                checked={shareScore}
                                                onCheckedChange={(c) => handleSettingsChange(shareActivity, c)}
                                                disabled={isUpdatingSettings}
                                                className="data-[state=checked]:bg-[#324dc7]"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FriendsGroups;
