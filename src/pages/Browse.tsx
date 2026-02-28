import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Play, Clock, X, Eye, EyeOff, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuestionPlayer } from "@/components/practice/QuestionPlayer";
import { QuestionPreviewCard } from "@/components/browse/QuestionPreviewCard";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { useFilteredQuestions, useQuestionStats } from "@/hooks/useQuestions";
import { useProgress } from "@/hooks/useProgress";
import { QuestionFilters } from "@/components/browse/QuestionFilters";
import { usePaywall } from "@/hooks/usePaywall";
import { Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SATQuestion, FilterState } from "@/types/sat";
import { motion } from "framer-motion";

const QUESTIONS_PER_PAGE = 5;

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stats = useQuestionStats();
  const [filters, setFilters] = useState<FilterState>({
    domains: [],
    skills: [],
    difficulties: [],
    subject_areas: [],
    subtopics: [],
    question_prompts: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [practiceMode, setPracticeMode] = useState<"idle" | "timed" | "untimed">("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<SATQuestion[]>([]);
  const [untimedQuestionCount, setUntimedQuestionCount] = useState(10);
  const [timedQuestionCount, setTimedQuestionCount] = useState(10);
  const [timedDuration, setTimedDuration] = useState(12);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { progress, refresh } = useProgress();
  const [showUnattempted, setShowUnattempted] = useState(false);
  const { isPaid, isLimitReached, remainingQuestions } = usePaywall();
  const { toast } = useToast();

  const filteredQuestions = useFilteredQuestions(filters);

  const searchedQuestions = useMemo(() => {
    let result = filteredQuestions;

    if (showUnattempted) {
      const answeredIds = new Set(Object.keys(progress.results));
      result = result.filter((q) => !answeredIds.has(q.question_id));
    }

    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase();
    return result.filter(
      (q) =>
        q.question_prompt.toLowerCase().includes(query) ||
        q.passage_text.toLowerCase().includes(query) ||
        q.skill.toLowerCase().includes(query)
    );
  }, [filteredQuestions, searchQuery, showUnattempted, progress.results]);

  // Sync practice question counts to max available whenever filters/results change
  useEffect(() => {
    const maxAvailable = searchedQuestions.length;
    const finalLimit = isPaid ? maxAvailable : Math.min(maxAvailable, remainingQuestions);

    setUntimedQuestionCount(prev => {
      if (prev > finalLimit) return Math.max(1, finalLimit);
      return prev || Math.min(10, finalLimit);
    });
    setTimedQuestionCount(prev => {
      if (prev > finalLimit) return Math.max(1, finalLimit);
      return prev || Math.min(10, finalLimit);
    });
  }, [searchedQuestions.length, isPaid, remainingQuestions]);

  // Pagination
  const totalPages = Math.ceil(searchedQuestions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return searchedQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [searchedQuestions, currentPage]);

  // Reset to page 1 when filters/search change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      domains: [],
      skills: [],
      difficulties: [],
      subject_areas: [],
      subtopics: [],
      question_prompts: [] // Reset advanced filters too
    });
    setShowUnattempted(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasAnyFilter =
    filters.domains.length > 0 ||
    filters.skills.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.subject_areas.length > 0 ||
    filters.subtopics.length > 0 ||
    showUnattempted ||
    searchQuery;

  const activeFilterCount =
    filters.domains.length + filters.skills.length + filters.difficulties.length;

  const startPractice = (timed: boolean, questionCount: number) => {
    if (isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "You've practiced 15 questions today. Upgrade to Plus for unlimited access!",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    // Check if the requested number of questions exceeds the remaining quota for unpaid users
    if (!isPaid && questionCount > remainingQuestions) {
      toast({
        title: "Daily Limit",
        description: `You only have ${remainingQuestions} questions left for today. Upgrade for unlimited access!`,
      });
      // Adjust question count to remaining questions
      questionCount = remainingQuestions;
      if (questionCount <= 0) return;
    }

    setIsStarting(true);

    // Small delay to show loading screen
    setTimeout(() => {
      const shuffled = [...searchedQuestions].sort(() => Math.random() - 0.5);
      setPracticeQuestions(shuffled.slice(0, questionCount));
      setPracticeMode(timed ? "timed" : "untimed");
      setIsStarting(false);
    }, 1500);
  };

  const exitPractice = async () => {
    await refresh();
    setPracticeMode("idle");
    setPracticeQuestions([]);
  };

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
            <h2 className="text-[1.8rem] font-bold text-brand-black tracking-tight">Loading Questions</h2>
            <p className="text-brand-grey text-[1.1rem]">Exploring the question bank...</p>
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

      <motion.main
        className="flex-1 pt-12 md:pt-20 p-6 md:p-10 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Browse Questions
            </h1>
            <p className="text-[#75757A] mt-2 text-lg">
              Filter and create tailored practice question sets.
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row items-start">
            {/* Main Content */}
            <div className="flex-1">
              {/* Question Filters */}
              <div className="relative mb-8 bg-white rounded-3xl shadow-sm border border-brand-border">
                <div className="p-6">
                  <QuestionFilters
                    filters={filters}
                    onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      setCurrentPage(1);
                    }}
                    stats={stats}
                    showUnattempted={showUnattempted}
                    onShowUnattemptedChange={(val) => {
                      setShowUnattempted(val);
                      setCurrentPage(1);
                    }}
                    searchQuery={searchQuery}
                    onSearchQueryChange={(val) => {
                      setSearchQuery(val);
                      setCurrentPage(1);
                    }}
                  />

                  <div className="relative flex items-center justify-center mt-8 min-h-[1.25rem]">
                    <div className="absolute left-0">
                      {hasAnyFilter && (
                        <Button
                          variant="ghost"
                          onClick={clearFilters}
                          size="sm"
                          className="text-brand-grey/60 hover:text-destructive h-auto p-0 hover:bg-transparent font-medium text-sm"
                        >
                          Reset filters
                        </Button>
                      )}
                    </div>
                    <p className="text-brand-grey/80 font-medium text-sm">
                      {searchedQuestions.length.toLocaleString()} questions match your criteria
                    </p>
                  </div>
                </div>
              </div>





              {/* Practice Options */}
              {!isPaid && (
                <div className="mb-6 flex items-center justify-between p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                  <div className="flex items-center gap-3 h-5">
                    <span className="text-sm font-semibold text-brand-black">Daily Practice Limit</span>
                    <div className="w-px h-full bg-brand-blue/20" />
                    <span className="text-xs text-brand-blue font-medium h-full flex items-center">
                      Get unlimited access with Premium
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-brand-blue">{remainingQuestions}</span>
                    <span className="text-sm font-medium text-brand-grey">questions left today</span>
                  </div>
                </div>
              )}
              {searchedQuestions.length === 0 ? (
                <Card className="p-12 text-center rounded-3xl">
                  <p className="text-brand-grey">
                    No questions match your filters...
                  </p>
                </Card>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
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
                          max={isPaid ? searchedQuestions.length : Math.min(searchedQuestions.length, remainingQuestions)}
                          value={untimedQuestionCount}
                          onChange={(e) => {
                            const maxVal = isPaid ? searchedQuestions.length : Math.min(searchedQuestions.length, remainingQuestions);
                            const val = Math.max(1, Math.min(maxVal, parseInt(e.target.value) || 1));
                            setUntimedQuestionCount(val);
                          }}
                          className="w-20 rounded-xl bg-brand-bg border-none ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50 focus:outline-none transition-all"
                        />
                      </div>

                      <Button
                        className="w-full gap-2 bg-brand-blue hover:bg-[#1436cc] hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98] duration-200 transform-gpu text-base font-medium text-white rounded-xl"
                        onClick={() => startPractice(false, Math.min(untimedQuestionCount, searchedQuestions.length))}
                        disabled={searchedQuestions.length === 0}
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
                            max={isPaid ? searchedQuestions.length : Math.min(searchedQuestions.length, remainingQuestions)}
                            value={timedQuestionCount}
                            onChange={(e) => {
                              const maxVal = isPaid ? searchedQuestions.length : Math.min(searchedQuestions.length, remainingQuestions);
                              const val = Math.max(1, Math.min(maxVal, parseInt(e.target.value) || 1));
                              setTimedQuestionCount(val);
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
                        onClick={() => startPractice(true, Math.min(timedQuestionCount, searchedQuestions.length))}
                        disabled={searchedQuestions.length === 0}
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Start
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Show Questions Button */}
              {searchedQuestions.length > 0 && (
                <div className="mt-8 relative flex items-center justify-center">
                  <Button
                    variant={isPaid ? "outline" : "ghost"}
                    onClick={() => {
                      if (!isPaid) {
                        toast({
                          title: "Premium Feature",
                          description: "Viewing questions list is only available for Plus and Pro members.",
                        });
                        navigate("/pricing");
                        return;
                      }
                      setShowQuestions(!showQuestions);
                    }}
                    className={`gap-2 rounded-xl border-2 bg-white transition-all duration-200 transform-gpu min-w-[210px] text-base font-medium shadow-sm ${!isPaid
                      ? "text-brand-grey/50 border-brand-border/50 cursor-default hover:bg-white hover:text-brand-grey/50"
                      : "text-brand-grey hover:bg-neutral-50 hover:text-brand-black hover:border-brand-border hover:scale-[1.02] active:scale-95"
                      }`}
                  >
                    {showQuestions ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Questions
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Show Questions</span>
                      </>
                    )}
                  </Button>

                  {!isPaid && !showQuestions && (
                    <div className="absolute left-[calc(50%+115px)] flex items-center gap-1 px-1.5 py-0 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 whitespace-nowrap h-[18px]">
                      <Lock className="h-2.5 w-2.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Premium</span>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Question Previews with Pagination */}
              {showQuestions && searchedQuestions.length > 0 && (
                <div className="mt-8 mb-8" id="questions-section">
                  <div className="space-y-4">
                    {paginatedQuestions.map((question, index) => (
                      <QuestionPreviewCard
                        key={question.question_id}
                        question={question}
                        index={(currentPage - 1) * QUESTIONS_PER_PAGE + index}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          document.getElementById("questions-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        disabled={currentPage === 1}
                        className="gap-1 text-brand-grey border-brand-border rounded-xl"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setCurrentPage(pageNum);
                                document.getElementById("questions-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                              className={`w-9 rounded-xl ${currentPage === pageNum ? "bg-brand-blue text-white" : "text-brand-grey border-brand-border"}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          document.getElementById("questions-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        disabled={currentPage === totalPages}
                        className="gap-1 text-brand-grey border-brand-border rounded-xl"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <p className="mt-3 text-center text-sm text-brand-grey font-medium">
                    Showing {(currentPage - 1) * QUESTIONS_PER_PAGE + 1}-
                    {Math.min(currentPage * QUESTIONS_PER_PAGE, searchedQuestions.length)} of{" "}
                    {searchedQuestions.length} questions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Browse;