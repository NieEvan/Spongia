import { useState } from "react";
import { Search, X, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { FilterState } from "@/types/sat";
import { usePaywall } from "@/hooks/usePaywall";

interface QuestionFiltersProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    stats: {
        difficulties: string[];
        domains: string[];
        skills: string[];
        subject_areas: string[];
        subtopics: string[];
        subtopicsBySubject?: Record<string, string[]>;
        question_prompts: string[];
    };
    showUnattempted: boolean;
    onShowUnattemptedChange: (val: boolean) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

export const QuestionFilters = ({ filters, onFilterChange, stats, showUnattempted, onShowUnattemptedChange, searchQuery, onSearchQueryChange }: QuestionFiltersProps) => {
    const { isPaid } = usePaywall();
    const [openSubjects, setOpenSubjects] = useState<string[]>([]);

    const toggleFilter = (type: keyof FilterState, value: string) => {
        const current = filters[type];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onFilterChange({ ...filters, [type]: updated });
    };

    const toggleSubjectExpanded = (subject: string) => {
        setOpenSubjects(prev =>
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const toggleSubjectArea = (subject: string) => {
        const subtopicsForSubject = stats.subtopicsBySubject?.[subject] || [];
        const isCurrentlySelected = filters.subject_areas.includes(subject);

        if (!isCurrentlySelected) {
            const newSubtopics = [...new Set([...filters.subtopics, ...subtopicsForSubject])];
            onFilterChange({
                ...filters,
                subject_areas: [...filters.subject_areas, subject],
                subtopics: newSubtopics
            });
        } else {
            const newSubtopics = filters.subtopics.filter(st => !subtopicsForSubject.includes(st));
            onFilterChange({
                ...filters,
                subject_areas: filters.subject_areas.filter(s => s !== subject),
                subtopics: newSubtopics
            });
        }
    };

    const toggleSubtopic = (subtopic: string, subjectForSubtopic: string) => {
        const isCurrentlySelected = filters.subtopics.includes(subtopic);
        let newSubtopics: string[];
        let newSubjects = [...filters.subject_areas];

        if (!isCurrentlySelected) {
            newSubtopics = [...filters.subtopics, subtopic];
            if (!newSubjects.includes(subjectForSubtopic)) {
                newSubjects.push(subjectForSubtopic);
            }
        } else {
            newSubtopics = filters.subtopics.filter(st => st !== subtopic);
            const subtopicsForSubject = stats.subtopicsBySubject?.[subjectForSubtopic] || [];
            const hasRemaining = subtopicsForSubject.some(st => newSubtopics.includes(st));

            if (!hasRemaining) {
                newSubjects = newSubjects.filter(s => s !== subjectForSubtopic);
            }
        }

        onFilterChange({
            ...filters,
            subtopics: newSubtopics,
            subject_areas: newSubjects
        });
    };

    return (
        <div className="space-y-6">
            {/* Top Section: Difficulty & New Questions */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-12 flex-1">
                    {/* New Questions Only */}
                    <div className="lg:col-span-5 space-y-2">
                        <label className="text-sm font-bold text-brand-grey select-none">New Questions Only</label>
                        <div
                            onClick={() => onShowUnattemptedChange(!showUnattempted)}
                            className={`
                                flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-100/80
                                ${showUnattempted ? "text-brand-blue font-semibold" : "text-brand-grey"}
                            `}
                        >
                            <div className={`
                                h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                ${showUnattempted
                                    ? "bg-brand-blue border-brand-blue text-white"
                                    : "border-brand-grey/30 group-hover:border-brand-grey/50 bg-transparent"}
                            `}>
                                {showUnattempted && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                            </div>
                            <span className="text-sm">Yes</span>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="lg:col-span-7 space-y-2">
                        <label className="text-sm font-bold text-brand-grey select-none">Difficulty</label>
                        <div className="flex flex-wrap gap-2">
                            {["Easy", "Medium", "Hard"].map((diff) => {
                                const isSelected = filters.difficulties.includes(diff);
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
                                            px-5 py-1.5 text-sm font-bold rounded-xl border transition-all duration-200 select-none
                                            ${styles}
                                        `}
                                    >
                                        {diff}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* Domains & Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-12">
                {/* Domains - Left Column */}
                <div className="lg:col-span-5 space-y-2">
                    <label className="text-sm font-bold text-brand-grey select-none">Domains</label>
                    <div className="flex flex-col gap-1.5">
                        {stats.domains.map((domain) => {
                            const isSelected = filters.domains.includes(domain);
                            return (
                                <div
                                    key={domain}
                                    onClick={() => toggleFilter("domains", domain)}
                                    className={`
                                        flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-100/80
                                        ${isSelected ? "text-brand-blue font-semibold" : "text-brand-grey"}
                                    `}
                                >
                                    <div className={`
                                        h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                        ${isSelected
                                            ? "bg-brand-blue border-brand-blue text-white"
                                            : "border-brand-grey/30 group-hover:border-brand-grey/50 bg-transparent"}
                                    `}>
                                        {isSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                    </div>
                                    <span className="text-sm truncate" title={domain}>{domain}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skills - Right Column */}
                <div className="lg:col-span-7 space-y-2">
                    <label className="text-sm font-bold text-brand-grey select-none">Skills</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                        {stats.skills.map((skill) => {
                            const isSelected = filters.skills.includes(skill);
                            return (
                                <div
                                    key={skill}
                                    onClick={() => toggleFilter("skills", skill)}
                                    className={`
                                        flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 group hover:bg-neutral-100/80
                                        ${isSelected ? "text-brand-blue font-semibold" : "text-brand-grey"}
                                    `}
                                >
                                    <div className={`
                                        h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                        ${isSelected
                                            ? "bg-brand-blue border-brand-blue text-white"
                                            : "border-brand-grey/30 group-hover:border-brand-grey/50 bg-transparent"}
                                    `}>
                                        {isSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                    </div>
                                    <span className="text-sm leading-tight">{skill}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* Subject Areas */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-brand-grey select-none">
                        Subject Areas & Topics
                    </label>
                    {!isPaid && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                            <Lock className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Advanced</span>
                        </div>
                    )}
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 ${!isPaid ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""}`}>
                    {stats.subject_areas.map((subject) => {
                        const isSubjectSelected = filters.subject_areas.includes(subject);
                        const isExpanded = openSubjects.includes(subject);
                        const subtopics = stats.subtopicsBySubject?.[subject] || [];

                        return (
                            <div key={subject} className="flex flex-col gap-2">
                                {/* Subject Header */}
                                <div className="flex items-center gap-1 -ml-2">
                                    <div
                                        onClick={() => toggleSubjectArea(subject)}
                                        className={`
                                            flex-1 flex items-center gap-2 py-1 px-2 rounded-xl cursor-pointer transition-all group hover:bg-neutral-100/80
                                            ${isSubjectSelected ? "text-brand-blue font-semibold" : "text-brand-grey"}
                                        `}
                                    >
                                        <div className={`
                                            h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all
                                            ${isSubjectSelected
                                                ? "bg-brand-blue border-brand-blue text-white"
                                                : "border-brand-grey/30 group-hover:border-brand-grey/50"}
                                        `}>
                                            {isSubjectSelected && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                        </div>
                                        <span className="text-sm">{subject}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleSubjectExpanded(subject)}
                                        className="h-8 w-8 rounded-lg text-brand-grey hover:bg-neutral-100 hover:text-brand-black"
                                    >
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </div>

                                {/* Subtopics */}
                                {isExpanded && (
                                    <div className="flex flex-col gap-0.5 pl-2 border-l border-border/50 ml-2">
                                        {subtopics.map((sub) => {
                                            const isSubSelected = filters.subtopics.includes(sub);
                                            return (
                                                <div
                                                    key={sub}
                                                    onClick={() => toggleSubtopic(sub, subject)}
                                                    className={`
                                                        flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 group hover:bg-neutral-100/80
                                                        ${isSubSelected ? "text-brand-blue font-medium" : "text-brand-grey hover:text-brand-black"}
                                                    `}
                                                >
                                                    <div className={`
                                                        h-3.5 w-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                                                        ${isSubSelected
                                                            ? "bg-brand-blue border-brand-blue text-white"
                                                            : "border-brand-grey/30 group-hover:border-brand-grey/50 bg-transparent"}
                                                    `}>
                                                        {isSubSelected && <svg viewBox="0 0 12 12" className="w-2 h-2 fill-current"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>}
                                                    </div>
                                                    <span className="text-sm leading-relaxed">{sub}</span>
                                                </div>
                                            );
                                        })}
                                        {subtopics.length === 0 && (
                                            <span className="text-xs text-brand-grey/50 italic px-2 py-0.5">No topics available</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* Search */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-brand-grey select-none">
                        Search Keywords
                    </label>
                    {!isPaid && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                            <Lock className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Advanced</span>
                        </div>
                    )}
                </div>
                <div className={`relative ${!isPaid ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""}`}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
                    <Input
                        placeholder="Search specific keywords in questions..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="pl-10 h-11 rounded-xl bg-white border-none ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50 focus:outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-neutral-100"
                            onClick={() => onSearchQueryChange("")}
                        >
                            <X className="h-3 w-3 text-brand-grey" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
