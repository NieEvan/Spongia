import { useState, useEffect, useCallback, useMemo } from "react";
import type { SATQuestion, ChoiceKey } from "@/types/sat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import questionsData from "@/data/sat_questions_dataset.json";
import { useValidQuestionIds } from "./useQuestions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface QuestionResult {
  questionId: string;
  selectedAnswer: ChoiceKey;
  isCorrect: boolean;
  answeredAt: number; // timestamp
  domain: string;
  skill: string;
  difficulty: string;
}

export interface ProgressData {
  results: Record<string, QuestionResult>;
}

const STORAGE_KEY = "sat-practice-progress";

const getStoredProgress = (): ProgressData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse progress data:", e);
  }
  return { results: {} };
};

const saveProgressToStorage = (data: ProgressData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save progress:", e);
  }
};

export const useProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Progress Query
  const { data: progress = getStoredProgress(), isLoading } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      if (!user) return getStoredProgress();

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const results: Record<string, QuestionResult> = {};
      data?.forEach((row) => {
        results[row.question_id] = {
          questionId: row.question_id,
          selectedAnswer: row.selected_answer as ChoiceKey,
          isCorrect: row.is_correct,
          answeredAt: new Date(row.answered_at).getTime(),
          domain: row.domain,
          skill: row.skill,
          difficulty: row.difficulty,
        };
      });

      const progressData = { results };
      saveProgressToStorage(progressData);
      return progressData;
    },
    enabled: true, // Always enabled, but queryFn handles null user
    staleTime: 5 * 60 * 1000,
  });

  const recordAnswer = useCallback(
    async (question: SATQuestion, selectedAnswer: ChoiceKey) => {
      const isCorrect = selectedAnswer === question.correct_answer;
      const result: QuestionResult = {
        questionId: question.question_id,
        selectedAnswer,
        isCorrect,
        answeredAt: Date.now(),
        domain: question.domain,
        skill: question.skill,
        difficulty: question.difficulty,
      };

      // Optimistic update for local storage and React Query cache
      const currentProgress = queryClient.getQueryData<ProgressData>(["progress", user?.id]) || progress;
      const updatedProgress = {
        ...currentProgress,
        results: {
          ...currentProgress.results,
          [question.question_id]: result,
        },
      };

      queryClient.setQueryData(["progress", user?.id], updatedProgress);
      saveProgressToStorage(updatedProgress);

      if (user) {
        try {
          await supabase.from("user_progress").upsert(
            {
              user_id: user.id,
              question_id: question.question_id,
              selected_answer: selectedAnswer,
              is_correct: isCorrect,
              answered_at: new Date().toISOString(),
              domain: question.domain,
              skill: question.skill,
              difficulty: question.difficulty,
            },
            { onConflict: "user_id,question_id" }
          );
          // Invalidate leaderboard so score updates immediately
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        } catch (e) {
          console.error("Failed to sync progress to Supabase:", e);
        }
      }

      return isCorrect;
    },
    [user, queryClient, progress]
  );

  const clearProgress = useCallback(async () => {
    queryClient.setQueryData(["progress", user?.id], { results: {} });
    saveProgressToStorage({ results: {} });

    if (user) {
      try {
        await supabase.from("user_progress").delete().eq("user_id", user.id);
      } catch (e) {
        console.error("Failed to clear progress in Supabase:", e);
      }
    }
  }, [user, queryClient]);

  const refresh = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
  }, [user, queryClient]);

  return {
    progress,
    recordAnswer,
    clearProgress,
    refresh,
    isLoading
  };
};

export const useProgressStats = () => {
  const { progress, refresh } = useProgress();
  const { user } = useAuth();

  const validQuestionIds = useValidQuestionIds();

  const allResults = Object.values(progress.results);
  const results = allResults.filter(r => validQuestionIds.has(r.questionId));

  const attempted = results.length;
  // Sort results by accumulated timestamp descending (newest first)
  const sortedResults = [...results].sort((a, b) => b.answeredAt - a.answeredAt);

  // 1. Overall Recent Accuracy (Last 50 questions)
  const recentWindow = sortedResults.slice(0, 50);
  const recentCorrect = recentWindow.filter(r => r.isCorrect).length;
  const recentAttempted = recentWindow.length;
  // This is the specific metric requested for the Progress Tracker
  const recentAccuracy = recentAttempted > 0
    ? Math.round((recentCorrect / recentAttempted) * 100)
    : 0;

  // Lifetime stats for legacy uses if needed, or we can repurpose 'accuracy'
  const lifetimeCorrect = results.filter((r) => r.isCorrect).length;
  const lifetimeIncorrect = attempted - lifetimeCorrect;
  const lifetimeAccuracy = attempted > 0 ? Math.round((lifetimeCorrect / attempted) * 100) : 0;

  const totalQuestionsPerSkill = useMemo(() => {
    const counts: Record<string, number> = {};
    (questionsData as SATQuestion[]).forEach((q) => {
      const skill = q.skill.toLowerCase() === "cross-text connections"
        ? "Cross-Text Connections"
        : q.skill;
      counts[skill] = (counts[skill] || 0) + 1;
    });
    return counts;
  }, []);

  const skillStats: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    const skill = r.skill.toLowerCase() === "cross-text connections"
      ? "Cross-Text Connections"
      : r.skill;
    if (!skillStats[skill]) {
      skillStats[skill] = { correct: 0, total: 0 };
    }
    skillStats[skill].total++;
    if (r.isCorrect) skillStats[skill].correct++;
  });

  // Calculate recent stats per skill for Weakness section
  const skillResultsMap: Record<string, typeof results> = {};
  sortedResults.forEach(r => {
    const skill = r.skill.toLowerCase() === "cross-text connections"
      ? "Cross-Text Connections"
      : r.skill;
    if (!skillResultsMap[skill]) skillResultsMap[skill] = [];
    skillResultsMap[skill].push(r);
  });

  const skillRecentStats: Record<string, { accuracy: number; total: number }> = {};
  Object.keys(skillResultsMap).forEach(skill => {
    const skillRes = skillResultsMap[skill];
    const total = skillRes.length;
    // Take last 10
    const window = skillRes.slice(0, 10);
    const windowCorrect = window.filter(r => r.isCorrect).length;
    const windowAccuracy = window.length > 0 ? (windowCorrect / window.length) * 100 : 0;

    skillRecentStats[skill] = {
      accuracy: windowAccuracy,
      total
    };
  });

  const masteredSkills = Object.entries(skillStats).filter(([skill, s]) => {
    const totalInSkill = totalQuestionsPerSkill[skill] || 1;
    return s.correct >= totalInSkill * 0.8;
  });
  const mastered = masteredSkills.length;

  const totalSkills = Object.keys(totalQuestionsPerSkill).length;
  const needsWork = totalSkills - mastered;

  const domainStats: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    if (!domainStats[r.domain]) {
      domainStats[r.domain] = { correct: 0, total: 0 };
    }
    domainStats[r.domain].total++;
    if (r.isCorrect) domainStats[r.domain].correct++;
  });

  return {
    attempted,
    correct: lifetimeCorrect,
    incorrect: lifetimeIncorrect,
    accuracy: recentAccuracy, // Using recent accuracy as the main "Accuracy" metric
    lifetimeAccuracy,
    mastered,
    needsWork,
    results: progress.results,
    skillStats,
    skillRecentStats,
    domainStats,
    refresh,
  };
};
