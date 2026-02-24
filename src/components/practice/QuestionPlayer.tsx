import { useProgress } from "@/hooks/useProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReviewPhase } from "./ReviewPhase";
import { SummaryPhase } from "./SummaryPhase";

// Sub-components
import { ExitConfirmModal } from "./player/ExitConfirmModal";
import { PassageViewer } from "./player/PassageViewer";
import { PlayerFooter } from "./player/PlayerFooter";
import { PlayerHeader } from "./player/PlayerHeader";
import { QuestionViewer } from "./player/QuestionViewer";

// Hooks and Types
import { useAnnotations } from "@/hooks/useAnnotations";
import { usePlayerState } from "@/hooks/usePlayerState";
import { useSplitter } from "@/hooks/useSplitter";
import { QuestionPlayerProps } from "./types";

export const QuestionPlayer = ({ questions, timed = false, timedDuration, onExit }: QuestionPlayerProps) => {
    // Main State
    const {
        currentIndex,
        setCurrentIndex,
        answers,
        setAnswers,
        phase,
        setPhase,
        timeRemaining,
        flagged,
        eliminated,
        strikethroughMode,
        setStrikethroughMode,
        highlightModeActive,
        setHighlightModeActive,
        navigatorOpen,
        setNavigatorOpen,
        navigatorRef,
        handleAnswer,
        handleEliminate,
        handleNext,
        handlePrev,
        toggleFlag,
        goToQuestion,
    } = usePlayerState({ questions, timed, timedDuration });

    const currentQuestion = questions[currentIndex];
    const { recordAnswer } = useProgress();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Splitter logic
    const { leftWidth, startResizing } = useSplitter();

    // Annotations logic
    const passageRef = useRef<HTMLDivElement>(null);
    const {
        annotations,
        selection, // Exposed for external click-outside check
        showUnderlineMenu,
        setShowUnderlineMenu,
        setSelection,
        handleSelection,
        handleAnnotationClick,
        addAnnotation,
        removeAnnotationsInRange,
    } = useAnnotations({
        currentQuestionId: currentQuestion.question_id,
        passageRef,
        highlightModeActive,
    });

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Close navigator
            if (navigatorRef.current && !navigatorRef.current.contains(event.target as Node)) {
                if (!target.closest("[data-navigator-trigger]")) {
                    setNavigatorOpen(false);
                }
            }

            // Close selection toolbar if clicking outside toolbar or annotations
            if (!target.closest(".annotation-toolbar") && !target.closest(".annotated-span")) {
                setSelection(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [navigatorRef, setNavigatorOpen, setSelection]);

    const handleSubmit = useCallback(() => {
        questions.forEach(q => {
            const answer = answers[q.question_id];
            // Record answer if exists, otherwise record as SKIPPED to count towards daily limit
            recordAnswer(q, (answer || "SKIPPED") as any);
        });
        setPhase("summary");
    }, [questions, answers, recordAnswer, setPhase]);

    // Auto-submit when time is up
    useEffect(() => {
        if (timed && timeRemaining === 0 && (phase === "practice" || phase === "review")) {
            handleSubmit();
        }
    }, [timeRemaining, timed, phase, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const correctCount = Object.entries(answers).filter(
        ([id, answer]) => questions.find(q => q.question_id === id)?.correct_answer === answer,
    ).length;

    if (phase === "review")
        return (
            <ReviewPhase
                questions={questions}
                answers={answers}
                flagged={flagged}
                timeRemaining={timeRemaining}
                formatTime={formatTime}
                onExit={onExit}
                goToQuestion={goToQuestion}
                handleSubmit={handleSubmit}
                timed={timed}
            />
        );

    if (phase === "summary")
        return (
            <SummaryPhase
                questions={questions}
                answers={answers}
                flagged={flagged}
                correctCount={correctCount}
                onExit={onExit}
            />
        );

    return (
        <div className="flex h-screen flex-col bg-white text-[#1e1e1e] font-cb-sans selection:bg-blue-100">
            <PlayerHeader
                timed={timed}
                timeRemaining={timeRemaining}
                highlightModeActive={highlightModeActive}
                setHighlightModeActive={setHighlightModeActive}
                onExitConfirm={() => setShowExitConfirm(true)}
                formatTime={formatTime}
            />

            <ExitConfirmModal
                show={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                onConfirm={handleSubmit}
            />

            <div className="flex flex-1 overflow-hidden">
                <PassageViewer
                    passageText={currentQuestion.passage_text}
                    leftWidth={leftWidth}
                    passageRef={passageRef}
                    annotations={annotations[currentQuestion.question_id] || []}
                    selection={selection}
                    highlightModeActive={highlightModeActive}
                    showUnderlineMenu={showUnderlineMenu}
                    setShowUnderlineMenu={setShowUnderlineMenu}
                    onSelectionChange={handleSelection}
                    onAnnotationClick={handleAnnotationClick}
                    onAddAnnotation={addAnnotation}
                    onRemoveAnnotation={removeAnnotationsInRange}
                    onStartResizing={startResizing}
                />

                <QuestionViewer
                    currentIndex={currentIndex}
                    currentQuestion={currentQuestion}
                    selectedAnswer={answers[currentQuestion.question_id]}
                    width={100 - leftWidth}
                    flagged={flagged}
                    strikethroughMode={strikethroughMode}
                    eliminated={eliminated[currentQuestion.question_id] || new Set()}
                    onToggleFlag={toggleFlag}
                    onToggleStrikethrough={() => setStrikethroughMode(!strikethroughMode)}
                    onAnswer={handleAnswer}
                    onEliminate={handleEliminate}
                />
            </div>

            <PlayerFooter
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                navigatorOpen={navigatorOpen}
                setNavigatorOpen={setNavigatorOpen}
                navigatorRef={navigatorRef}
                questions={questions}
                answers={answers}
                flagged={flagged}
                onNavigate={goToQuestion}
                onReviewPhase={() => setPhase("review")}
                onPrev={handlePrev}
                onNext={handleNext}
            />
        </div>
    );
};
