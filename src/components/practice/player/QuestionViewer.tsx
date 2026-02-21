import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";

interface QuestionViewerProps {
    currentIndex: number;
    currentQuestion: SATQuestion;
    selectedAnswer: ChoiceKey | null | undefined;
    width: number;
    flagged: Set<string>;
    strikethroughMode: boolean;
    eliminated: Set<string>;
    onToggleFlag: () => void;
    onToggleStrikethrough: () => void;
    onAnswer: (choice: ChoiceKey) => void;
    onEliminate: (e: React.MouseEvent, choice: string) => void;
}

export const QuestionViewer = ({
    currentIndex,
    currentQuestion,
    selectedAnswer,
    width,
    flagged,
    strikethroughMode,
    eliminated,
    onToggleFlag,
    onToggleStrikethrough,
    onAnswer,
    onEliminate,
}: QuestionViewerProps) => {
    return (
        <div className="flex flex-col bg-white" style={{ width: `${width}%` }}>
            {/* Question Content */}
            <ScrollArea className="flex-1">
                <div className="pt-[4.5rem] px-32 pb-10">
                    {/* Question Header - Now inside scroll area for alignment */}
                    <div className="m-0">
                        <div className="bg-[#f0f0f0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center bg-brand-black text-white font-bold text-[1.2rem] rounded-none">
                                    {currentIndex + 1}
                                </div>
                                <button
                                    onClick={onToggleFlag}
                                    className="flex items-center gap-2 px-2 group text-brand-black transition-none"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        className={cn(
                                            "h-5 w-5",
                                            flagged.has(currentQuestion.question_id)
                                                ? "fill-[#ac1e23]"
                                                : "fill-white group-hover:fill-[#d9d9d9]",
                                        )}
                                    >
                                        <path d="M19 3H5v18l7-5 7 5V3z" />
                                    </svg>
                                    <span
                                        className={cn(
                                            "text-[1.05rem] mt-0.5",
                                            flagged.has(currentQuestion.question_id)
                                                ? "font-bold underline decoration-1 underline-offset-[3px]"
                                                : "font-normal group-hover:font-semibold",
                                        )}
                                    >
                                        Mark for Review
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center pr-2 relative group/tooltip">
                                {/* Strikethrough Tooltip */}
                                <div className="absolute bottom-full right-0 mb-3 invisible group-hover/tooltip:visible z-[60] pointer-events-none">
                                    <div className="relative bg-[#444] text-white text-[1rem] leading-[1.3] px-4 py-3 rounded-[10px] shadow-xl w-[210px] font-sans font-medium text-left">
                                        Cross out answer choices you think are wrong.
                                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-[#444] rotate-45 transform" />
                                    </div>
                                </div>
                                <button
                                    onClick={onToggleStrikethrough}
                                    className={cn(
                                        "group/abc flex h-[26px] w-auto min-w-[34px] items-center justify-center rounded-[4px] px-1 font-bold text-xs border border-brand-black shadow-sm transition-none",
                                        strikethroughMode
                                            ? "bg-brand-blue text-white hover:bg-[#d9d9d9] hover:text-brand-black"
                                            : "bg-white text-brand-black hover:bg-[#d9d9d9]",
                                    )}
                                    title="Strikethrough Mode Toggle"
                                >
                                    <div className="relative">
                                        <span>ABC</span>
                                        <div
                                            className={cn(
                                                "absolute top-1/2 left-[-2px] right-[-2px] h-[1.5px] -translate-y-1/2 rotate-[-15deg] transition-none",
                                                strikethroughMode
                                                    ? "bg-white group-hover/abc:bg-brand-black"
                                                    : "bg-brand-black",
                                            )}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="h-[1px] bg-white" />
                        <div
                            className="border-b-[2px] border-dashed border-brand-black"
                            style={{
                                borderImage:
                                    "repeating-linear-gradient(to right, #1D1D1F, #1D1D1F 32px, transparent 32px, transparent 34px) 1",
                            }}
                        />
                    </div>

                    <h2 className="mt-4 mb-4 font-cb-serif text-[1.3rem] font-normal leading-[1.3] text-brand-black">
                        {currentQuestion.question_prompt}
                    </h2>

                    <div className="space-y-3">
                        {(Object.entries(currentQuestion.choices) as [ChoiceKey, string][]).map(([key, value], idx) => {
                            const isSelected = selectedAnswer === key;
                            const isEliminated = eliminated.has(key);
                            const letter = String.fromCharCode(65 + idx);

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        "flex items-center gap-2 w-full relative transition-none",
                                        strikethroughMode ? "pr-16" : "pr-0",
                                    )}
                                >
                                    {/* Elimination Toggle Circle/Undo Link */}
                                    {strikethroughMode && (
                                        <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center z-20">
                                            <button
                                                onClick={e => onEliminate(e, key)}
                                                className={cn(
                                                    "transition-none",
                                                    isEliminated
                                                        ? "text-brand-black underline font-bold text-[15px]"
                                                        : "flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-brand-black bg-white text-neutral-600 hover:bg-[#d9d9d9] shadow-sm overflow-visible",
                                                )}
                                            >
                                                {isEliminated ? (
                                                    "Undo"
                                                ) : (
                                                    <div className="relative flex items-center justify-center w-full h-full">
                                                        <span className="text-[0.75rem] font-bold font-cb-sans">
                                                            {letter}
                                                        </span>
                                                        <div className="absolute left-[-5px] right-[-5px] top-1/2 h-[1.5px] bg-neutral-700 -translate-y-1/2" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => onAnswer(key)}
                                        disabled={isEliminated}
                                        className={cn(
                                            "flex-1 flex items-start gap-4 rounded-[10px] border-[1.5px] px-4 py-3 text-left relative overflow-visible bg-white transition-none group",
                                            isSelected
                                                ? "border-brand-blue ring-1 ring-brand-blue"
                                                : "border-brand-black hover:bg-[#f0f0f0]",
                                            isEliminated && "cursor-not-allowed pointer-events-none",
                                        )}
                                    >
                                        {/* Cross-out line through the whole block */}
                                        {isEliminated && (
                                            <div className="absolute left-[-6px] right-[-6px] top-1/2 h-[2px] bg-brand-black -translate-y-1/2 z-10" />
                                        )}

                                        <div
                                            className={cn(
                                                "flex-1 flex items-start gap-4",
                                                isEliminated && "opacity-30 grayscale",
                                            )}
                                        >
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-black text-[0.95rem] font-bold font-cb-sans bg-white mt-0.5">
                                                <span
                                                    className={cn(
                                                        "flex h-full w-full items-center justify-center rounded-full transition-colors",
                                                        isSelected ? "bg-brand-blue text-white" : "text-brand-black",
                                                    )}
                                                >
                                                    {letter}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-[1.3rem] leading-[1.3] pt-0.5 font-cb-serif">
                                                {value}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
