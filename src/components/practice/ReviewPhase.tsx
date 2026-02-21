import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";

interface ReviewPhaseProps {
    questions: SATQuestion[];
    answers: Record<string, ChoiceKey | null>;
    flagged: Set<string>;
    timeRemaining: number;
    formatTime: (seconds: number) => string;
    onExit: () => void;
    goToQuestion: (index: number) => void;
    handleSubmit: () => void;
    timed: boolean;
}

export const ReviewPhase = ({
    questions,
    answers,
    flagged,
    timeRemaining,
    formatTime,
    onExit,
    goToQuestion,
    handleSubmit,
    timed,
}: ReviewPhaseProps) => {
    return (
        <div className="flex h-screen flex-col bg-white text-[#1e1e1e] font-cb-sans">
            {/* HEADER - Same as testing interface */}
            <header
                className="relative z-10 flex h-[5.25rem] shrink-0 items-center justify-between bg-[#e6edf8] px-8"
                style={{
                    borderBottom: "2px dashed #1e1e1e",
                    borderImage:
                        "repeating-linear-gradient(to right, #1e1e1e, #1e1e1e 32px, transparent 32px, transparent 34px) 1",
                }}
            >
                <div className="flex flex-col">
                    <h1 className="font-semibold text-[1.3rem] leading-none tracking-tight text-[#1e1e1e]">
                        Reading and Writing
                    </h1>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    {timed && (
                        <>
                            <div className="text-[1.5rem] font-semibold text-[#1e1e1e] leading-none mb-1">
                                {formatTime(timeRemaining)}
                            </div>
                            <button className="rounded-full bg-[#e6edf8] px-3.5 h-[23px] flex items-center justify-center text-[0.85rem] font-bold text-[#1e1e1e] ring-1 ring-[#1e1e1e] ring-inset hover:ring-2 hover:bg-[#f0f0f0] transition-all duration-200 ease-in-out">
                                Hide
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-6 text-neutral-600">
                    <button className="flex flex-col items-center gap-0.5 group/tool px-2 py-1 transition-colors text-neutral-600 hover:text-[#1e1e1e]">
                        <div className="h-[22px] w-[22px]" /> {/* Spacer */}
                        <span className="text-[0.85rem] font-medium hidden sm:block mt-0.5 opacity-0">Calculator</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 group/tool px-2 py-1 transition-colors text-neutral-600 hover:text-[#1e1e1e]">
                        <div className="h-[22px] w-[22px]" /> {/* Spacer */}
                        <span className="text-[0.85rem] font-medium hidden sm:block mt-0.5 opacity-0">Reference</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 group/tool px-2 py-1 transition-colors text-neutral-600 hover:text-[#1e1e1e]">
                        <div className="h-[22px] w-[22px]" /> {/* Spacer */}
                        <span className="text-[0.85rem] font-medium hidden sm:block mt-0.5 opacity-0">More</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT - Enlarged Navigator Style */}
            <div className="flex-1 overflow-y-auto bg-[#fafafa] flex items-start justify-center pt-20 pb-10">
                <div className="w-full max-w-[680px] mx-auto px-8">
                    {/* Title Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-[2rem] font-semibold text-[#1e1e1e] mb-3">Check Your Work</h2>
                        <p className="text-[1.05rem] text-neutral-600 leading-relaxed px-4">
                            On test day, you won't be able to move on to the next module until time expires.
                        </p>
                        <p className="text-[1.05rem] text-neutral-600 leading-relaxed px-4 mt-1">
                            For these practice questions, you can click <span className="font-bold">Next</span> when
                            you're ready to move on.
                        </p>
                    </div>

                    {/* Questions Section Card */}
                    <div className="bg-white rounded-[14px] border border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
                        {/* Title and Legend on same line */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[1.3rem] font-bold text-[#1e1e1e] leading-tight">
                                Reading and Writing
                            </h3>
                            <div className="flex items-center gap-6 text-[1rem] text-[#1e1e1e]">
                                <span className="flex items-center gap-2 font-normal text-neutral-700">
                                    <div className="w-5 h-5 border border-dashed border-neutral-700 rounded-none" />
                                    <span>Unanswered</span>
                                </span>
                                <span className="flex items-center gap-2 font-normal text-neutral-700">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-[#ac1e23] text-[#ac1e23]"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                    >
                                        <path d="M19 3H5v18l7-5 7 5V3z" />
                                    </svg>
                                    <span>For Review</span>
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-neutral-300 w-full mb-8" />

                        {/* Question Grid */}
                        <div className="grid grid-cols-10 gap-x-3 gap-y-5 mb-0 px-2">
                            {questions.map((q: SATQuestion, idx: number) => {
                                const isAnswered = answers[q.question_id] != null;
                                const isFlagged = flagged.has(q.question_id);

                                return (
                                    <button
                                        key={q.question_id}
                                        onClick={() => goToQuestion(idx)}
                                        className={cn(
                                            "relative flex h-11 w-11 items-center justify-center text-[1.05rem] font-bold transition-none",
                                            isAnswered
                                                ? "bg-brand-blue text-white"
                                                : "bg-white border border-dashed border-neutral-700 text-brand-blue",
                                        )}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-2 -right-2">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4 w-4 fill-[#ac1e23] text-[#ac1e23]"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="square"
                                                    strokeLinejoin="miter"
                                                >
                                                    <path d="M19 3H5v18l7-5 7 5V3z" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER - Same as testing interface */}
            <footer
                className="relative z-20 flex h-[60px] shrink-0 items-center justify-between bg-[#e6edf8] px-6"
                style={{
                    borderTop: "2px dashed #1e1e1e",
                    borderImage:
                        "repeating-linear-gradient(to right, #1e1e1e, #1e1e1e 32px, transparent 32px, transparent 34px) 1",
                }}
            >
                <div className="font-bold text-[#1e1e1e] w-32 truncate">{/* Name Removed */}</div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                <div className="w-40 flex justify-end mr-4">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => goToQuestion(questions.length - 1)}
                            className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-6 py-1.5 text-[0.95rem] font-bold shadow-sm"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-6 py-1.5 text-[0.95rem] font-bold shadow-sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
