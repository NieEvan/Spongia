import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { domainIconColors, skillIcons } from "@/components/ui/skill-card";
import { useProgress } from "@/hooks/useProgress"; // You might need to expose raw data or use getStoredProgress logic
import { normalizeSkill, useQuestionStats, useValidQuestionIds } from "@/hooks/useQuestions";
import { ArrowRight, Target } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export const RecentPractices = () => {
  const navigate = useNavigate();
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

    // Slice to 2 instead of 3
    return sortedSkills.slice(0, 2).map(skill => {
      const total = stats.skillCounts[skill] || 0;
      const attempted = skillAttemptedCount[skill] || 0;
      const percentage = total > 0 ? Math.min(100, Math.round((attempted / total) * 100)) : 0;
      const domain = skillToDomain[skill];

      return {
        name: skill,
        domain,
        percentage,
        icon: skillIcons[skill] || Target,
      };
    });
  }, [progress, stats]);

  return (
    <div className="w-full">
      {/* If there's a title header, you can keep it or remove it depending on visual preference */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-900">Recent Skills</h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-sm text-[#75757A] hover:text-brand-blue hover:bg-transparent transition-colors gap-1 px-1"
          onClick={() => navigate("/skills")}
        >
          Practice <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Change your list container to a 2-column grid layout with appropriate gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recentSkills.map(skill => {
          const Icon = skill.icon;
          // Extract just the bg class from domainIconColors which is like "bg-domain-ideas text-white"
          const domainColorClass = skill.domain ? domainIconColors[skill.domain]?.split(" ")[0] : "bg-primary";

          return (
            <div
              key={skill.name}
              className="bg-slate-50 border border-slate-100 p-3.5 sm:p-4 rounded-[1.25rem] flex items-center gap-3 min-w-0 transition-all hover:bg-slate-100/80 hover:border-slate-200 h-[80px]"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${domainColorClass} text-white`}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-semibold text-[13px] sm:text-sm text-slate-800 truncate pr-2"
                    title={skill.name}
                  >
                    {skill.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{skill.percentage}%</span>
                </div>
                <Progress
                  value={skill.percentage}
                  className="h-1.5 bg-slate-200"
                  indicatorClassName={domainColorClass}
                />
              </div>
            </div>
          );
        })}

        {recentSkills.length < 2 && (
          <div className="text-sm text-[#75757A] pt-4 text-center col-span-full">
            {recentSkills.length === 0 ? (
              <>
                Get started with practice <br /> <br />
                <Button
                  size="sm"
                  className="h-10 px-8 text-lg rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 shadow-xl shadow-black/5"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Practice Skills
                </Button>
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
  );
};
