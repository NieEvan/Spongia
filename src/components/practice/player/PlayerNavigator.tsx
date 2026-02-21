import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef } from "react";

interface PlayerNavigatorProps {
    isOpen: boolean;
    onClose: () => void;
    questions: SATQuestion[];
    currentIndex: number;
    answers: Record<string, ChoiceKey | null>;
    flagged: Set<string>;
    onNavigate: (index: number) => void;
    onReviewPhase: () => void;
}

export const PlayerNavigator = forwardRef<HTMLDivElement, PlayerNavigatorProps>(
    ({ isOpen, onClose, questions, currentIndex, answers, flagged, onNavigate, onReviewPhase }, ref) => {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 1, y: -20, x: "-50%", scale: 1 }}
                        animate={{ opacity: 1, y: -20, x: "-50%", scale: 1 }}
                        exit={{
                            opacity: 0,
                            x: "-50%",
                            scale: 0.98,
                            transition: { duration: 0 },
                        }}
                        className="fixed bottom-8 left-1/2 mb-4 w-[480px] rounded-[14px] border border-neutral-200 bg-white p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15)] z-[100]"
                    >
                        {/* Header */}
                        <div className="relative mb-4 text-center">
                            <h3 className="text-[1.2rem] font-bold text-brand-black leading-tight px-8">
                                Reading and Writing Questions
                            </h3>
                            <button
                                onClick={onClose}
                                className="absolute right-0 top-0 text-neutral-500 hover:text-brand-black"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="border-t border-neutral-300 w-full" />

                        <div className="flex items-center justify-center gap-6 py-3 text-[0.9rem] text-brand-black">
                            <span className="flex items-center gap-1.5 font-normal text-neutral-700">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1D1D1F"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="1.5" fill="#1D1D1F" stroke="none" />
                                </svg>
                                <span>Current</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-normal text-neutral-700">
                                <div className="w-4 h-4 border border-dashed border-neutral-700 rounded-none" />
                                <span>Unanswered</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-normal text-neutral-700">
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
                                <span>For Review</span>
                            </span>
                        </div>

                        <div className="border-t border-neutral-300 w-full mb-6" />

                        <div className="grid grid-cols-10 gap-x-2 gap-y-4 mb-8 px-2">
                            {questions.map((q, idx) => {
                                const isCurrent = idx === currentIndex;
                                const isAnswered = answers[q.question_id] != null;
                                const isFlagged = flagged.has(q.question_id);

                                return (
                                    <button
                                        key={q.question_id}
                                        onClick={() => onNavigate(idx)}
                                        className={cn(
                                            "relative flex h-8 w-8 items-center justify-center text-[1.05rem] font-bold transition-none",
                                            isAnswered
                                                ? "bg-brand-blue text-white"
                                                : "bg-white border border-dashed border-neutral-700 text-brand-blue",
                                            isCurrent && "underline decoration-[3px] underline-offset-2",
                                        )}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1.5 -right-1.5">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-3.5 w-3.5 fill-[#ac1e23] text-[#ac1e23]"
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

                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    onReviewPhase();
                                    onClose();
                                }}
                                className="rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-brand-black font-bold px-10 py-1.5 text-[0.9rem]"
                            >
                                Go to Review Page
                            </button>
                        </div>

                        {/* Popover Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-neutral-200 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    },
);

PlayerNavigator.displayName = "PlayerNavigator";
