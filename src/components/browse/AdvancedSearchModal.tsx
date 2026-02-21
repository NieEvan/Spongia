import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { FilterState } from "@/types/sat";
import { SlidersHorizontal, X, Search } from "lucide-react";

interface AdvancedSearchModalProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    stats: {
        difficulties: string[];
        domains: string[];
        skills: string[];
        subject_areas: string[];
        subtopics: string[];
        subtopicsBySubject?: Record<string, string[]>; // Optional to maintain compat if type updates lag
        question_prompts: string[];
    };
    showUnattempted: boolean;
    onShowUnattemptedChange: (val: boolean) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

export const AdvancedSearchModal = ({ filters, onFilterChange, stats, showUnattempted, onShowUnattemptedChange, searchQuery, onSearchQueryChange }: AdvancedSearchModalProps) => {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);
    const [localShowUnattempted, setLocalShowUnattempted] = useState(showUnattempted);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
        setLocalShowUnattempted(showUnattempted);
        setLocalSearchQuery(searchQuery);
    }, [filters, showUnattempted, searchQuery, isOpen]);

    const handleApply = () => {
        onFilterChange(localFilters);
        onShowUnattemptedChange(localShowUnattempted);
        onSearchQueryChange(localSearchQuery);
        setIsOpen(false);
    };

    const handleClear = () => {
        setLocalFilters({
            domains: [],
            skills: [],
            difficulties: [],
            subject_areas: [],
            subtopics: [],
            question_prompts: [],
        });
        setLocalShowUnattempted(false);
        setLocalSearchQuery("");
    };

    const toggleFilter = (type: keyof FilterState, value: string) => {
        setLocalFilters((prev) => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    // Special logic for Subject Areas <-> Subtopics
    const toggleSubjectArea = (subject: string) => {
        const subtopicsForSubject = stats.subtopicsBySubject?.[subject] || [];

        setLocalFilters((prev) => {
            const isCurrentlySelected = prev.subject_areas.includes(subject);

            // If selecting: Add subject AND all its subtopics
            if (!isCurrentlySelected) {
                const newSubtopics = [...new Set([...prev.subtopics, ...subtopicsForSubject])];
                return {
                    ...prev,
                    subject_areas: [...prev.subject_areas, subject],
                    subtopics: newSubtopics
                };
            }
            // If deselecting: Remove subject AND all its subtopics
            else {
                const newSubtopics = prev.subtopics.filter(st => !subtopicsForSubject.includes(st));
                return {
                    ...prev,
                    subject_areas: prev.subject_areas.filter(s => s !== subject),
                    subtopics: newSubtopics
                };
            }
        });
    };

    const toggleSubtopic = (subtopic: string, subjectForSubtopic: string) => {
        setLocalFilters((prev) => {
            const isCurrentlySelected = prev.subtopics.includes(subtopic);
            let newSubtopics: string[];
            let newSubjects = [...prev.subject_areas];

            if (!isCurrentlySelected) {
                // Selecting a subtopic
                newSubtopics = [...prev.subtopics, subtopic];
                // Auto-select parent subject if not already
                if (!newSubjects.includes(subjectForSubtopic)) {
                    newSubjects.push(subjectForSubtopic);
                }
            } else {
                // Deselecting a subtopic
                newSubtopics = prev.subtopics.filter(st => st !== subtopic);
                // Check if any other subtopics for this subject are still selected
                const subtopicsForSubject = stats.subtopicsBySubject?.[subjectForSubtopic] || [];
                const hasRemaining = subtopicsForSubject.some(st => newSubtopics.includes(st));

                // If NO subtopics remain, user requested behavior: "corresponding subject area should also be selected or deselected"
                // Usually if I uncheck the last child, the parent unchecks.
                if (!hasRemaining) {
                    newSubjects = newSubjects.filter(s => s !== subjectForSubtopic);
                }
            }

            return {
                ...prev,
                subtopics: newSubtopics,
                subject_areas: newSubjects
            };
        });
    };

    const hasAdvancedFilters =
        localFilters.subject_areas.length > 0 ||
        localFilters.subtopics.length > 0 ||
        localFilters.question_prompts.length > 0;

    // Helper to get Subject for a Subtopic 
    // (In a real app, this might be a map. iterating is fine for small lists)
    const getSubjectForSubtopic = (subtopic: string) => {
        if (!stats.subtopicsBySubject) return "";
        for (const [subj, subs] of Object.entries(stats.subtopicsBySubject)) {
            if (subs.includes(subtopic)) return subj;
        }
        return "";
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 w-full mt-2 h-12 border-2 bg-white text-muted-foreground hover:text-white hover:bg-brand-blue hover:border-brand-blue hover:scale-[1.02] active:scale-95 transition-all transform-gpu text-base rounded-xl">
                    <SlidersHorizontal className="h-5 w-5" />
                    Advanced Filters
                    {hasAdvancedFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_1px_rgba(34,197,94,0.4)]" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl p-0 gap-0 bg-white shadow-2xl border-border/50 sm:rounded-3xl overflow-hidden font-sans text-foreground [&>button:last-child]:hidden">
                {/* Header */}
                <div className="pl-6 pr-4 py-3 border-b flex items-center justify-between">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                        Filter Questions
                    </DialogTitle>
                    <DialogClose className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                {/* Main Content Area */}
                <ScrollArea className="h-[65vh]">
                    <div className="p-6 space-y-8 bg-white">

                        {/* Top Section: Difficulty, Domains, Skills */}
                        <div className="grid grid-cols-12 gap-8">

                            {/* Left Column: Difficulty & Domains (5 cols) */}
                            <div className="col-span-5 flex flex-col gap-10">

                                {/* Difficulty */}
                                <div className="space-y-3">
                                    <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                        Difficulty
                                    </label>
                                    <div className="flex items-center gap-3">
                                        {["Easy", "Medium", "Hard"].map((diff) => {
                                            const isSelected = localFilters.difficulties.includes(diff);

                                            // Vibrant colors that are visible by default
                                            const styles = {
                                                Easy: isSelected
                                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                                                Medium: isSelected
                                                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                                                Hard: isSelected
                                                    ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                            }[diff as "Easy" | "Medium" | "Hard"];

                                            return (
                                                <button
                                                    key={diff}
                                                    onClick={() => toggleFilter("difficulties", diff)}
                                                    className={`
                                                        px-3 py-1.5 text-sm font-bold rounded-xl border transition-all duration-200 select-none
                                                        ${styles}
                                                    `}
                                                >
                                                    {diff}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Domains */}
                                <div className="space-y-1 flex flex-col">
                                    <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                        Domains
                                    </label>
                                    <div className="flex flex-col gap-1">
                                        {stats.domains.map((domain) => {
                                            const isSelected = localFilters.domains.includes(domain);
                                            return (
                                                <div
                                                    key={domain}
                                                    onClick={() => toggleFilter("domains", domain)}
                                                    className={`
                                                        flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-200
                                                        ${isSelected ? "text-accent font-medium" : "text-foreground/80"}
                                                    `}
                                                >
                                                    <div className={`
                                                        h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? "bg-accent border-accent text-accent-foreground"
                                                            : "border-muted-foreground/30 group-hover:border-foreground/50 bg-transparent"}
                                                    `}>
                                                        {isSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                                    </div>
                                                    <span className={`text-base ${isSelected ? "font-medium" : "font-normal"}`}>{domain}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Skills (7 cols) */}
                            <div className="col-span-7 flex flex-col space-y-1">
                                <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                    Skills
                                </label>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4 content-start">
                                    {stats.skills.map((skill) => {
                                        const isSelected = localFilters.skills.includes(skill);
                                        return (
                                            <div
                                                key={skill}
                                                onClick={() => toggleFilter("skills", skill)}
                                                className={`
                                                    flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-200
                                                    ${isSelected ? "text-accent font-medium" : "text-foreground/80"}
                                                `}
                                            >
                                                <div className={`
                                                    h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                                    ${isSelected
                                                        ? "bg-accent border-accent text-accent-foreground"
                                                        : "border-muted-foreground/30 group-hover:border-foreground/50 bg-transparent"}
                                                `}>
                                                    {isSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                                </div>
                                                <span className={`text-base leading-tight ${isSelected ? "font-medium" : "font-normal"}`}>{skill}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Others Section */}
                                <div className="space-y-1 pt-6 flex flex-col">
                                    <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                        Others
                                    </label>
                                    <div className="flex flex-col gap-1">
                                        <div
                                            onClick={() => setLocalShowUnattempted(!localShowUnattempted)}
                                            className={`
                                                flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-200
                                                ${localShowUnattempted ? "text-accent font-medium" : "text-foreground/80"}
                                            `}
                                        >
                                            <div className={`
                                                h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all
                                                ${localShowUnattempted
                                                    ? "bg-accent border-accent text-accent-foreground"
                                                    : "border-muted-foreground/30 group-hover:border-foreground/50 bg-transparent"}
                                            `}>
                                                {localShowUnattempted && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                            </div>
                                            <span className={`text-base ${localShowUnattempted ? "font-medium" : "font-normal"}`}>New questions only</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-border/50" />

                        {/* Bottom Section: Subjects */}
                        <div className="space-y-4">
                            <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                Subject Areas & Topics
                            </label>
                            <div className="grid grid-cols-4 gap-6">
                                {stats.subject_areas.map((subject) => {
                                    const isSubjectSelected = localFilters.subject_areas.includes(subject);
                                    const subtopics = stats.subtopicsBySubject?.[subject] || [];

                                    return (
                                        <div key={subject} className="flex flex-col gap-3">
                                            {/* Subject Header */}
                                            <div
                                                onClick={() => toggleSubjectArea(subject)}
                                                className={`
                                                    flex items-center gap-2 py-1.5 px-2 -ml-2 rounded-xl cursor-pointer transition-all group hover:bg-neutral-200
                                                    ${isSubjectSelected ? "text-accent font-bold" : "text-foreground"}
                                                `}
                                            >
                                                <div className={`
                                                    h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all
                                                    ${isSubjectSelected
                                                        ? "bg-accent border-accent text-accent-foreground"
                                                        : "border-muted-foreground/30 group-hover:border-foreground/50"}
                                                `}>
                                                    {isSubjectSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                                </div>
                                                <span className="font-bold text-base">{subject}</span>
                                            </div>

                                            {/* Subtopics */}
                                            <div className="flex flex-col gap-0.5">
                                                {subtopics.map((sub) => {
                                                    const isSubSelected = localFilters.subtopics.includes(sub);
                                                    return (
                                                        <div
                                                            key={sub}
                                                            onClick={() => toggleSubtopic(sub, subject)}
                                                            className={`
                                                                flex items-center gap-2.5 px-2 -ml-2 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-200
                                                                ${isSubSelected ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}
                                                            `}
                                                        >
                                                            <div className={`
                                                                h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                                                ${isSubSelected
                                                                    ? "bg-accent border-accent text-accent-foreground"
                                                                    : "border-muted-foreground/30 group-hover:border-foreground/50 bg-transparent"}
                                                            `}>
                                                                {isSubSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                                            </div>
                                                            <span className="text-base leading-relaxed">{sub}</span>
                                                        </div>
                                                    );
                                                })}
                                                {subtopics.length === 0 && (
                                                    <span className="text-base text-muted-foreground/50 italic px-2 py-1">No topics available</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-border/50" />

                        {/* Bottom Section: Search */}
                        <div className="space-y-4">
                            <label className="text-base font-bold text-muted-foreground uppercase tracking-wider select-none">
                                Search Keywords
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search specific keywords in questions..."
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    className="pl-10 h-10 rounded-xl border-input bg-background"
                                />
                                {localSearchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-muted"
                                        onClick={() => setLocalSearchQuery("")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleClear}
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-transparent transition-colors h-10 px-4 text-base rounded-xl"
                    >
                        Reset filters
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            size="sm"
                            className="h-10 text-base rounded-xl border-2 bg-white hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-[1.02] active:scale-95 transition-all duration-200 transform-gpu"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            size="sm"
                            className="bg-brand-blue hover:bg-[#1436cc] hover:scale-[1.02] active:scale-95 transition-all duration-200 transform-gpu text-white shadow-sm h-10 px-8 text-base font-semibold rounded-xl"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
