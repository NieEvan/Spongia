import { Brain, Target, Scale, Type, Layers, Link2, PenTool, CheckCircle, FileText, Sparkles, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  skill: string;
  domain: string;
  totalCount: number;
  attemptedCount: number;
  recentAccuracy: number;
  index: number;
}

export const domainColors: Record<string, string> = {
  "Information and Ideas": "from-domain-ideas/10 to-domain-ideas/5 border-domain-ideas/20 hover:border-domain-ideas/40",
  "Craft and Structure": "from-domain-craft/10 to-domain-craft/5 border-domain-craft/20 hover:border-domain-craft/40",
  "Expression of Ideas": "from-domain-expression/10 to-domain-expression/5 border-domain-expression/20 hover:border-domain-expression/40",
  "Standard English Conventions": "from-domain-conventions/10 to-domain-conventions/5 border-domain-conventions/20 hover:border-domain-conventions/40",
};

export const domainIconColors: Record<string, string> = {
  "Information and Ideas": "bg-domain-ideas text-white",
  "Craft and Structure": "bg-domain-craft text-white",
  "Expression of Ideas": "bg-domain-expression text-white",
  "Standard English Conventions": "bg-domain-conventions text-white",
};

// Map skills to appropriate icons
export const skillIcons: Record<string, LucideIcon> = {
  "Inferences": Brain,
  "Central Ideas and Details": Target,
  "Command of Evidence": Scale,
  "Words in Context": Type,
  "Text Structure and Purpose": Layers,
  "Cross-Text Connections": Link2,
  "Cross-text Connections": Link2,
  "Rhetorical Synthesis": Sparkles,
  "Transitions": PenTool,
  "Boundaries": CheckCircle,
  "Form, Structure, and Sense": FileText,
};

export const SkillCard = ({ skill, domain, totalCount, attemptedCount, recentAccuracy, index }: SkillCardProps) => {
  const skillSlug = skill.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const Icon = skillIcons[skill] || Target;

  const completionRate = totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0;

  return (
    <Link to={`/skill/${skillSlug}`} state={{ skill, domain }}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-3xl bg-white p-5 transition-all duration-300 shadow-sm transform-gpu will-change-transform h-full flex flex-col justify-between",
          "hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
        )}
      >
        {/* Top-right question count */}
        <div className="absolute top-5 right-4 px-3 py-1 text-xs text-[#75757A]">
          {totalCount} question{totalCount !== 1 ? "s" : ""}
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform transform-gpu",
              domainIconColors[domain] || "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="h-6 w-6 transform-gpu" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium leading-tight text-[#1D1D1F] line-clamp-2">
                {skill}
              </h3>
            </div>

            <div className="mt-2 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#75757A]">Completion</span>
                <span className="text-xs font-medium text-[#1D1D1F]">{Math.round(completionRate)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#75757A]">Accuracy</span>
                <span className={cn(
                  "text-xs font-medium",
                  attemptedCount >= 1 ? (recentAccuracy >= 80 ? "text-green-600" : recentAccuracy >= 50 ? "text-orange-500" : "text-red-500") : "text-muted-foreground",
                )}>
                  {attemptedCount >= 1 ? `${Math.round(recentAccuracy)}%` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
