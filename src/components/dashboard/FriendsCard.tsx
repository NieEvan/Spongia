import { Button } from "@/components/ui/button";
import { Users, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "@/hooks/useFriends";

export const FriendsCard = () => {
    const navigate = useNavigate();
    const { leaderboard } = useFriends();
    
    const rank = leaderboard.findIndex(e => e.isMe) + 1;
    const topFriends = leaderboard.slice(0, 3);

    return (
        <div className="rounded-3xl bg-white p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Social</h2>
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm text-[#75757A] hover:text-[#1D1D1F] gap-1 px-2"
                    onClick={() => navigate("/friends")}
                >
                    See All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Rank badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                    <Trophy className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-[#75757A]">Weekly Rank</p>
                    <p className="text-lg font-bold text-[#1D1D1F] leading-tight">
                        {rank > 0 ? `#${rank}` : "—"}
                    </p>
                </div>
            </div>

            {/* Mini leaderboard */}
            <div className="flex-1 flex flex-col gap-2">
                {topFriends.length > 0 ? topFriends.map((friend, i) => (
                    <div key={i} className="flex items-center gap-3 px-1">
                        <span className="text-xs font-semibold text-[#75757A] w-4">{i + 1}</span>
                        <div className="h-7 w-7 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                            <Users className="h-3.5 w-3.5 text-[#75757A]" />
                        </div>
                        <span className="text-sm text-[#1D1D1F] flex-1 truncate">
                            {friend.isMe ? "You" : (friend.username || friend.email || "Friend")}
                        </span>
                        <span className="text-xs font-medium text-[#75757A]">{friend.score} pts</span>
                    </div>
                )) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
                        <Users className="h-5 w-5 text-[#75757A]" />
                        <p className="text-xs text-[#75757A]">Add friends to compete</p>
                    </div>
                )}
            </div>
        </div>
    );
};
