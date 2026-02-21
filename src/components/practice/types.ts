import { SATQuestion } from "@/types/sat";

export interface QuestionPlayerProps {
    questions: SATQuestion[];
    timed?: boolean;
    timedDuration?: number; // in minutes
    onExit: () => void;
}

export type Phase = "practice" | "review" | "summary";

export interface Annotation {
    id: string;
    start: number;
    end: number;
    color?: string;
    underlineStyle?: "solid" | "dashed" | "dotted" | "none";
}

export type SelectionState = {
    start: number;
    end: number;
    rect: { left: number; top: number; width: number };
    editingId?: string;
} | null;
