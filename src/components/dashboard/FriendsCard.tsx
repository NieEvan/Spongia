import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { Badge } from "@/components/ui/badge";

export const FriendsCard = () => {
    const navigate = useNavigate();
    const { myProfile, leaderboard } = useFriends();
    
    // Calculate rank among friends
    const rank = leaderboard.findIndex(e => e.isMe) + 1;

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pt-5 pb-4">
                <CardTitle className="text-[20px] font-bold text-[#1d1d1f] flex items-center gap-2">
                    Social
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pb-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm font-medium">Weekly Rank</span>
                            <div className="flex items-center gap-1.5 text-[#1d1d1f]">
                                <span className="font-bold text-lg">
                                    {rank > 0 ? `#${rank}` : "--"}
                                </span>
                            </div>
                         </div>
                         <Button 
                            variant="default" 
                            size="sm"
                            className="h-8 px-4 rounded-xl bg-[#324dc7] hover:bg-[#324dc7]/90 text-white font-semibold border-none"
                            onClick={() => navigate("/friends")}
                         >
                            See More
                         </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
