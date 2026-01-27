import { useEffect, useRef, useState } from "react";

/**
 * useSustainedFrequency
 * Locks a note only if it's held inside tolerance for a sustained duration,
 * and uses hysteresis to avoid jitter.
 *
 * @param {number} frequency - Current detected frequency
 * @param {number[]} targetFrequencies - Array of target note freqs (per string)
 * @param {number} toleranceHz - Allowed tolerance around each target (Hz)
 * @param {number} sustainMs - Duration required to sustain inside tolerance
 * @param {number} requiredFrames - How many consecutive frames needed before lock
 * @returns {Set<number>} lockedFrequencies
 */
export function useSustainedFrequency(
  frequency,
  targetFrequencies = [],
  toleranceHz = 1,
  sustainMs = 1500,
  requiredFrames = 5
) {
  const [locked, setLocked] = useState(new Set());

  // per-target tracking
  const trackers = useRef(
    targetFrequencies.map(() => ({
      insideFrames: 0,    // consecutive hits inside tolerance
      lastTime: null,     // when sustain started
      isLocked: false,
    }))
  );

  useEffect(() => {
    if (!frequency || targetFrequencies.length === 0) return;

    const now = performance.now();

    trackers.current = targetFrequencies.map((target, i) => {
      const t = trackers.current[i] || {
        insideFrames: 0,
        lastTime: null,
        isLocked: false,
      };

      const diff = Math.abs(frequency - target);

      // thresholds
      const insideTolerance = diff <= toleranceHz;
      const unlockThreshold = toleranceHz * 1.5;

      if (t.isLocked) {
        // Stay locked unless we drift far out
        if (diff > unlockThreshold) {
          return { ...t, isLocked: false, insideFrames: 0, lastTime: null };
        }
        return t; // still locked
      } else {
        if (insideTolerance) {
          const started = t.lastTime ?? now;
          const sustained = now - started >= sustainMs;
          const consecutive = t.insideFrames + 1;

          if (sustained && consecutive >= requiredFrames) {
            return { ...t, isLocked: true, insideFrames: consecutive, lastTime: now };
          }
          return { ...t, insideFrames: consecutive, lastTime: started };
        } else {
          // reset if out of tolerance
          return { ...t, insideFrames: 0, lastTime: null };
        }
      }
    });

    // Update locked set
    const newLocked = new Set(
      targetFrequencies.filter((_, i) => trackers.current[i].isLocked)
    );
    setLocked(newLocked);
  }, [frequency, targetFrequencies, toleranceHz, sustainMs, requiredFrames]);

  return locked;
}