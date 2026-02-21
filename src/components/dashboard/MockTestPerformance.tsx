import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TestRecord = {
    date: string; // ISO date
    overall: number;
    rw: number;
    math: number;
};

// Small, dependency-free SVG line chart for mock test scores
export const MockTestPerformance = () => {
    const [view, setView] = useState<"overall" | "rw" | "math">("overall");

    // Placeholder/mock data — will be replaced by real feature later
    const tests: TestRecord[] = useMemo(() => [
        { date: "2025-10-01", overall: 1080, rw: 540, math: 540 },
        { date: "2025-11-05", overall: 1120, rw: 560, math: 560 },
        { date: "2025-12-10", overall: 1150, rw: 580, math: 570 },
        { date: "2026-01-20", overall: 1170, rw: 590, math: 580 },
        { date: "2026-02-15", overall: 1200, rw: 600, math: 600 }
    ], []);

    const values = tests.map(t => (view === "overall" ? t.overall : view === "rw" ? t.rw : t.math));

    const svgWidth = 600;
    const svgHeight = 120;
    const paddingLeft = 48; // reserve space for y-axis labels
    const paddingRight = 18;
    const paddingY = 18;

    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1000);

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingY * 2;

    const points = values.map((v, i) => {
        const x = paddingLeft + (i * plotWidth) / Math.max(values.length - 1, 1);
        const t = (v - minVal) / Math.max(maxVal - minVal, 1);
        const y = paddingY + (1 - t) * plotHeight;
        return [x, y];
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");

    return (
        <div className="rounded-3xl bg-white p-5">
            <div className="mb-4">
                <h2 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Mock Test Performance</h2>
                <p className="text-sm text-[#75757A] mt-1">Track your scores over time</p>
            </div>
            <div className="px-1">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setView("overall")} className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", view === "overall" ? "bg-accent text-white" : "text-[#75757A] hover:bg-[#f5f5f7]")}>Overall</button>
                    <button onClick={() => setView("rw")} className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", view === "rw" ? "bg-accent text-white" : "text-[#75757A] hover:bg-[#f5f5f7]")}>Reading &amp; Writing</button>
                    <button onClick={() => setView("math")} className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", view === "math" ? "bg-accent text-white" : "text-[#75757A] hover:bg-[#f5f5f7]")}>Math</button>
                </div>

                <div>
                    {tests.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-6">No mock tests completed yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} className="block">
                                {/* grid lines + y-axis labels */}
                                {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
                                    const y = paddingY + g * plotHeight;
                                    const val = Math.round(maxVal - g * (maxVal - minVal));
                                    return (
                                        <g key={idx}>
                                            <line x1={paddingLeft} x2={svgWidth - paddingRight} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                                            <text x={12} y={y + 4} fontSize={11} fill="#6b7280" textAnchor="start">{val}</text>
                                        </g>
                                    );
                                })}

                                {/* path */}
                                <path d={pathD} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

                                {/* points */}
                                {points.map((p, i) => (
                                    <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#1D4ED8" />
                                ))}

                                {/* x labels */}
                                {tests.map((t, i) => (
                                    <text key={i} x={points[i][0]} y={svgHeight - 6} textAnchor="middle" fontSize={10} fill="#6b7280">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>
                                ))}
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockTestPerformance;
