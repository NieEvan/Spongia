import { cn } from "@/lib/utils";
import { Highlighter, LogOut } from "lucide-react";

interface PlayerHeaderProps {
    timed: boolean;
    timeRemaining: number;
    highlightModeActive: boolean;
    setHighlightModeActive: (active: boolean) => void;
    onExitConfirm: () => void;
    formatTime: (seconds: number) => string;
}

export const PlayerHeader = ({
    timed,
    timeRemaining,
    highlightModeActive,
    setHighlightModeActive,
    onExitConfirm,
    formatTime,
}: PlayerHeaderProps) => {
    return (
        <header
            className="relative z-10 flex h-[5.25rem] shrink-0 items-center justify-between bg-[#e6edf8] px-8"
            style={{
                borderBottom: "2px dashed #1e1e1e",
                borderImage:
                    "repeating-linear-gradient(to right, #1e1e1e, #1e1e1e 32px, transparent 32px, transparent 34px) 1",
            }}
        >
            <div className="flex flex-col">
                <h1 className="font-semibold text-[1.3rem] leading-none tracking-tight text-[#1e1e1e]">
                    Reading and Writing
                </h1>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {timed && (
                    <>
                        <div className="text-[1.5rem] font-semibold text-[#1e1e1e] leading-none mb-1">
                            {formatTime(timeRemaining)}
                        </div>
                        <button className="rounded-full bg-[#e6edf8] px-3.5 h-[23px] flex items-center justify-center text-[0.85rem] font-bold text-[#1e1e1e] ring-1 ring-[#1e1e1e] ring-inset hover:ring-2 hover:bg-[#f0f0f0] transition-all duration-200 ease-in-out">
                            Hide
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-6 text-neutral-600">
                <button
                    onClick={() => setHighlightModeActive(!highlightModeActive)}
                    className={cn(
                        "flex flex-col items-center gap-0.5 group/tool px-2 py-1 transition-colors relative",
                        highlightModeActive ? "text-[#1e1e1e]" : "text-neutral-600 hover:text-[#1e1e1e]",
                    )}
                >
                    <Highlighter className="h-[22px] w-[22px] translate-y-0.5" />
                    <span className="text-[0.85rem] font-medium hidden sm:block mt-0.5">Highlights</span>
                    {highlightModeActive && (
                        <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[#1e1e1e]" />
                    )}
                </button>

                <button
                    onClick={onExitConfirm}
                    className="flex flex-col items-center gap-0.5 hover:text-[#1e1e1e] group/tool px-2 py-1"
                >
                    <LogOut className="h-[22px] w-[22px]" />
                    <span className="text-[0.85rem] font-medium hidden sm:block mt-0.5">Exit</span>
                </button>
            </div>
        </header>
    );
};
