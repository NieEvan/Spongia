import { useMemo } from "react";
import questionsData from "@/data/sat_questions_dataset.json";
import type { SATQuestion, FilterState } from "@/types/sat";

const questions = questionsData as SATQuestion[];

export const normalizeSkill = (skill: string) => {
  if (skill.toLowerCase() === "cross-text connections") {
    return "Cross-Text Connections";
  }
  return skill;
};

export const useQuestions = () => {
  return useMemo(() => questions, []);
};

export const useValidQuestionIds = () => {
  return useMemo(() => new Set(questions.map(q => q.question_id)), []);
};

export const useFilteredQuestions = (filters: FilterState) => {
  const allQuestions = useQuestions();

  return useMemo(() => {
    return allQuestions.filter((q) => {
      if (filters.domains.length > 0 && !filters.domains.includes(q.domain)) {
        return false;
      }
      if (filters.skills.length > 0 && !filters.skills.includes(normalizeSkill(q.skill))) {
        return false;
      }
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(q.difficulty)) {
        return false;
      }
      if (filters.subject_areas.length > 0 && q.subject_area && !filters.subject_areas.includes(q.subject_area)) {
        return false;
      }
      if (filters.subtopics.length > 0 && q.subtopic && !filters.subtopics.includes(q.subtopic)) {
        return false;
      }
      if (filters.question_prompts.length > 0) {
        const isExactMatch = filters.question_prompts.includes(q.question_prompt);
        // "Other" logic: if "Other" is selected, match questions not in the top list? 
        // For now, let's just stick to direct inclusion, and we can handle "Other" in the UI or here if we know the top list.
        // Let's assume the filter values are the exact prompt strings.
        if (!isExactMatch) return false;
      }
      return true;
    });
  }, [allQuestions, filters]);
};

// Constants based on generate_test.py
export const KNOWN_SUBJECTS = [
  "Literature",
  "Science",
  "History / Social Studies",
  "Humanities"
];

export const KNOWN_DOMAINS = [
  "Information and Ideas",
  "Craft and Structure",
  "Expression of Ideas",
  "Standard English Conventions"
];

// normalizeSkill moved to top

export const useQuestionsBySkill = (skill: string) => {
  const allQuestions = useQuestions();
  return useMemo(() => allQuestions.filter((q) => normalizeSkill(q.skill) === skill), [allQuestions, skill]);
};

export const useQuestionStats = () => {
  const allQuestions = useQuestions();

  return useMemo(() => {
    // Normalize skill names (fix inconsistent casing like "Cross-Text" vs "Cross-text")
    const domains = [...new Set(allQuestions.map((q) => q.domain))];
    const skills = [...new Set(allQuestions.map((q) => normalizeSkill(q.skill)))];
    const difficulties = ["Easy", "Medium", "Hard"];

    const skillCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const difficultyCounts: Record<string, number> = {};



    const subjectAreaCounts: Record<string, number> = {};
    const subtopicCounts: Record<string, number> = {};
    const questionPromptCounts: Record<string, number> = {};

    allQuestions.forEach((q) => {
      const normalizedSkill = normalizeSkill(q.skill);
      skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
      domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;

      if (q.subject_area) {
        subjectAreaCounts[q.subject_area] = (subjectAreaCounts[q.subject_area] || 0) + 1;
      }
      if (q.subtopic) {
        subtopicCounts[q.subtopic] = (subtopicCounts[q.subtopic] || 0) + 1;
      }
      questionPromptCounts[q.question_prompt] = (questionPromptCounts[q.question_prompt] || 0) + 1;
    });

    const subject_areas = Object.keys(subjectAreaCounts).sort();
    const subtopics = Object.keys(subtopicCounts).sort();
    // Get top 20 prompts
    const question_prompts = Object.entries(questionPromptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([prompt]) => prompt);

    const skillsByDomain: Record<string, string[]> = {};
    const subtopicsBySubject: Record<string, string[]> = {};

    allQuestions.forEach((q) => {
      const normalizedSkill = normalizeSkill(q.skill);
      if (!skillsByDomain[q.domain]) {
        skillsByDomain[q.domain] = [];
      }
      if (!skillsByDomain[q.domain].includes(normalizedSkill)) {
        skillsByDomain[q.domain].push(normalizedSkill);
      }

      if (q.subject_area && q.subtopic) {
        if (!subtopicsBySubject[q.subject_area]) {
          subtopicsBySubject[q.subject_area] = [];
        }
        if (!subtopicsBySubject[q.subject_area].includes(q.subtopic)) {
          subtopicsBySubject[q.subject_area].push(q.subtopic);
        }
      }
    });

    const finalSubjectAreas = Array.from(new Set([...KNOWN_SUBJECTS, ...subject_areas])).sort();

    return {
      totalQuestions: allQuestions.length,
      domains,
      skills,
      difficulties,
      skillCounts,
      domainCounts,
      difficultyCounts,
      skillsByDomain,
      subject_areas: finalSubjectAreas,
      subtopics,
      subtopicsBySubject,
      question_prompts,
      subjectAreaCounts,
      subtopicCounts,
      questionPromptCounts,
    };
  }, [allQuestions]);
};
