import "./TunerDisplay.scss";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Headstock } from "../HeadStock";
import { useArcSegments } from "../../hooks/useArcSegments";
import { usePointerShape } from "../../hooks/usePointerShape";
import { NOTE_FREQUENCIES } from "../../constants/tuningData";
import {
  ARC_SEGMENTS,
  ARC_RADIUS_INNER,
  ARC_RADIUS_OUTER,
  SVG_WIDTH,
  SVG_HEIGHT,
  ARC_CENTER_X,
  ARC_CENTER_Y,
  TUNING_THRESHOLD,
  IN_TUNE_HZ_TOLERANCE,
  HZ_DEVIATION_FOR_FULL_SCALE,
  YELLOW_RANGE,
} from "../../constants/tuner";

const TunerDisplay = ({
  frequency = 0,
  note = null,
  cents = 0,
  instrumentName = "",
  tuningNotes = [],
}) => {
  const [tunedNotes, setTunedNotes] = useState(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const NOTE_HOLD_DELAY = 250;
  const [displayNote, setDisplayNote] = useState(null);
const candidateNoteRef = useRef(null);
  const candidateStartTimeRef = useRef(null);


  // Find the closest tuning note to the current frequency
  const matchedTuningNote = useMemo(() => {
    if (!frequency || !tuningNotes.length) return null;
    return tuningNotes.reduce((closest, currNote) => {
      const currFreq = NOTE_FREQUENCIES[currNote];
      const closestFreq = NOTE_FREQUENCIES[closest];
      return Math.abs(currFreq - frequency) < Math.abs(closestFreq - frequency)
        ? currNote
        : closest;
    }, tuningNotes[0]);
  }, [frequency, tuningNotes]);

  const targetNoteFrequency = NOTE_FREQUENCIES[matchedTuningNote] || 0;
  const hzDifference = frequency - targetNoteFrequency;
  const isInTune =
    targetNoteFrequency > 0 && Math.abs(hzDifference) <= IN_TUNE_HZ_TOLERANCE;

  // Improve note label by falling back to matched note
  
  const displayCents = cents ?? 0;
  const displayLabel = displayNote ?? "--";
  // Reset tuned notes if tuning or instrument changes
  useEffect(() => {
    setTunedNotes(new Set());
  }, [tuningNotes.join(","), instrumentName]);

  // Mark note as tuned if it is in tune
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
  
      if (!matchedTuningNote) return;
  
      if (matchedTuningNote !== displayNote) {
        if (candidateNoteRef.current !== matchedTuningNote) {
          candidateNoteRef.current = matchedTuningNote;
          candidateStartTimeRef.current = now;
        }
  
        const elapsed = now - candidateStartTimeRef.current;
        if (elapsed >= NOTE_HOLD_DELAY) {
          setDisplayNote(matchedTuningNote);
        }
      } else {
        candidateNoteRef.current = null;
        candidateStartTimeRef.current = null;
      }
    }, 150); // Check every 50ms
  
    return () => clearInterval(interval);
  }, [matchedTuningNote, displayNote]);

  const centerIdx = Math.floor(ARC_SEGMENTS / 2);
  const activeSegmentIdx = (() => {
    if (targetNoteFrequency === 0) return centerIdx;
    const clamped = Math.max(
      -HZ_DEVIATION_FOR_FULL_SCALE,
      Math.min(HZ_DEVIATION_FOR_FULL_SCALE, hzDifference)
    );
    return Math.round(
      ((clamped + HZ_DEVIATION_FOR_FULL_SCALE) * (ARC_SEGMENTS - 1)) /
        (2 * HZ_DEVIATION_FOR_FULL_SCALE)
    );
  })();

  const arcSegments = useArcSegments({
    notes: Array.from({ length: ARC_SEGMENTS }, (_, i) => i),
    activeIndex: activeSegmentIdx,
    centerIndex: centerIdx,
    isInTune,
    hzDifference,
    radiusInner: ARC_RADIUS_INNER,
    radiusOuter: ARC_RADIUS_OUTER,
    centerX: ARC_CENTER_X,
    centerY: ARC_CENTER_Y,
    yellowRange: YELLOW_RANGE,
  });

  const pointer = usePointerShape(frequency, displayCents);

  return (
    <div className="tuner-display">
      <div className="tuner-header">
        <button
          className="toggle-info-button"
          onClick={() => setShowInfo((prev) => !prev)}
          aria-label="Toggle Frequency Info"
        >
          <img
            className="toggle-info-button__icon"
            src="src/assets/i.svg"
            alt="Toggle info"
            width={24}
            height={24}
          />
        </button>

        {showInfo && (
          <div className="tuner-freq">
            {frequency ? `${frequency.toFixed(1)} Hz` : "-- Hz"}
            <div className="tuner-expected-hz">
              {targetNoteFrequency
                ? `${targetNoteFrequency.toFixed(2)}Hz (${matchedTuningNote})`
                : "--"}
            </div>
          </div>
        )}
      </div>

      <div className="headstock">
        <Headstock
          instrument={instrumentName.toLowerCase()}
          tuningNotes={tuningNotes}
          tunedNotes={tunedNotes}
          targetNoteFrequency={targetNoteFrequency}
        />
      </div>

      <div className="tuner-arc-container">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="tuner-arc-svg tuner-arc-tilt"
        >
          <circle
            cx={ARC_CENTER_X}
            cy={ARC_CENTER_Y}
            r="3"
            fill="red"
            display="none"
          />
          {arcSegments.map(({ key, points, fill, opacity, className }) => (
            <polygon
              key={key}
              points={points}
              fill={fill}
              opacity={opacity}
              className={className}
            />
          ))}
          <polygon
            points={pointer.points}
            fill="#ff3b3b"
            opacity={pointer.opacity}
            className={`tuner-pointer ${pointer.glowing ? "pointer-glow" : ""}`}
          />
        </svg>
      </div>

      <div className="tuner-note-row" style={{ marginTop: "-10px" }}>
      <span className="tuner-note">{displayLabel}</span>
      </div>
    </div>
  );
};

export default React.memo(TunerDisplay);