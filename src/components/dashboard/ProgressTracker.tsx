import { Progress } from "@/components/ui/progress";
import { useProgressStats } from "@/hooks/useProgress";
import { useQuestionStats } from "@/hooks/useQuestions";
import { cn } from "@/lib/utils";

const domainColors: Record<string, string> = {
  "Information and Ideas": "bg-domain-ideas",
  "Craft and Structure": "bg-domain-craft",
  "Expression of Ideas": "bg-domain-expression",
  "Standard English Conventions": "bg-domain-conventions",
};

const domainDotColors: Record<string, string> = {
  "Information and Ideas": "bg-domain-ideas",
  "Craft and Structure": "bg-domain-craft",
  "Expression of Ideas": "bg-domain-expression",
  "Standard English Conventions": "bg-domain-conventions",
};

export const ProgressTracker = ({ compact = false }: { compact?: boolean }) => {
  const stats = useQuestionStats();
  const progressStats = useProgressStats();

  const totalQuestions = stats.totalQuestions;
  const progressPercent =
    totalQuestions > 0 ? Math.min(100, Math.round((progressStats.attempted / totalQuestions) * 100)) : 0;

  const domains = Object.keys(stats.domainCounts);

  const headerMessage = "";

  return (
    <div
      className={cn(
        "rounded-[24px] bg-white pt-6 pb-6 pl-6 pr-6 shadow-sm border border-slate-100 flex flex-col justify-start hover:shadow-md transition-shadow",
        compact ? "" : "grow",
      )}
    >
      <div>
        {/* Header Row */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Your Progress</h2>
            <p className="text-sm text-[#75757A] mt-1">{headerMessage}</p>
          </div>
          <div className="text-right">
            <div className={compact ? "text-2xl font-bold text-[#1D1D1F]" : "text-4xl font-bold text-[#1D1D1F]"}>
              {progressPercent}%
            </div>
            <p className={compact ? "text-xs text-[#75757A]" : "text-sm text-[#75757A]"}>Complete</p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <Progress value={progressPercent} className={compact ? "mb-2 h-1.5 bg-[#f5f5f7]" : "h-2 bg-[#f5f5f7]"} />
      </div>
    </div>
  );
};
