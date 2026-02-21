import { Annotation, SelectionState } from "@/components/practice/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface AnnotationToolbarProps {
    selection: NonNullable<SelectionState>;
    annotations: Annotation[]; // Annotations for the current question
    onAddAnnotation: (color?: string, underlineStyle?: Annotation["underlineStyle"]) => void;
    onRemoveAnnotation: () => void;
    showUnderlineMenu: boolean;
    setShowUnderlineMenu: (show: boolean) => void;
}

export const AnnotationToolbar = ({
    selection,
    annotations,
    onAddAnnotation,
    onRemoveAnnotation,
    showUnderlineMenu,
    setShowUnderlineMenu,
}: AnnotationToolbarProps) => {
    const currentAnnotation = annotations.find(a =>
        selection.editingId ? a.id === selection.editingId : a.start === selection.start && a.end === selection.end,
    );

    return (
        <div
            className="fixed z-50 bg-white rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.15)] flex items-center p-1.5 gap-1.5 border border-neutral-200 annotation-toolbar"
            style={{
                left: `${selection.rect.left + selection.rect.width / 2}px`,
                top: `${selection.rect.top - 60}px`,
                transform: "translateX(-50%)",
            }}
        >
            {/* Yellow Color Circle */}
            <button
                onMouseDown={e => {
                    e.preventDefault();
                    onAddAnnotation("#fffad7");
                }}
                className={cn(
                    "relative w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center",
                    "bg-[#fffad7] hover:bg-[#ffee8c] hover:border-neutral-500 hover:border-2 hover:scale-105",
                )}
                title="Highlight Yellow"
            >
                {currentAnnotation?.color === "#fffad7" && (
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-800 drop-shadow-sm"
                    >
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" opacity="0.2" />
                        <path
                            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>

            {/* Blue Color Circle */}
            <button
                onMouseDown={e => {
                    e.preventDefault();
                    onAddAnnotation("#e7f5ff");
                }}
                className={cn(
                    "relative w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center",
                    "bg-[#e7f5ff] hover:bg-[#c9e7ff] hover:border-neutral-500 hover:border-2 hover:scale-105",
                )}
                title="Highlight Blue"
            >
                {currentAnnotation?.color === "#e7f5ff" && (
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-800 drop-shadow-sm"
                    >
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" opacity="0.2" />
                        <path
                            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>

            {/* Pink Color Circle */}
            <button
                onMouseDown={e => {
                    e.preventDefault();
                    onAddAnnotation("#ffe5f8");
                }}
                className={cn(
                    "relative w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center",
                    "bg-[#ffe5f8] hover:bg-[#ffccf4] hover:border-neutral-500 hover:border-2 hover:scale-105",
                )}
                title="Highlight Pink"
            >
                {currentAnnotation?.color === "#ffe5f8" && (
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-800 drop-shadow-sm"
                    >
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" opacity="0.2" />
                        <path
                            d="M12 2.69l5.66 5.66a8 8  0 1 1-11.31 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>

            {/* Underline Button with Dropdown */}
            <div className="relative">
                <button
                    onMouseDown={e => {
                        e.preventDefault();
                        setShowUnderlineMenu(!showUnderlineMenu);
                    }}
                    className={cn(
                        "p-2 hover:bg-neutral-100 rounded-full text-neutral-800 flex items-center",
                        showUnderlineMenu && "bg-neutral-100",
                    )}
                    title="Underline options"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[1.2rem] font-bold leading-none translate-y-0.5">U</span>
                        <div className="flex flex-col gap-[2px] w-4 mt-0.5">
                            <div className="h-[1.5px] bg-[#1e1e1e] w-full" />
                            <div className="h-[1.5px] border-b border-dashed border-[#1e1e1e] w-full" />
                        </div>
                    </div>
                    <ChevronUp
                        className={cn("h-4 w-4 ml-0.5 transition-transform", !showUnderlineMenu && "rotate-180")}
                    />
                </button>

                <AnimatePresence>
                    {showUnderlineMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: -10, x: "-50%" }}
                            className="absolute top-full left-1/2 mt-3 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden w-[54px] z-50"
                        >
                            {[
                                {
                                    style: "solid",
                                    label: "U",
                                    sub: <div className="h-[2px] bg-[#1e1e1e] w-6 mt-[1px]" />,
                                },
                                {
                                    style: "dashed",
                                    label: "U",
                                    sub: (
                                        <div className="h-[2px] border-b-2 border-dashed border-[#1e1e1e] w-6 mt-[1px]" />
                                    ),
                                },
                                {
                                    style: "dotted",
                                    label: "U",
                                    sub: (
                                        <div className="h-[2px] border-b-2 border-dotted border-[#1e1e1e] w-6 mt-[1px]" />
                                    ),
                                },
                                { style: "none", label: "None", sub: null },
                            ].map(opt => (
                                <button
                                    key={opt.style}
                                    onMouseDown={e => {
                                        e.preventDefault();
                                        onAddAnnotation(undefined, opt.style as Annotation["underlineStyle"]);
                                        setShowUnderlineMenu(false);
                                    }}
                                    className="w-full h-8 px-1 text-left hover:bg-neutral-100 flex flex-col items-center justify-center border-b border-neutral-100 last:border-0 relative"
                                >
                                    <span
                                        className={cn(
                                            "text-[1rem] font-bold text-[#1e1e1e] leading-none",
                                            opt.style === "none" && "text-[0.75rem] font-medium text-neutral-600",
                                        )}
                                    >
                                        {opt.label}
                                    </span>
                                    {opt.sub}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trash Button */}
            <button
                onMouseDown={e => {
                    e.preventDefault();
                    onRemoveAnnotation();
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full text-neutral-600 border-2 border-neutral-200 mx-1"
                title="Remove highlight"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </button>
        </div>
    );
};
