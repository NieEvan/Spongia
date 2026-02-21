import { Card } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import type { SATQuestion, ChoiceKey } from "@/types/sat";

interface QuestionPreviewCardProps {
  question: SATQuestion;
  index: number;
}

export const QuestionPreviewCard = ({ question, index }: QuestionPreviewCardProps) => {
  return (
    <Card className="overflow-hidden border bg-card rounded-3xl">
      {/* Mini Header */}
      <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2">
        <span className="text-[16px] text-muted-foreground">{question.skill}</span>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Passage Panel */}
        <div className="flex-1 border-b p-4 lg:border-b-0 lg:border-r">
          <p className="text-[16px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {question.passage_text}
          </p>
        </div>

        {/* Question Panel */}
        <div className="flex-1 p-4">
          <h4 className="mb-4 text-[16px] font-semibold leading-snug">
            {question.question_prompt}
          </h4>

          <div className="space-y-2">
            {(Object.entries(question.choices) as [ChoiceKey, string][]).map(
              ([key, value]) => {
                return (
                  <div
                    key={key}
                    className="flex w-full items-start gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-[16px]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-[16px] font-medium text-muted-foreground transition-colors">
                      {key}
                    </span>
                    <span className="flex-1 pt-0.5">{value}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
