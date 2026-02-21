import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: "Easy" | "Medium" | "Hard";
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const styles = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <Badge variant="outline" className={cn("font-bold text-sm px-3 py-1.5 rounded-xl border transition-all duration-200", styles[difficulty], className)}>
      {difficulty}
    </Badge>
  );
};
