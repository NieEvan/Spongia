import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RefObject } from "react";
import { PlayerNavigator } from "./PlayerNavigator";

interface PlayerFooterProps {
    currentIndex: number;
    totalQuestions: number;
    navigatorOpen: boolean;
    setNavigatorOpen: (open: boolean) => void;
    navigatorRef: RefObject<HTMLDivElement>;
    questions: SATQuestion[];
    answers: Record<string, ChoiceKey | null>;
    flagged: Set<string>;
    onNavigate: (index: number) => void;
    onReviewPhase: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export const PlayerFooter = ({
    currentIndex,
    totalQuestions,
    navigatorOpen,
    setNavigatorOpen,
    navigatorRef,
    questions,
    answers,
    flagged,
    onNavigate,
    onReviewPhase,
    onPrev,
    onNext,
}: PlayerFooterProps) => {
    return (
        <footer
            className="relative z-20 flex h-[60px] shrink-0 items-center justify-between bg-[#e6edf8] px-6"
            style={{
                borderTop: "2px dashed #1e1e1e",
                borderImage:
                    "repeating-linear-gradient(to right, #1e1e1e, #1e1e1e 32px, transparent 32px, transparent 34px) 1",
            }}
        >
            <div className="font-bold text-[#1e1e1e] w-32 truncate">{/* Name Removed */}</div>
            {/* Navigator Trigger */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
                <button
                    data-navigator-trigger
                    onClick={() => setNavigatorOpen(!navigatorOpen)}
                    className={cn(
                        "flex items-center gap-2 rounded bg-[#1e1e1e] px-4 py-1.5 text-[0.95rem] font-bold text-white hover:bg-[#1e1e1e]",
                        navigatorOpen && "bg-[#1e1e1e]",
                    )}
                >
                    Question {currentIndex + 1} of {totalQuestions}
                    {navigatorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>

                {/* Navigator Popover */}
                <PlayerNavigator
                    ref={navigatorRef}
                    isOpen={navigatorOpen}
                    onClose={() => setNavigatorOpen(false)}
                    questions={questions}
                    currentIndex={currentIndex}
                    answers={answers}
                    flagged={flagged}
                    onNavigate={onNavigate}
                    onReviewPhase={onReviewPhase}
                />
            </div>{" "}
            {/* End center wrapper */}
            <div className="w-40 flex justify-end mr-4">
                {" "}
                {/* Right spacer to balance layout if needed, or just standard flex */}
                <div className="flex items-center gap-4">
                    {currentIndex > 0 && (
                        <Button
                            onClick={onPrev}
                            className="bg-[#324dc7] hover:bg-[#283eb1] text-white rounded-full px-6 py-1.5 text-[0.95rem] font-bold shadow-sm"
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={onNext}
                        className="bg-[#324dc7] hover:bg-[#283eb1] text-white rounded-full px-6 py-1.5 text-[0.95rem] font-bold shadow-sm"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </footer>
    );
};
