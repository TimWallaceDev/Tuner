import React, { useMemo, useEffect } from 'react';
import './TunerDisplay.scss';
// NOTE_FREQUENCIES and other data are now primarily managed by HomePage
// and relevant values are passed as props.
// import { NOTE_FREQUENCIES } from '../data/tuningData'; // Ensure this path is correct if you re-enable

const ARC_SEGMENTS = 21;
const ARC_SPAN = 50; // Represents +/- 50 cents
const YELLOW_RANGE = 2; // How many segments on each side of center are yellow
const TUNING_THRESHOLD = 5; // Cents threshold for showing tuning arrows
const SVG_WIDTH = 320;
const SVG_HEIGHT = 190;
const ARC_RADIUS_INNER = 100;
const ARC_RADIUS_OUTER = 140;
const ARC_CENTER_X = SVG_WIDTH / 2;
const ARC_CENTER_Y = SVG_HEIGHT; // Arc base is at the bottom of the SVG
const POINTER_HEIGHT = 64;
const POINTER_BASE_WIDTH = 28;
const IN_TUNE_HZ_TOLERANCE = 2; // Hz tolerance for being 'in tune' (visual)
const HZ_DEVIATION_FOR_FULL_SCALE = 50; // +/- Hz deviation that maps to the full arc extent (e.g., 50Hz)

