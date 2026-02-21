import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuestionPlayer } from "@/components/practice/QuestionPlayer";
import { useQuestionsBySkill } from "@/hooks/useQuestions";
import { useProgressStats } from "@/hooks/useProgress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SATQuestion } from "@/types/sat";

const SkillPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { skillSlug } = useParams();

  const { skill = "", domain = "" } = (location.state as { skill?: string; domain?: string }) || {};

  const allSkillQuestions = useQuestionsBySkill(skill);
  const { results, skillRecentStats, refresh: refreshProgress } = useProgressStats();
  const [practiceMode, setPracticeMode] = useState<"idle" | "timed" | "untimed">("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<SATQuestion[]>([]);
  const [untimedQuestionCount, setUntimedQuestionCount] = useState(10);
  const [timedQuestionCount, setTimedQuestionCount] = useState(10);
  const [timedDuration, setTimedDuration] = useState(12);

  // Track when the user started a "Practice Again" session for a mastered skill
  const [reviewStartTime, setReviewStartTime] = useState<number | null>(() => {
    const stored = localStorage.getItem(`review-start-${skillSlug}`);
    return stored ? parseInt(stored) : null;
  });

  // Filter out already answered questions
  const { questions, isMastered } = useMemo(() => {
    const answeredIds = new Set(Object.keys(results));
    const unattempted = allSkillQuestions.filter((q) => !answeredIds.has(q.question_id));
    const isMastered = unattempted.length === 0 && allSkillQuestions.length > 0;

    // If mastered, we show questions that haven't been answered since the review started
    if (isMastered && reviewStartTime) {
      const reviewQuestions = allSkillQuestions.filter(q => {
        const result = results[q.question_id];
        return !result || result.answeredAt < reviewStartTime;
      });
      return { questions: reviewQuestions, isMastered };
    }

    return { questions: unattempted, isMastered };
  }, [allSkillQuestions, results, reviewStartTime, skillSlug]);

  // Calculate progress stats for this skill
  const totalSkillQuestions = allSkillQuestions.length;
  const answeredCount = allSkillQuestions.filter((q) => results[q.question_id]).length;
  const progressPercent = totalSkillQuestions > 0 ? (answeredCount / totalSkillQuestions) * 100 : 0;

  const skillRecent = skillRecentStats[skill] || { accuracy: 0, total: 0 };
  const recentAccuracy = skillRecent.accuracy;

  const startPractice = (timed: boolean, questionCount: number, shuffle: boolean = true) => {
    setIsStarting(true);

    // Small delay to show loading screen
    setTimeout(() => {
      let qs = [...questions];
      if (shuffle) {
        qs = qs.sort(() => Math.random() - 0.5);
      }
      qs = qs.slice(0, questionCount);
      setPracticeQuestions(qs);
      setPracticeMode(timed ? "timed" : "untimed");
      setIsStarting(false);
    }, 1500);
  };

  const exitPractice = async () => {
    await refreshProgress();
    setPracticeMode("idle");
    setPracticeQuestions([]);
  };



  const startReview = () => {
    const now = Date.now();
    setReviewStartTime(now);
    localStorage.setItem(`review-start-${skillSlug}`, now.toString());
  };



  if (!skill) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-brand-black">Skill not found</h1>
            <p className="mt-2 text-brand-grey font-medium">Please select a skill from the dashboard.</p>
            <Button className="mt-6 bg-brand-blue hover:bg-brand-blue/90" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isStarting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg font-sans">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-brand-border border-t-brand-blue animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-brand-blue rounded-full animate-ping" />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[1.8rem] font-bold text-brand-black tracking-tight">Launching Practice</h2>
            <p className="text-brand-grey text-[1.1rem]">Preparing your questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (practiceMode !== "idle") {
    return (
      <QuestionPlayer
        questions={practiceQuestions}
        timed={practiceMode === "timed"}
        timedDuration={timedDuration}
        onExit={exitPractice}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 pt-12 md:pt-20 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 -ml-2 text-brand-grey hover:bg-white hover:text-brand-black rounded-xl"
            onClick={() => navigate("/skills")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Skills
          </Button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-brand-black">
              {skill}
            </h1>
          </div>

          {/* Skill Progress */}
          <div className="mb-12">
            <Card className="p-8 border-none shadow-sm rounded-3xl bg-white">
              <div className="grid md:grid-cols-2 gap-10">
                {/* Completion Section */}
                <div>
                  <div className="flex items-center justify-between mb-4 text-[#1D1D1F]">
                    <h2 className="text-base font-bold">Completion</h2>
                    <span className="text-base font-bold">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-[#f5f5f7]" indicatorClassName="bg-brand-blue" />
                  <p className="mt-3 text-xs text-[#75757A] text-right">
                    {answeredCount} of {totalSkillQuestions} questions completed
                  </p>
                </div>

                {/* Accuracy Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-[#1D1D1F]">Recent Accuracy</h2>
                    <span className={cn(
                      "text-base font-bold",
                      answeredCount > 0 ? (recentAccuracy >= 80 ? "text-green-600" : recentAccuracy >= 50 ? "text-orange-500" : "text-red-500") : "text-brand-grey"
                    )}>
                      {answeredCount > 0 ? `${Math.round(recentAccuracy)}%` : "—"}
                    </span>
                  </div>
                  <Progress
                    value={answeredCount > 0 ? recentAccuracy : 0}
                    className="h-2 bg-[#f5f5f7]"
                    indicatorClassName={cn(
                      recentAccuracy >= 80 ? "bg-green-500" : recentAccuracy >= 50 ? "bg-orange-500" : "bg-red-500"
                    )}
                  />
                  <p className="mt-3 text-xs text-[#75757A] text-right">
                    Average accuracy of the last {Math.min(answeredCount, 10)} questions
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Practice Options */}
          <div>
            <h2 className="text-2xl font-bold text-brand-black mb-6">Start Practice</h2>

            {questions.length === 0 ? (
              <Card className="p-10 border-none shadow-sm rounded-3xl bg-white text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-green-50 rounded-2xl mb-6">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-black mb-2">Skill Completed!</h3>
                <p className="text-brand-grey mb-8">
                  You've completed all questions for this skill.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-xl border-brand-border text-brand-black font-bold"
                    onClick={() => navigate("/skills")}
                  >
                    Back to Skills
                  </Button>
                  <Button
                    className="h-12 px-8 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                    onClick={startReview}
                  >
                    Practice Again
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Untimed Practice Card */}
                <Card className="p-8 rounded-3xl bg-white border-none shadow-md">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-xl bg-brand-bg p-3 text-brand-black">
                      <Play className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-brand-black">Untimed Practice</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-base font-medium text-brand-grey">Questions</span>
                      <Input
                        type="number"
                        min={1}
                        max={Math.min(100, questions.length)}
                        value={untimedQuestionCount}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                          setUntimedQuestionCount(Math.min(val, questions.length));
                        }}
                        className="w-20 rounded-xl bg-brand-bg border-none ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50 focus:outline-none transition-all"
                      />
                    </div>

                    <Button
                      className="w-full gap-2 bg-brand-blue hover:bg-[#1436cc] hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98] duration-200 transform-gpu text-base font-medium text-white rounded-xl"
                      onClick={() => startPractice(false, Math.min(untimedQuestionCount, questions.length))}
                      disabled={questions.length === 0}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start
                    </Button>
                  </div>
                </Card>

                {/* Timed Practice Card */}
                <Card className="p-8 rounded-3xl bg-white border-none shadow-md">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-xl bg-brand-bg p-3 text-brand-black">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-brand-black">Timed Practice</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-brand-grey whitespace-nowrap">Questions</span>
                        <Input
                          type="number"
                          min={1}
                          max={Math.min(100, questions.length)}
                          value={timedQuestionCount}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                            setTimedQuestionCount(Math.min(val, questions.length));
                          }}
                          className="w-20 rounded-xl bg-brand-bg border-none ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-brand-grey whitespace-nowrap">Time</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={120}
                            value={timedDuration}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 1));
                              setTimedDuration(val);
                            }}
                            className="w-20 rounded-xl bg-brand-bg border-none ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50 focus:outline-none transition-all"
                          />
                          <span className="text-base font-medium text-brand-grey">min</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2 bg-brand-blue hover:bg-[#1436cc] hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98] duration-200 transform-gpu text-base font-medium text-white rounded-xl"
                      onClick={() => startPractice(true, Math.min(timedQuestionCount, questions.length))}
                      disabled={questions.length === 0}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillPractice;
