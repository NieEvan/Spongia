import { Annotation, SelectionState } from "@/components/practice/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { RefObject } from "react";
import { AnnotationToolbar } from "./AnnotationToolbar";

interface PassageViewerProps {
    passageText: string;
    leftWidth: number;
    passageRef: RefObject<HTMLDivElement>;
    annotations: Annotation[];
    selection: SelectionState;
    showUnderlineMenu: boolean;
    highlightModeActive: boolean;
    onSelectionChange: () => void;
    onAnnotationClick: (e: React.MouseEvent, annotation: Annotation) => void;
    onAddAnnotation: (color?: string, underlineStyle?: Annotation["underlineStyle"]) => void;
    onRemoveAnnotation: () => void;
    setShowUnderlineMenu: (show: boolean) => void;
    onStartResizing: (e: React.MouseEvent) => void;
}

export const PassageViewer = ({
    passageText,
    leftWidth,
    passageRef,
    annotations,
    selection,
    showUnderlineMenu,
    highlightModeActive,
    onSelectionChange,
    onAnnotationClick,
    onAddAnnotation,
    onRemoveAnnotation,
    setShowUnderlineMenu,
    onStartResizing,
}: PassageViewerProps) => {
    const renderAnnotatedText = () => {
        const text = passageText;
        const qAnnotations = annotations || [];

        if (qAnnotations.length === 0) return text;

        const points = new Set<number>([0, text.length]);
        qAnnotations.forEach(a => {
            points.add(a.start);
            points.add(a.end);
        });
        const sortedPoints = Array.from(points).sort((a, b) => a - b);

        return sortedPoints.map((point, i) => {
            if (i === sortedPoints.length - 1) return null;

            const start = point;
            const end = sortedPoints[i + 1];
            if (start === end) return null;

            const content = text.slice(start, end);
            if (!content) return null;

            const activeAnnotations = qAnnotations.filter(a => a.start <= start && a.end >= end);

            if (activeAnnotations.length === 0) return <span key={i}>{content}</span>;

            // Merge styles from all active annotations (last one wins for each property)
            const combined = activeAnnotations.reduce(
                (acc, curr) => ({
                    color: curr.color || acc.color,
                    underlineStyle:
                        curr.underlineStyle && curr.underlineStyle !== "none"
                            ? curr.underlineStyle
                            : acc.underlineStyle,
                    id: curr.id, // We'll use the last ID for clicking context
                }),
                {
                    color: undefined,
                    underlineStyle: "none",
                    id: activeAnnotations[activeAnnotations.length - 1].id,
                },
            );

            const styles: React.CSSProperties = {
                textDecoration: combined.underlineStyle !== "none" ? "underline" : "none",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                textDecorationStyle: combined.underlineStyle as any,
                textDecorationThickness: "1.5px",
                textUnderlineOffset: "2px",
                cursor: "pointer",
            };

            const bgClasses: Record<string, string> = {
                "#fffad7": "bg-[#fffad7] hover:bg-[#ffee8c]",
                "#e7f5ff": "bg-[#e7f5ff] hover:bg-[#c9e7ff]",
                "#ffe5f8": "bg-[#ffe5f8] hover:bg-[#ffccf4]",
            };

            return (
                <span
                    key={i}
                    style={styles}
                    onClick={e => onAnnotationClick(e, activeAnnotations[activeAnnotations.length - 1])}
                    className={cn(
                        "annotated-span transition-colors duration-150",
                        combined.color && bgClasses[combined.color],
                    )}
                >
                    {content}
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col relative group bg-white" style={{ width: `${leftWidth}%` }}>
            {/* Divider Line */}
            <div className="absolute right-[-1.5px] top-0 bottom-0 w-[3px] bg-neutral-400 z-10" />

            <ScrollArea className="flex-1">
                <div
                    ref={passageRef}
                    onMouseUp={onSelectionChange}
                    className="pt-[4.5rem] px-32 pb-16 font-cb-serif text-[1.3rem] leading-[1.3] text-[#1e1e1e] select-text"
                >
                    {renderAnnotatedText()}
                </div>
            </ScrollArea>

            {/* Floating Selection Toolbar */}
            {selection && (
                <AnnotationToolbar
                    selection={selection}
                    annotations={annotations}
                    onAddAnnotation={onAddAnnotation}
                    onRemoveAnnotation={onRemoveAnnotation}
                    showUnderlineMenu={showUnderlineMenu}
                    setShowUnderlineMenu={setShowUnderlineMenu}
                />
            )}

            {/* Resizer Handle */}
            <div
                className="absolute right-[-16px] top-[28%] -translate-y-1/2 w-8 h-[34px] cursor-col-resize z-20 flex items-center justify-center bg-white"
                onMouseDown={onStartResizing}
            >
                <div className="relative flex h-8 w-[14px] items-center justify-center rounded-[2px] bg-[#1e1e1e] shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M5 2L1 6L5 10V2Z" fill="white" />
                        <path d="M7 2L11 6L7 10V2Z" fill="white" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
