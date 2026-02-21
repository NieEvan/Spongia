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

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col pb-4 flex-shrink-0">
                <h2 className="text-[20px] font-bold mb-1 text-[#1D1D1F]">Activity</h2>
                <div className="min-h-[1.5rem] flex items-center">
                    <p className="text-sm text-[#75757A]">Track your effort</p>
                </div>
            </div>
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col p-4 h-[17rem]">
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0 px-1">
                        <span className="font-medium text-[14px] text-[#1d1d1f]">{monthName}</span>
                        <div className="flex gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-[#1d1d1f]" 
                                onClick={prevMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
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

                    <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-muted-foreground mb-2 flex-shrink-0">
                        <div>S</div>
                        <div>M</div>
                        <div>T</div>
                        <div>W</div>
                        <div>T</div>
                        <div>F</div>
                        <div>S</div>
                    </div>
                    <div className="h-px bg-gray-200 w-full mb-1" />

                    <div className="grid grid-cols-7 gap-x-1 gap-y-2.5 auto-rows-[1.05rem] flex-1 min-h-0 relative z-10 mt-3">
                        {days.map((d, i) => (
                            <div key={i} className="flex items-center justify-center min-h-0">
                                {d.day && (
                                    <div 
                                        title={d.count > 0 ? `${d.count} questions practiced` : "No activity"}
                                        className={`
                                                w-6 h-6 flex items-center justify-center rounded-lg text-[12px] leading-none pt-0.5
                                                ${getActivityColor(d.count)}
                                            `}
                                    >
                                        {d.day}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex-shrink-0 flex items-center justify-end gap-2 text-[12px] text-muted-foreground px-1 relative z-0">
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
