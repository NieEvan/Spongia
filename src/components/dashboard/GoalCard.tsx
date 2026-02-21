import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export const GoalCard = () => {
    const [goal, setGoal] = useState(1600);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(goal.toString());

    useEffect(() => {
        const stored = localStorage.getItem("sat-goal");
        if (stored) setGoal(parseInt(stored));
    }, []);

    const handleSave = () => {
        const val = parseInt(tempGoal);
        if (!isNaN(val) && val >= 400 && val <= 1600) {
            setGoal(val);
            localStorage.setItem("sat-goal", val.toString());
            setIsEditing(false);
        }
    };

    const splitScore = Math.floor(goal / 2);

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pt-5 pb-4">
                <CardTitle className="text-xl font-bold text-[#1d1d1f]">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span>Goal:</span>
                            <Input 
                                value={tempGoal} 
                                onChange={(e) => setTempGoal(e.target.value)}
                                className="h-10 w-24 rounded-xl text-lg"
                                type="number"
                            />
                        </div>
                    ) : (
                         `Goal: ${goal}`
                    )}
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-[#1d1d1f]"
                    onClick={() => {
                        if (isEditing) handleSave();
                        else {
                            setTempGoal(goal.toString());
                            setIsEditing(true);
                        }
                    }}
                >
                    {isEditing ? <Check className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent className="pb-2 pt-2">
                <div className="flex justify-between text-muted-foreground">
                    <span>Math: {splitScore}</span>
                    <span>English: {goal - splitScore}</span>
                </div>
            </CardContent>
        </Card>
    );
};
