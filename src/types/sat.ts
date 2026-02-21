export interface SATQuestion {
  question_id: string;
  assessment: string;
  test: string;
  domain: string;
  skill: string;
  difficulty: "Easy" | "Medium" | "Hard";
  passage_text: string;
  question_prompt: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  subject_area?: string;
  subtopic?: string;
}

export type ChoiceKey = "A" | "B" | "C" | "D";

export interface PracticeSession {
  questions: SATQuestion[];
  currentIndex: number;
  answers: Record<string, ChoiceKey | null>;
  timed: boolean;
  timeRemaining?: number;
  startTime: Date;
}

export interface FilterState {
  domains: string[];
  skills: string[];
  difficulties: string[];
  subject_areas: string[];
  subtopics: string[];
  question_prompts: string[];
}