const TunerDisplay = ({
  frequency = 0,
  note: detectedNote, // Closest note to the current frequency, from HomePage
  cents: centsFromProps, // Cents difference, calculated by HomePage
  targetNoteName = 'E2', // Name of the target note for the current tuning string
  targetNoteFrequency = 0, // Frequency of the target note
  instrumentName = 'Guitar', // Name of the selected instrument
  // isAnalyzing, // Prop from HomePage, can be used if needed for UI changes
}) => {
  const halfSegmentAngle = 180 / SVG_WIDTH / 2; // Used for pointer positioning

  const centerIdx = Math.floor(ARC_SEGMENTS / 2);

  // Use cents directly from props, as it's calculated in HomePage
  const cents = centsFromProps;

  // In-tune logic: based on targetNoteFrequency and detected frequency
  const isInTune = targetNoteFrequency > 0 && Math.abs(frequency - targetNoteFrequency) <= IN_TUNE_HZ_TOLERANCE;

  // The 'detectedNote' (closest note to current frequency) is passed as a prop from HomePage.
  const closestNote = detectedNote;

  const hzDifference = frequency - targetNoteFrequency;

  // Calculate the "active" segment index based on Hz difference.
  const activeSegmentIdxByHz = (() => {
    // If in tune, the concept of an "active" off-tune segment isn't primary, center is active.
    // However, for coloring logic when not inTune, calculate where it would be.
    if (targetNoteFrequency === 0) return centerIdx; // Avoid division by zero if target is 0

    // Clamp hzDifference to the displayable range for scaling
    const normalizedHzDifference = Math.max(-HZ_DEVIATION_FOR_FULL_SCALE, Math.min(HZ_DEVIATION_FOR_FULL_SCALE, hzDifference));

    // Map normalized Hz difference to a segment index
    // (normalizedHzDifference + HZ_DEVIATION_FOR_FULL_SCALE) -> range [0, 2 * HZ_DEVIATION_FOR_FULL_SCALE]
    const index = Math.round( (normalizedHzDifference + HZ_DEVIATION_FOR_FULL_SCALE) * (ARC_SEGMENTS - 1) / (2 * HZ_DEVIATION_FOR_FULL_SCALE) );
    return Math.max(0, Math.min(ARC_SEGMENTS - 1, index)); // Ensure index is within bounds
  })();

  const arcSegments = useMemo(() => {
    const yellowStart = centerIdx - YELLOW_RANGE;
    const yellowEnd = centerIdx + YELLOW_RANGE;

    // arcPoints calculation remains the same
    const arcPoints = Array.from({ length: ARC_SEGMENTS + 1 }).map((_, i) => {
      const angle = 180 - (i * 180) / ARC_SEGMENTS; // Angles from 180 (left) to 0 (right)
      return {
        inner: {
          x: ARC_CENTER_X + ARC_RADIUS_INNER * Math.cos((Math.PI / 180) * angle),
          y: ARC_CENTER_Y - ARC_RADIUS_INNER * Math.sin((Math.PI / 180) * angle),
        },
        outer: {
          x: ARC_CENTER_X + ARC_RADIUS_OUTER * Math.cos((Math.PI / 180) * angle),
          y: ARC_CENTER_Y - ARC_RADIUS_OUTER * Math.sin((Math.PI / 180) * angle),
        },
      };
    });

    return Array.from({ length: ARC_SEGMENTS }).map((_, i) => {
      const x1 = arcPoints[i].inner.x;
      const y1 = arcPoints[i].inner.y;
      const x2 = arcPoints[i].outer.x;
      const y2 = arcPoints[i].outer.y;
      const x3 = arcPoints[i + 1].outer.x;
      const y3 = arcPoints[i + 1].outer.y;
      const x4 = arcPoints[i + 1].inner.x;
      const y4 = arcPoints[i + 1].inner.y;

      let fillColor;
      let opacity = 0.7;
      let isVisuallyActiveSegment = false;
      let shouldGlow = false;

      if (isInTune) {
        // If IN TUNE, the center segment is the active one and green.
        if (i === centerIdx) {
          fillColor = '#00ff00'; // Green
          opacity = 1;
          isVisuallyActiveSegment = true;
          // Glow if the detected note also matches the target note name
          shouldGlow = closestNote === targetNoteName;
        } else {
          fillColor = '#666666'; // Dim other segments when in tune
          opacity = 0.4;
        }
      } else {
        // If NOT IN TUNE, color based on rawPointerIdx and proximity
        isVisuallyActiveSegment = (i === activeSegmentIdxByHz);

        if (isVisuallyActiveSegment) {
          // The segment at rawPointerIdx is more prominent
          // Color based on actual hzDifference direction
          fillColor = (hzDifference < 0) ? '#0095ff' : '#ff3b3b'; // Blue for flat, Red for sharp
          opacity = 1;
        } else if (i >= yellowStart && i <= yellowEnd) {
          fillColor = '#ffd700'; // Yellow
          opacity = 0.7; // Yellow segments are less prominent than the active one
        } else if (i < yellowStart) {
          fillColor = '#0095ff'; // Blue (flat)
          opacity = 0.5; // Dimmer for segments further away
        } else {
          fillColor = '#ff3b3b'; // Red (sharp)
          opacity = 0.5; // Dimmer for segments further away
        }
      }

      return {
        key: i,
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
        fill: fillColor,
        opacity: opacity,
        className: (shouldGlow ? 'glow-highlight ' : '') + (isVisuallyActiveSegment ? 'highlighted ' : '') + 'tuner-arc-segment',
      };
    });
  }, [activeSegmentIdxByHz, centerIdx, closestNote, targetNoteName, isInTune, hzDifference]);


  const pointerPosition = useMemo(() => {
    // This pointer is static, always pointing to the center of the arc.
    // The segments change color to indicate tuning.
    const angle1 = 180 - (centerIdx * 180) / (ARC_SEGMENTS - 1);
    const angle2 = 180 - ((centerIdx + 1) * 180) / (ARC_SEGMENTS - 1);
    const centerAngle = (angle1 + angle2) / 2;

    const adjustedPointerAngle = centerAngle + halfSegmentAngle * 12.5; // Fine-tuning visual center
    const topX = ARC_CENTER_X + ARC_RADIUS_OUTER * Math.cos((Math.PI / 180) * adjustedPointerAngle);
    const topY = ARC_CENTER_Y - ARC_RADIUS_OUTER * Math.sin((Math.PI / 180) * adjustedPointerAngle);
    const pointerTipY = topY - 16; // Offset for visual appearance
    const pointerBaseY = pointerTipY - POINTER_HEIGHT;

    return {
      points: `${topX - POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX + POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX},${pointerTipY}`,
      opacity: frequency > 0 ? 1 : 0.3, // Show pointer if frequency is detected
    };
  }, [frequency, halfSegmentAngle, centerIdx]); // centerIdx added as it's used in angle calculation

  // Expected Hz is now directly from props
  const expectedHz = targetNoteFrequency;

  // Debug: Log received props and key calculated values
  useEffect(() => {
    console.log('[TunerDisplay Props & State]', {
      frequency,
      detectedNote,
      centsFromProps,
      targetNoteName,
      targetNoteFrequency,
      instrumentName,
      isInTune,
      hzDifference,
      activeSegmentIdxByHz,
    });
  }, [frequency, detectedNote, centsFromProps, targetNoteName, targetNoteFrequency, instrumentName, isInTune, hzDifference, activeSegmentIdxByHz]);

  return (
    <div className="tuner-display">
      <div className="tuner-header">
        <div className="tuner-freq">{frequency ? `${frequency.toFixed(1)} Hz` : '-- Hz'}</div>
        <div className="tuner-mode">{instrumentName}</div>
      </div>
      <div className="tuner-expected-hz">
        Expected: {expectedHz ? `${expectedHz.toFixed(2)} Hz (${targetNoteName})` : '--'}
      </div>
      <div className="tuner-arc-container">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox="0 0 300 300" // Adjusted viewBox for better scaling if needed
          className="tuner-arc-svg tuner-arc-tilt"
        >
          {arcSegments.map(segment => (
            <polygon
              key={segment.key}
              points={segment.points}
              fill={segment.fill}
              opacity={segment.opacity}
              className={segment.className}
            />
          ))}
          <polygon
            points={pointerPosition.points}
            fill="#ff3b3b" // Pointer color (can be styled further)
            opacity={pointerPosition.opacity}
            className="tuner-pointer"
          />
        </svg>
      </div>
      <div className="tuner-note-row" style={{ marginTop: '-10px' }}>
        <span className="tuner-arrow left" style={{ opacity: cents < -TUNING_THRESHOLD ? 1 : 0.3 }}>▶</span>
        <span className="tuner-note">{closestNote || '--'}</span> {/* Show detected note or placeholder */}
        <span className="tuner-arrow right" style={{ opacity: cents > TUNING_THRESHOLD ? 1 : 0.3 }}>◀</span>
      </div>
    </div>
  );
};

export default React.memo(TunerDisplay);
