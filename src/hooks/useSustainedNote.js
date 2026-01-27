import { useState, useEffect, useRef } from 'react';

/**
 * Tracks notes that have been sustained for a minimum duration.
 *
 * @param {string|null} currentNote - The currently detected note
 * @param {number} sustainTime - Milliseconds the note must be held to count as "locked" (default 1000ms)
 * @param {Set<string>} [initialLockedNotes] - Optional initial locked notes
 *
 * @returns {Set<string>} lockedNotes - Notes that have been sustained
 */
export function useSustainedNote(currentNote, sustainTime = 1000, initialLockedNotes = new Set()) {
  const [lockedNotes, setLockedNotes] = useState(initialLockedNotes);
  const timerRef = useRef(null);
  const previousNoteRef = useRef(null);

  useEffect(() => {
    // Clear timer if note disappears
    if (!currentNote) {
      clearTimeout(timerRef.current);
      previousNoteRef.current = null;
      return;
    }

    // Skip if already locked
    if (lockedNotes.has(currentNote)) return;

    // Reset timer if a new note appears
    if (previousNoteRef.current !== currentNote) {
      clearTimeout(timerRef.current);
      previousNoteRef.current = currentNote;

      timerRef.current = setTimeout(() => {
        setLockedNotes((prev) => new Set(prev).add(currentNote));
        previousNoteRef.current = null;
      }, sustainTime);
    }

    return () => clearTimeout(timerRef.current);

  }, [currentNote, lockedNotes, sustainTime]);

  return lockedNotes;
}