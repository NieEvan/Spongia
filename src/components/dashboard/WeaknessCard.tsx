import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressStats } from "@/hooks/useProgress";
import { AlertCircle, TrendingUp } from "lucide-react";

export const WeaknessCard = () => {
    const { skillRecentStats } = useProgressStats();

    // Process skills to find weaknesses (low accuracy)
    const weaknesses = Object.entries(skillRecentStats || {})
        .map(([skill, stats]) => ({
            skill,
            accuracy: stats.accuracy,
            total: stats.total,
        }))
        .filter((s) => s.total >= 10 && s.accuracy < 80) // Only consider skills with at least 10 attempts and < 80% accuracy
        .sort((a, b) => a.accuracy - b.accuracy) // Lowest accuracy first
        .slice(0, 5); // Top 5

    return (
        <Card className="h-full bg-white border-none shadow-sm rounded-3xl p-7 flex flex-col">
            <div className="flex items-center gap-2 mb-8 shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Weaknesses</h2>
            </div>

            {weaknesses.length > 0 ? (
                <div className="space-y-5">
                    {weaknesses.map((w) => (
                        <div key={w.skill}>
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="font-medium text-[#1D1D1F] text-sm truncate pr-4" title={w.skill}>
                                    {w.skill}
                                </h3>
                                <span className="text-sm font-bold text-red-500 shrink-0">
                                    {Math.round(w.accuracy)}%
                                </span>
                            </div>
                            <Progress
                                value={w.accuracy}
                                className="h-2 bg-red-50"
                                indicatorClassName="bg-red-500"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-[#75757A] leading-relaxed max-w-[240px]">
                        Complete at least 10 questions of an individual skill.
                    </p>
                </div>
            )}
        </Card>
    );
};
