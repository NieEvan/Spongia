import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "@/hooks/useFriends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const FriendsCard = () => {
    const navigate = useNavigate();
    const { leaderboard, friends } = useFriends();
    
    // Get top 3 friends
    const topFriends = leaderboard?.slice(0, 3) || [];

    return (
        <div className="rounded-3xl bg-white p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow border border-slate-100/0 hover:border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Social</h2>
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm text-[#75757A] hover:text-[#324dc7] hover:bg-transparent transition-colors gap-1 px-1"
                    onClick={() => navigate("/friends")}
                >
                    Connect <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
                {topFriends.length <= 1 && (!friends || friends.length === 0) ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-[#f7faff] rounded-2xl h-full gap-2">
                        <p className="text-sm font-semibold text-[#1D1D1F]">No friends yet</p>
                        <p className="text-xs text-[#75757A]">Add friends to compete on the leaderboard!</p>
                    </div>
                ) : (
                    topFriends.map((friend, index) => (
                        <div 
                            key={friend.id || index} 
                            className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors bg-[#f7faff]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-bold text-[#75757A] w-3 text-center">
                                    {index + 1}
                                </div>
                                <Avatar className="h-9 w-9 bg-white border border-neutral-100">
                                    <AvatarImage src={friend.avatar_url || "/default-avatar.png"} className="object-cover" />
                                    <AvatarFallback>{(friend.username || "?")[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#1D1D1F] truncate max-w-[90px]">
                                        {friend.username || "Unknown"}
                                    </span>
                                    {friend.isMe && (
                                        <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-[#324dc7] text-white hover:bg-[#324dc7]">
                                            You
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-[#1D1D1F]">{friend.score}</span>
                            </div>
                        </div>
                    ))
                )}
                
                {friends && friends.length > 0 && (
                    <p className="text-xs text-[#75757A] mt-1 ml-1 text-center">
                        + {friends.length} more friend{friends.length === 1 ? '' : 's'}
                    </p>
                )}
            </div>
        </div>
    );
};
