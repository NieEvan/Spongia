import { AnimatePresence, motion } from "framer-motion";

interface ExitConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ExitConfirmModal = ({ show, onClose, onConfirm }: ExitConfirmModalProps) => {
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1D1F]/40 backdrop-blur-[2px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-[400px] rounded-[14px] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-neutral-200"
                    >
                        <h2 className="text-[1.5rem] font-bold text-[#1e1e1e] leading-tight mb-3 text-center">
                            Exit Practice
                        </h2>
                        <p className="text-neutral-600 text-[1.1rem] leading-relaxed mb-8 text-center">
                            Are you sure you want to leave?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-white text-[#1e1e1e] font-bold rounded-[8px] border border-neutral-300 hover:bg-neutral-100 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 bg-[#324dc7] text-white font-bold rounded-[8px] hover:bg-[#243bb0] transition-colors"
                            >
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
