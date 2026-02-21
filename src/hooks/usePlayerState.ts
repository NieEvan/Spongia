import { Phase } from "@/components/practice/types";
import { ChoiceKey, SATQuestion } from "@/types/sat";
import { useCallback, useEffect, useRef, useState } from "react";

interface UsePlayerStateProps {
    questions: SATQuestion[];
    timed: boolean;
    timedDuration?: number;
}

export const usePlayerState = ({ questions, timed, timedDuration }: UsePlayerStateProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, ChoiceKey | null>>({});
    const [phase, setPhase] = useState<Phase>("practice");
    const [timeRemaining, setTimeRemaining] = useState(timedDuration ? timedDuration * 60 : questions.length * 75);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [eliminated, setEliminated] = useState<Record<string, Set<string>>>({});
    const [strikethroughMode, setStrikethroughMode] = useState(false);
    const [highlightModeActive, setHighlightModeActive] = useState(false);
    const [navigatorOpen, setNavigatorOpen] = useState(false);
    const navigatorRef = useRef<HTMLDivElement>(null);

    // Timer logic
    useEffect(() => {
        if (!timed || timeRemaining <= 0 || (phase !== "practice" && phase !== "review")) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [timed, timeRemaining, phase]);

    const handleAnswer = useCallback(
        (choice: ChoiceKey) => {
            if (phase !== "practice") return;
            const currentQuestion = questions[currentIndex];
            setAnswers(prev => ({
                ...prev,
                [currentQuestion.question_id]: choice,
            }));
        },
        [questions, currentIndex, phase],
    );

    const handleEliminate = (e: React.MouseEvent, choice: string) => {
        e.stopPropagation();
        const currentQuestion = questions[currentIndex];
        const isNowEliminated = !eliminated[currentQuestion.question_id]?.has(choice);

        setEliminated(prev => {
            const currentSet = new Set(prev[currentQuestion.question_id] || []);
            if (currentSet.has(choice)) {
                currentSet.delete(choice);
            } else {
                currentSet.add(choice);
            }
            return {
                ...prev,
                [currentQuestion.question_id]: currentSet,
            };
        });

        if (isNowEliminated && answers[currentQuestion.question_id] === choice) {
            setAnswers(prev => ({ ...prev, [currentQuestion.question_id]: null }));
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setPhase("review");
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const toggleFlag = () => {
        const currentQuestion = questions[currentIndex];
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestion.question_id)) {
                next.delete(currentQuestion.question_id);
            } else {
                next.add(currentQuestion.question_id);
            }
            return next;
        });
    };

    const goToQuestion = (index: number) => {
        setCurrentIndex(index);
        setNavigatorOpen(false);
        setPhase("practice");
    };

    return {
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
    };
};
