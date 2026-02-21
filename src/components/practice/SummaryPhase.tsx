import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";
import { Lightbulb, X } from "lucide-react";

interface SummaryPhaseProps {
    questions: SATQuestion[];
    answers: Record<string, ChoiceKey | null>;
    flagged: Set<string>;
    correctCount: number;
    onExit: () => void;
}

export const SummaryPhase = ({ questions, answers, flagged, correctCount, onExit }: SummaryPhaseProps) => {
    const scrollToQuestion = (questionId: string) => {
        const element = document.getElementById(`question-${questionId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            // Add a small offset to account for sticky header
            setTimeout(() => {
                window.scrollBy({ top: -100, behavior: "smooth" });
            }, 200);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white font-sans animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-10">
                <Button variant="ghost" className="h-10 w-10 rounded-full hover:bg-neutral-100" onClick={onExit}>
                    <X className="h-6 w-6 text-neutral-500" />
                </Button>
            </div>

            {/* Content wrapper - single scrollable container */}
            <div className="w-full max-w-7xl mx-auto px-12 md:px-20">
                {/* Score Section - Scrolls away */}
                <div className="pt-16 pb-6">
                    <div className="text-center mb-6 select-none">
                        <h2 className="text-lg font-medium text-neutral-500 mb-2">Practice Session Summary</h2>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1e1e1e]">
                            Score: <span className="text-accent">{correctCount}</span>
                            <span className="text ml-3">/ {questions.length}</span>
                        </h1>
                    </div>
                </div>

                {/* Question Blocks Summary - Sticky */}
                <div className="sticky top-0 z-20 bg-white py-6 border-b border-neutral-200">
                    {/* Title and Legend on same line */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center gap-6 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-green-100 border-[2px] border-green-400" />
                                <span>Correct</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-red-100/60 border-[2px] border-red-300" />
                                <span>Incorrect</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-neutral-50 border-[2px] border-neutral-200" />
                                <span>Unanswered</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="flex flex-wrap justify-center gap-3">
                            {questions.map((q, i) => {
                                const userAnswer = answers[q.question_id];
                                const isCorrect = userAnswer === q.correct_answer;
                                const isSkipped = !answers[q.question_id];
                                const borderRadius = questions.length > 15 ? "rounded-md" : "rounded-lg";
                                return (
                                    <button
                                        key={q.question_id}
                                        onClick={() => scrollToQuestion(q.question_id)}
                                        className={cn(
                                            "flex items-center justify-center text-base font-semibold border-[2px] shadow-sm select-none shrink-0 transition-transform hover:scale-110 cursor-pointer",
                                            questions.length > 15 ? "w-8 h-8 text-sm" : "w-12 h-12 text-base",
                                            borderRadius,
                                            isCorrect
                                                ? "bg-green-100 border-green-400 text-green-700 hover:bg-green-200"
                                                : isSkipped
                                                  ? "bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-neutral-100"
                                                  : "bg-red-100/60 border-red-300 text-red-700 hover:bg-red-200/60",
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Detailed Review */}
                <div className="py-10 space-y-8 pb-20 bg-neutral-50/30">
                    <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6">Review Questions</h2>

                    {questions.map((q, i) => {
                        const userAnswer = answers[q.question_id];
                        const isCorrect = userAnswer === q.correct_answer;

                        return (
                            <div
                                key={q.question_id}
                                id={`question-${q.question_id}`}
                                className="border border-neutral-200 rounded-xl p-6 md:p-8 shadow-sm bg-white scroll-mt-[140px]"
                            >
                                {/* Header Line */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[1.1rem] font-bold text-[#1e1e1e]">Question {i + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 text-sm font-medium text-neutral-600 bg-neutral-100 border border-neutral-300 rounded-full">
                                            {q.skill}
                                        </span>
                                        <DifficultyBadge difficulty={q.difficulty} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Passage */}
                                    <div className="font-serif text-[1.1rem] leading-relaxed text-[#1e1e1e]">
                                        {q.passage_text}
                                    </div>

                                    {/* Question & Choices */}
                                    <div className="flex flex-col gap-6">
                                        <div className="font-bold text-[1.1rem] text-[#1e1e1e]">
                                            {q.question_prompt}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {(Object.entries(q.choices) as [ChoiceKey, string][]).map(
                                                ([key, text], idx) => {
                                                    const isKeyCorrect = key === q.correct_answer;
                                                    const isKeySelected = key === userAnswer;

                                                    let containerClass =
                                                        "bg-white border-neutral-200 hover:bg-neutral-50";
                                                    let letterBgClass = "bg-neutral-100 text-neutral-500";

                                                    if (isKeyCorrect) {
                                                        containerClass = "bg-green-100 border-green-500/40";
                                                        letterBgClass = "bg-green-200 text-green-800 border-green-400";
                                                    } else if (isKeySelected && !isCorrect) {
                                                        containerClass = "bg-red-100/60 border-red-300";
                                                        letterBgClass = "bg-red-200 text-red-800 border-red-400";
                                                    }

                                                    return (
                                                        <div
                                                            key={key}
                                                            className={cn(
                                                                "flex items-start gap-4 p-4 rounded-lg border text-[0.95rem] leading-snug transition-colors",
                                                                containerClass,
                                                            )}
                                                        >
                                                            <div className="shrink-0 mt-0.5">
                                                                <div
                                                                    className={cn(
                                                                        "h-6 w-6 rounded flex items-center justify-center font-bold text-xs border",
                                                                        letterBgClass,
                                                                    )}
                                                                >
                                                                    {String.fromCharCode(65 + idx)}
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={cn(
                                                                    isKeyCorrect
                                                                        ? "text-green-900 font-medium"
                                                                        : isKeySelected && !isCorrect
                                                                          ? "text-red-900"
                                                                          : "text-neutral-700",
                                                                )}
                                                            >
                                                                {text}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Explanation Box - Now spans full width */}
                                <div
                                    className={cn(
                                        "mt-8 p-5 rounded-lg border flex items-start gap-3",
                                        isCorrect
                                            ? "bg-green-100/60 border-green-500/40"
                                            : "bg-red-100/60 border-red-300",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "shrink-0 mt-0.5 p-1 rounded-full",
                                            isCorrect ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700",
                                        )}
                                    >
                                        <Lightbulb className="h-4 w-4" />
                                    </div>
                                    <div className="pr-5 pb-5">
                                        <div
                                            className={cn(
                                                "font-bold mb-1 text-[1.3rem]",
                                                isCorrect ? "text-green-900" : "text-red-900",
                                            )}
                                        >
                                            {isCorrect ? "Correct answer" : "Incorrect"}
                                        </div>
                                        <div className="text-[1.3rem] text-neutral-700 leading-relaxed">
                                            {q.explanation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
