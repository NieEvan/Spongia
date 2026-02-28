import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { cn } from "@/lib/utils";
import type { ChoiceKey, SATQuestion } from "@/types/sat";
import { Lightbulb, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

    // sentinel and sticky state for the number blocks -> compact blob behavior
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isStuck, setIsStuck] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [merging, setMerging] = useState(false);
    const [showBlob, setShowBlob] = useState(false);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            setIsStuck(!entry.isIntersecting);
        }, { threshold: 0 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // trigger merge animation when becoming stuck
    useEffect(() => {
        let t1: any;
        let t2: any;
        if (isStuck) {
            // start shrinking/merging animation
            setMerging(true);
            t1 = setTimeout(() => setShowBlob(true), 220);
        } else {
            // hide blob then restore numbers
            setShowBlob(false);
            t2 = setTimeout(() => setMerging(false), 220);
        }
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isStuck]);

    const renderExplanation = (q: SATQuestion, isCorrect: boolean) => {
        const explanation = q.explanation;

        if (typeof explanation === "string") {
            return <>{explanation}</>;
        }

        // explanation is an object mapping choice keys to strings
        const choiceOrder: ChoiceKey[] = ["A", "B", "C", "D"];
        const explObj = explanation as Record<ChoiceKey, string>;

        // If dataset still has a single-string explanation, render it normally
        // For per-choice object, render as bullet points (no paragraph above)
        if (typeof explanation === "object") {
            return (
                <ul className="list-none m-0 p-0 flex flex-col gap-3">
                    {choiceOrder.map((key, idx) => {
                        const text = explObj[key];
                        if (!text) return null;

                        const isKeyCorrect = key === q.correct_answer;

                        return (
                            <li key={key} className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        "mt-1.5 flex-shrink-0 h-3 w-3 rounded-full",
                                        isKeyCorrect ? "bg-green-500" : "bg-red-500",
                                    )}
                                />
                                <div className={cn(isKeyCorrect ? "text-green-900 font-medium" : "text-neutral-700", "text-[16px]")}>{text}</div>
                            </li>
                        );
                    })}
                </ul>
            );
        }

        return <div className="text-[16px] text-neutral-700">{String(explanation)}</div>;
    };

    return (
        <div className="fixed inset-0 z-50 bg-neutral-50 font-sans animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
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

                {/* Question Blocks Summary - Legend (not sticky) */}
                <div className="w-full py-4">
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
                </div>

                {/* (removed upper divider) */}

                {/* Sentinel used to detect when the number blocks hit the top */}
                <div ref={sentinelRef} className="h-px" />

                {/* Sticky area: contains either number blocks or the compact 'Questions' blob when stuck */}
                <div className="sticky top-0 z-20 bg-transparent py-4">
                    <div className="w-full">
                        <div className="flex justify-center relative items-center">
                            {/* Number blocks (always present) - animate away when merging */}
                            <div
                                className={cn(
                                    "flex flex-wrap justify-center transition-all duration-250 ease-in-out",
                                    merging ? "opacity-0 scale-75 -translate-y-2 gap-0" : "opacity-100 scale-100 gap-3",
                                )}
                            >
                                {questions.map((q, i) => {
                                    const userAnswer = answers[q.question_id];
                                    const isCorrect = userAnswer === q.correct_answer;
                                    const isSkipped = !answers[q.question_id];
                                    const borderRadius = questions.length > 15 ? "rounded-lg" : "rounded-xl";
                                    return (
                                        <button
                                            key={q.question_id}
                                            onClick={() => scrollToQuestion(q.question_id)}
                                            className={cn(
                                                "flex items-center justify-center text-base font-semibold border-[2px] shadow-sm select-none shrink-0 transition-transform duration-150 ease-in-out hover:scale-110 cursor-pointer",
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

                            {/* Blob that appears after merge */}
                            <div
                                className={cn(
                                    // pin to the top center of the sticky area so the top edge remains fixed
                                    "absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-start transition-all duration-250 ease-in-out",
                                    showBlob ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none",
                                )}
                            >
                                {/* use JS hover state to reliably control expansion */}
                                <Blob
                                    visible={showBlob}
                                    questions={questions}
                                    answers={answers}
                                    onSelect={(id: string) => scrollToQuestion(id)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-width divider below the number blocks (not sticky) */}
                <div className="relative">
                    <div className="w-screen left-1/2 relative md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 transform">
                        <div className="border-t border-neutral-200" />
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
                                    <div className="font-serif text-[14px] leading-relaxed text-[#1e1e1e]">
                                        {q.passage_text}
                                    </div>

                                    {/* Question & Choices */}
                                    <div className="flex flex-col gap-6">
                                        <div className="font-bold text-[14px] text-[#1e1e1e]">
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
                                                                "flex items-start gap-4 p-4 rounded-xl border text-[14px] leading-snug transition-colors",
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
                                                                    "text-[14px]",
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
                                        "mt-8 p-5 rounded-xl border flex items-start gap-3",
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
                                        <div className="text-[14px] text-neutral-700 leading-relaxed">
                                            {renderExplanation(q, isCorrect)}
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

// Small helper component for the expanding blob so we can manage hover state reliably
function Blob({
    visible,
    questions,
    answers,
    onSelect,
}: {
    visible: boolean;
    questions: SATQuestion[];
    answers: Record<string, ChoiceKey | null>;
    onSelect: (id: string) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const [sizeStyle, setSizeStyle] = useState<{ width: number; height: number; innerWidth: number } | null>(null);

    useEffect(() => {
        if (!hovered) return setSizeStyle(null);

        // compute sizes in px
        const btnSizePx = questions.length > 15 ? 32 : 40; // w-8=32, w-10=40
        const gapPx = 12; // tailwind gap-3
        const paddingH = 48; // px-6 => 24px each side
        const paddingV = 20; // increased vertical padding to avoid clipping
        const labelTop = 10; // top-2.5 ~ 10px
        const extraBuffer = 20; // extra bottom buffer

        const totalButtonsWidth = questions.length * btnSizePx + Math.max(0, questions.length - 1) * gapPx;
        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
        const maxWidth = Math.min(viewportWidth - 80, 900);

        const desiredWidth = Math.min(totalButtonsWidth + paddingH, maxWidth);
        const innerWidth = Math.max(120, desiredWidth - paddingH);

        const rows = Math.max(1, Math.ceil(totalButtonsWidth / innerWidth));
        const desiredHeight = labelTop + paddingV * 2 + rows * btnSizePx + Math.max(0, rows - 1) * gapPx + extraBuffer;

        setSizeStyle({ width: Math.round(desiredWidth), height: Math.round(desiredHeight), innerWidth: Math.round(innerWidth) });

        const onResize = () => {
            const vp = window.innerWidth;
            const maxW = Math.min(vp - 80, 900);
            const dW = Math.min(totalButtonsWidth + paddingH, maxW);
            const iW = Math.max(120, dW - paddingH);
            const r = Math.max(1, Math.ceil(totalButtonsWidth / iW));
            const dH = labelTop + paddingV * 2 + r * btnSizePx + Math.max(0, r - 1) * gapPx + extraBuffer;
            setSizeStyle({ width: Math.round(dW), height: Math.round(dH), innerWidth: Math.round(iW) });
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [hovered, questions.length]);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            onClick={() => setHovered((v) => !v)}
            className={cn(
                "relative overflow-hidden bg-white shadow-md transition-all duration-200 ease-in-out",
                visible ? "opacity-100 scale-100 pointer-events-auto origin-top" : "opacity-0 scale-90 pointer-events-none",
                hovered ? "rounded-xl px-6 py-0" : "w-32 h-10 rounded-full px-0 py-0",
            )}
            style={hovered && sizeStyle ? { width: `${sizeStyle.width}px`, height: `${sizeStyle.height}px` } : undefined}
            tabIndex={0}
            role="button"
            aria-expanded={hovered}
        >
            {/* label is absolutely positioned so its top stays fixed while the blob expands downward */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 text-sm font-semibold">Questions</div>

            <div
                className={cn(
                    "absolute left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3 transition-all duration-200 ease-in-out",
                    hovered ? "opacity-100 translate-y-0 mt-12" : "opacity-0 -translate-y-1 mt-0",
                )}
                style={hovered && sizeStyle ? { width: `${sizeStyle.innerWidth}px` } : undefined}
            >
                {questions.map((q, i) => {
                    const userAnswer = answers[q.question_id];
                    const isCorrect = userAnswer === q.correct_answer;
                    const isSkipped = !answers[q.question_id];
                    const borderRadius = questions.length > 15 ? "rounded-lg" : "rounded-xl";
                    const sizeClass = questions.length > 15 ? "w-8 h-8 text-sm" : "w-10 h-10 text-sm";

                    return (
                        <button
                            key={q.question_id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(q.question_id);
                            }}
                            className={cn(
                                // same styles as the top number blocks, slightly smaller
                                "flex items-center justify-center font-semibold border-[2px] shadow-sm select-none shrink-0 transition-transform duration-150 ease-in-out hover:scale-110 cursor-pointer",
                                sizeClass,
                                borderRadius,
                                // base background + hover background to match top blocks
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
    );
}
