import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "@/hooks/useFriends";

export const FriendsCard = () => {
    const navigate = useNavigate();
    const { leaderboard } = useFriends();
    
    const rank = leaderboard.findIndex(e => e.isMe) + 1;

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

            <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3">
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
        </div>
    );
};
