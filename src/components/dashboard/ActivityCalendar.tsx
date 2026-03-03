import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useProgress } from "@/hooks/useProgress";

const DAYS_TO_SHOW = 42; // 6 weeks * 7 days (fixed grid for consistent height)

export const ActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { progress } = useProgress();

    // Generate days for grid
    const days = useMemo(() => {
        const result = [];
        // Align to show a month-like view or just trailing days? layout is 7x5ish
        // Image shows "May 2022" with standard calendar layout. 
        // Let's emulate a month view.
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Start from Sunday
        const startOffset = firstDay.getDay();
        const endDay = lastDay.getDate();
        
        for (let i = 0; i < startOffset; i++) {
            result.push({ day: null, count: 0 });
        }
        
        // Activity map
        const activityMap: Record<number, number> = {};
        const results = progress?.results;
        if (results) {
            Object.values(results).forEach((res: any) => {
                const d = new Date(res.answeredAt);
                if (d.getMonth() === month && d.getFullYear() === year) {
                    const date = d.getDate();
                    activityMap[date] = (activityMap[date] || 0) + 1;
                }
            });
        }

        for (let i = 1; i <= endDay; i++) {
            result.push({ day: i, count: activityMap[i] || 0 });
        }

        // Pad results to fixed grid size so calendar height stays consistent
        while (result.length < DAYS_TO_SHOW) {
            result.push({ day: null, count: 0 });
        }

        return result;
    }, [currentDate, progress]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }

    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const getActivityColor = (count: number) => {
        if (count === 0) return "hover:bg-muted cursor-default text-muted-foreground";
        if (count < 10) return "bg-blue-100 text-muted-foreground font-medium";
        if (count < 30) return "bg-blue-300 text-muted-foreground font-medium";
        if (count < 60) return "bg-blue-500 text-white font-bold";
        if (count < 100) return "bg-blue-700 text-white font-bold";
        return "bg-blue-900 text-white font-bold";
    };

    const monthShort = currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div className="flex flex-col h-full">
            {/* Removed top title block — 'Activity' will appear in the card header */}
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden flex flex-col p-6 h-full">
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-1 flex-shrink-0">
                        <span className="text-[20px] font-bold text-[#1d1d1f]">Activity</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-[#1d1d1f]"
                                onClick={prevMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-[#1d1d1f]">{monthShort}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-[#1d1d1f]"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-1 text-center text-[12px] text-muted-foreground mb-1 flex-shrink-0 grid grid-cols-7 gap-0.5">
                        <div>S</div>
                        <div>M</div>
                        <div>T</div>
                        <div>W</div>
                        <div>T</div>
                        <div>F</div>
                        <div>S</div>
                    </div>
                    <div className="h-px bg-gray-200 w-full" />

                    <div className="grid grid-cols-7 auto-rows-[minmax(0,1fr)] flex-1 min-h-0 relative z-10 mt-2">
                        {days.map((d, i) => (
                            <div key={i} className="flex items-center justify-center min-h-0">
                                {d.day && (
                                    <div 
                                        title={d.count > 0 ? `${d.count} questions practiced` : "No activity"}
                                        className={`
                                                    w-[22px] h-[22px] flex items-center justify-center rounded-lg text-[12px] leading-none
                                                    ${getActivityColor(d.count)}
                                                `}
                                    >
                                        {d.day}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="-mt-8 flex-shrink-0 flex items-center justify-end gap-1.5 text-[12px] text-muted-foreground px-1 relative z-0">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-[1px] bg-muted" title="0 questions" />
                            <div className="w-2 h-2 rounded-[1px] bg-blue-100" title="< 10 questions" />
                            <div className="w-2 h-2 rounded-[1px] bg-blue-300" title="10-30 questions" />
                            <div className="w-2 h-2 rounded-[1px] bg-blue-500" title="30-60 questions" />
                            <div className="w-2 h-2 rounded-[1px] bg-blue-700" title="60-100 questions" />
                            <div className="w-2 h-2 rounded-[1px] bg-blue-900" title="> 100 questions" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};
