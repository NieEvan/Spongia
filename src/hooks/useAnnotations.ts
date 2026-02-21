import { Annotation, SelectionState } from "@/components/practice/types";
import { RefObject, useState } from "react";

interface UseAnnotationsProps {
    currentQuestionId: string;
    passageRef: RefObject<HTMLDivElement>;
    highlightModeActive: boolean;
}

export const useAnnotations = ({ currentQuestionId, passageRef, highlightModeActive }: UseAnnotationsProps) => {
    // Annotations state: map questionId -> array of annotations
    const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});
    // Selection state
    const [selection, setSelection] = useState<SelectionState>(null);
    const [showUnderlineMenu, setShowUnderlineMenu] = useState(false);

    const handleSelection = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !passageRef.current) {
            setSelection(null);
            return;
        }

        const range = sel.getRangeAt(0);
        if (!passageRef.current.contains(range.commonAncestorContainer)) {
            setSelection(null);
            return;
        }

        // Get offsets relative to the text content
        const text = passageRef.current.innerText;
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(passageRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + range.toString().length;

        const rect = range.getBoundingClientRect();

        if (highlightModeActive) {
            const annotationIdToUse = Math.random().toString(36).substr(2, 9);

            // Create annotation directly
            setAnnotations(prev => {
                const qId = currentQuestionId;
                const currentArr = prev[qId] || [];

                // Resolve overlaps: remove/split existing colors that intersect with the new highlight
                const filteredArr: Annotation[] = [];
                currentArr.forEach(a => {
                    const overlapStart = Math.max(a.start, start);
                    const overlapEnd = Math.min(a.end, end);

                    // Only resolve overlaps if the existing annotation HAS a color
                    if (overlapStart < overlapEnd && a.color) {
                        // Split the existing annotation to preserve parts outside the selection
                        if (a.start < start) {
                            filteredArr.push({
                                ...a,
                                end: start,
                                id: Math.random().toString(36).substr(2, 9),
                            });
                        }
                        if (a.end > end) {
                            filteredArr.push({
                                ...a,
                                start: end,
                                id: Math.random().toString(36).substr(2, 9),
                            });
                        }

                        // Let's preserve the underline.
                        if (a.underlineStyle && a.underlineStyle !== "none") {
                            filteredArr.push({
                                id: Math.random().toString(36).substr(2, 9),
                                start: overlapStart,
                                end: overlapEnd,
                                underlineStyle: a.underlineStyle,
                            });
                        }
                    } else {
                        filteredArr.push(a);
                    }
                });

                const newAnnotation: Annotation = {
                    id: annotationIdToUse,
                    start,
                    end,
                    color: "#fffad7",
                };
                return {
                    ...prev,
                    [qId]: [...filteredArr, newAnnotation],
                };
            });

            // Also show the selection menu
            setSelection({
                start,
                end,
                rect: { left: rect.left, top: rect.top, width: rect.width },
                editingId: annotationIdToUse,
            });
        } else {
            setSelection({
                start,
                end,
                rect: { left: rect.left, top: rect.top, width: rect.width },
            });
        }
        setShowUnderlineMenu(false);
    };

    const handleAnnotationClick = (e: React.MouseEvent, annotation: Annotation) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSelection({
            start: annotation.start,
            end: annotation.end,
            rect: { left: rect.left, top: rect.top, width: rect.width },
            editingId: annotation.id,
        });
        setShowUnderlineMenu(false);
    };

    const addAnnotation = (color?: string, underlineStyle?: Annotation["underlineStyle"]) => {
        if (!selection) return;

        setAnnotations(prev => {
            const qId = currentQuestionId;
            const currentArr = prev[qId] || [];

            if (selection.editingId) {
                return {
                    ...prev,
                    [qId]: currentArr.map(a =>
                        a.id === selection.editingId
                            ? {
                                  ...a,
                                  color: color !== undefined ? color : a.color,
                                  underlineStyle: underlineStyle !== undefined ? underlineStyle : a.underlineStyle,
                              }
                            : a,
                    ),
                };
            } else {
                // Resolve overlaps: property-aware splitting
                const filteredArr: Annotation[] = [];
                const isColorUpdate = color !== undefined;
                const isUnderlineUpdate = underlineStyle !== undefined && underlineStyle !== "none";

                currentArr.forEach(a => {
                    const overlapStart = Math.max(a.start, selection.start);
                    const overlapEnd = Math.min(a.end, selection.end);

                    // Conflict if we're setting a property that the existing annotation already has
                    const hasConflict =
                        (isColorUpdate && a.color) ||
                        (isUnderlineUpdate && a.underlineStyle && a.underlineStyle !== "none");

                    if (overlapStart < overlapEnd && hasConflict) {
                        // Split the existing annotation to keep parts outside the selection
                        if (a.start < selection.start) {
                            filteredArr.push({
                                ...a,
                                end: selection.start,
                                id: Math.random().toString(36).substr(2, 9),
                            });
                        }
                        if (a.end > selection.end) {
                            filteredArr.push({
                                ...a,
                                start: selection.end,
                                id: Math.random().toString(36).substr(2, 9),
                            });
                        }

                        // Preserve the non-conflicting property for the overlapping part
                        if (isColorUpdate && a.underlineStyle && a.underlineStyle !== "none") {
                            filteredArr.push({
                                id: Math.random().toString(36).substr(2, 9),
                                start: overlapStart,
                                end: overlapEnd,
                                underlineStyle: a.underlineStyle,
                            });
                        }
                        if (isUnderlineUpdate && a.color) {
                            filteredArr.push({
                                id: Math.random().toString(36).substr(2, 9),
                                start: overlapStart,
                                end: overlapEnd,
                                color: a.color,
                            });
                        }
                    } else {
                        filteredArr.push(a);
                    }
                });

                const newAnnotation: Annotation = {
                    id: Math.random().toString(36).substr(2, 9),
                    start: selection.start,
                    end: selection.end,
                    color,
                    underlineStyle: underlineStyle || "none",
                };
                return {
                    ...prev,
                    [qId]: [...filteredArr, newAnnotation],
                };
            }
        });

        // Auto-close if we just performed a new highlight
        if (!selection.editingId) {
            setSelection(null);
            window.getSelection()?.removeAllRanges();
        }
    };

    const removeAnnotationsInRange = () => {
        if (!selection) return;
        setAnnotations(prev => ({
            ...prev,
            [currentQuestionId]: (prev[currentQuestionId] || []).filter(a =>
                selection.editingId
                    ? a.id !== selection.editingId
                    : !(a.start < selection.end && a.end > selection.start),
            ),
        }));
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    };

    return {
        annotations,
        selection,
        showUnderlineMenu,
        setShowUnderlineMenu,
        setSelection,
        handleSelection,
        handleAnnotationClick,
        addAnnotation,
        removeAnnotationsInRange,
    };
};
