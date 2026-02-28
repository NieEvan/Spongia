import { Link } from "react-router-dom";
import { ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress"; // You might need to expose raw data or use getStoredProgress logic
import { useQuestionStats, normalizeSkill, useValidQuestionIds } from "@/hooks/useQuestions";
import { useMemo } from "react";
import { skillIcons, domainIconColors } from "@/components/ui/skill-card";

export const RecentPractices = () => {
    const { progress } = useProgress();
    const stats = useQuestionStats();
    const validQuestionIds = useValidQuestionIds();
    
    const recentSkills = useMemo(() => {
        const results = progress?.results;
        if (!results) return [];

        const skillLastPracticed: Record<string, number> = {};
        const skillAttemptedCount: Record<string, number> = {};

        Object.values(results).forEach((res: any) => {
            // Only count questions that exist in the current dataset
            if (!validQuestionIds.has(res.questionId)) return;

            const skill = normalizeSkill(res.skill);
            if (!skill) return;
            
            if (!skillLastPracticed[skill] || res.answeredAt > skillLastPracticed[skill]) {
                skillLastPracticed[skill] = res.answeredAt;
            }
            skillAttemptedCount[skill] = (skillAttemptedCount[skill] || 0) + 1;
        });

        // Map skill to domain
        const skillToDomain: Record<string, string> = {};
        Object.entries(stats.skillsByDomain).forEach(([domain, skills]) => {
            skills.forEach(s => {
                skillToDomain[s] = domain;
            });
        });

        // Sort by time
        const sortedSkills = Object.keys(skillLastPracticed).sort((a, b) => {
            return skillLastPracticed[b] - skillLastPracticed[a];
        });

        return sortedSkills.slice(0, 3).map(skill => {
            const total = stats.skillCounts[skill] || 0;
            const attempted = skillAttemptedCount[skill] || 0;
            const percentage = total > 0 ? Math.min(100, Math.round((attempted / total) * 100)) : 0;
            const domain = skillToDomain[skill];
            
            return {
                name: skill,
                domain,
                percentage,
                icon: skillIcons[skill] || Target
            };
        });
    }, [progress, stats]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex flex-col pb-2 flex-shrink-0">
                <h2 className="text-[20px] font-bold mb-0.5 text-[#1D1D1F]">Skills</h2>
                <div className="flex items-center justify-between min-h-[1.25rem]">
                    <p className="text-sm text-[#75757A]">Recent practices</p>
                    <Link to="/skills">
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-[#75757A] hover:bg-transparent hover:text-blue-600 transition-colors gap-1 font-medium">
                            See All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-3 pb-0">
                    {recentSkills.map((skill) => {
                        const Icon = skill.icon;
                        // Extract just the bg class from domainIconColors which is like "bg-domain-ideas text-white"
                        const domainColorClass = skill.domain ? domainIconColors[skill.domain]?.split(" ")[0] : "bg-primary";
                        
                        return (
                            <div key={skill.name} className="bg-white pt-4 pb-4 pl-6 pr-6 rounded-2xl shadow-sm flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${domainColorClass} text-white`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-medium text-[14px] text-[#1D1D1F] truncate">{skill.name}</span>
                                        <span className="text-xs text-[#75757A] ml-2">{skill.percentage}%</span>
                                    </div>
                                    <Progress 
                                        value={skill.percentage} 
                                        className="h-1.5 bg-[#f5f5f7]" 
                                        indicatorClassName={domainColorClass} 
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {recentSkills.length < 3 && (
                        <div className="text-sm text-[#75757A] pt-4 text-center">
                            {recentSkills.length === 0 ? (
                                <>
                                    Get started with practice{" "}
                                    <Link to="/skills" className="text-blue-600 hover:underline font-medium">
                                        here
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Explore more skills{" "}
                                    <Link to="/skills" className="text-blue-600 hover:underline font-medium">
                                        here
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
