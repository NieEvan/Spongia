import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuestionStats } from "@/hooks/useQuestions";
import { useProgressStats } from "@/hooks/useProgress";

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
  const progressPercent = totalQuestions > 0
      ? Math.min(100, Math.round((progressStats.attempted / totalQuestions) * 100))
    : 0;

  const domains = Object.keys(stats.domainCounts);

  const headerMessage = '';

  return (
    <div className={cn(
      "rounded-3xl bg-white h-full pt-5 pb-5 pl-6 pr-6",
      compact ? "" : ""
    )}>
      {/* Header Row */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Your Progress</h2>
          <p className="text-sm text-[#75757A] mt-1">{headerMessage}</p>
        </div>
        <div className="text-right">
          <div className={compact ? "text-2xl font-bold text-[#1D1D1F]" : "text-4xl font-bold text-[#1D1D1F]"}>{progressPercent}%</div>
          <p className={compact ? "text-xs text-[#75757A]" : "text-sm text-[#75757A]"}>Complete</p>
        </div>
      </div>

      {/* Main Progress Bar */}
      <Progress value={progressPercent} className={compact ? "mb-2 h-1.5 bg-[#f5f5f7]" : "h-2 bg-[#f5f5f7]"} />

      {/* Stats Row */}
      <div className={compact ? "mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5" : "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"}>
        <div>
          <p className="text-xs text-muted-foreground">Questions</p>
          <p className={compact ? "text-lg font-bold text-[#1d1d1f]" : "text-2xl font-bold text-[#1d1d1f]"}>{totalQuestions}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Attempted</p>
          <p className={compact ? "text-lg font-bold text-[#1d1d1f]" : "text-2xl font-bold text-[#1d1d1f]"}>{progressStats.attempted}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Accuracy</p>
          <p className={compact ? "text-lg font-bold text-[#1d1d1f]" : "text-2xl font-bold text-[#1d1d1f]"}>{progressStats.accuracy}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Mastered</p>
          <p className={compact ? "text-lg font-bold text-green-600" : "text-2xl font-bold text-green-600"}>{progressStats.mastered}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Needs Work</p>
          <p className={compact ? "text-lg font-bold text-red-600" : "text-2xl font-bold text-red-600"}>{progressStats.needsWork}</p>
        </div>
      </div>

      {/* Domain progress bars removed as per UI update */}
    </div>
  );
};
