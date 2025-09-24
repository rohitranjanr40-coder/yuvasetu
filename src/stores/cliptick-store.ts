import { create } from 'zustand';
import type { ClipTickSegment } from '@/types';

// --- State Management with Zustand ---
interface EditorState {
  segments: ClipTickSegment[];
  past: ClipTickSegment[][];
  future: ClipTickSegment[][];
  setSegments: (segments: ClipTickSegment[]) => void;
  updateSegmentsWithoutHistory: (segments: ClipTickSegment[]) => void;
  undo: () => void;
  redo: () => void;
  addSegment: (segment: ClipTickSegment) => void;
  removeSegment: (id: number) => void;
  reorderSegments: (reordered: ClipTickSegment[]) => void;
  resetHistory: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    segments: [],
    past: [],
    future: [],
    setSegments: (newSegments) => {
        const { segments: oldSegments, past } = get();
        if (JSON.stringify(newSegments) === JSON.stringify(oldSegments)) return;
        set({
            segments: newSegments,
            past: [...past, oldSegments],
            future: [],
        });
    },
    updateSegmentsWithoutHistory: (newSegments) => {
         set({ segments: newSegments });
    },
    resetHistory: () => {
        set({ past: [], future: [] });
    },
    undo: () => {
        const { past, segments, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        set({
            past: newPast,
            segments: previous,
            future: [segments, ...future],
        });
    },
    redo: () => {
        const { future, segments, past } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        set({
            past: [...past, segments],
            segments: next,
            future: newFuture,
        });
    },
    addSegment: (segment) => get().setSegments([...get().segments, segment]),
    removeSegment: (idToRemove) => get().setSegments(get().segments.filter(seg => seg.id !== idToRemove)),
    reorderSegments: (reordered) => get().setSegments(reordered),
}));
