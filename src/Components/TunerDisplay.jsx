import React, { useMemo, useCallback, useEffect, useState } from 'react';
import './TunerDisplay.scss';


const ARC_SEGMENTS = 21;
const ARC_SPAN = 50;
const YELLOW_RANGE = 2;
const TUNING_THRESHOLD = 5;
const SVG_WIDTH = 320;
const SVG_HEIGHT = 190;
const ARC_RADIUS_INNER = 100;
const ARC_RADIUS_OUTER = 140;
const ARC_CENTER_X = SVG_WIDTH / 2;
const ARC_CENTER_Y = SVG_HEIGHT;
const POINTER_HEIGHT = 64;
const POINTER_BASE_WIDTH = 28;
const IN_TUNE_HZ_TOLERANCE = 1; // 1 Hz tolerance for being 'in tune'

const INSTRUMENT_NOTES = {
  guitar: {
    name: 'Guitar',
    notes: {
      'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00,
      'A#2': 116.54, 'B2': 123.47, 'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
      'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
      'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
      'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51,
      'E6': 1318.51
    }
  },
  ukulele: {
    name: 'Ukulele',
    notes: {
      'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
      'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
      'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50
    }
  },
  banjo: {
    name: 'Banjo',
    notes: {
      'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00,
      'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
      'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99
    }
  },
  violin: {
    name: 'Violin',
    notes: {
      'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
      'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
      'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50,
      'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
      'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66,
      'B6': 1975.53, 'C7': 2093.00
    }
  }
};

const TunerDisplay = ({ frequency = 0, targetNote = 'E2', instrument = 'Guitar' }) => {
  const halfSegmentAngle = 180 / SVG_WIDTH / 2;
  

  const centerIdx = Math.floor(ARC_SEGMENTS / 2);

  // Calculate cents between detected frequency and target note (always, for pointer/highlight)
  const notes = INSTRUMENT_NOTES[instrument.toLowerCase()].notes;
  const targetFrequency = notes[targetNote];
  let cents = 0;
  if (frequency > 0 && targetFrequency > 0) {
    cents = Math.round(1200 * Math.log2(frequency / targetFrequency));
  }

  // In-tune logic: within 1 Hz of target frequency
  const isInTune = Math.abs(frequency - targetFrequency) <= IN_TUNE_HZ_TOLERANCE;

  // Optionally, still find the closest note for display only
  const noteValues = Object.entries(notes);
  const lowestNote = noteValues[0][0];
  const highestNote = noteValues[noteValues.length - 1][0];
  let closestNote = lowestNote;
  let minDifference = Math.abs(frequency - notes[lowestNote]);
  for (const [note, noteFreq] of Object.entries(notes)) {
    const difference = Math.abs(frequency - noteFreq);
    if (difference < minDifference) {
      minDifference = difference;
      closestNote = note;
    }
  }

  // Use cents for pointerIdx calculation as before
  const normalizedCents = Math.max(-ARC_SPAN, Math.min(ARC_SPAN, cents));
  const segmentIndex = Math.round((normalizedCents + ARC_SPAN) * (ARC_SEGMENTS - 1) / (2 * ARC_SPAN));
  const pointerIdx = Math.max(0, Math.min(ARC_SEGMENTS - 1, segmentIndex));

  const colorCounts = useMemo(() => ({
    blue: 0,
    red: 0,
    yellow: 0,
    pointer: 0
  }), []);

  const getSegmentColor = useCallback((idx, centerIdx, isPointer, _isInTune) => {
    const yellowStart = centerIdx - YELLOW_RANGE;
    const yellowEnd = centerIdx + YELLOW_RANGE;

    // Special case for pointer
    if (isPointer) {
      return isInTune ? '#00ff00' : '#ff3b3b';
    }

    // Center segment is green if in tune
    if (isInTune && idx === centerIdx) {
      return '#00ff00';
    }

    const isYellow = idx >= yellowStart && idx <= yellowEnd;
    if (isYellow) {
      colorCounts.yellow++;
      return '#ffd700';
    }

    const isBlue = idx < yellowStart;
    const isRed = idx > yellowEnd;

    if (isBlue) {
      colorCounts.blue++;
      return '#0095ff';
    }
    if (isRed) {
      colorCounts.red++;
      return '#ff3b3b';
    }

    return '#ff3b3b';
  }, [isInTune, centerIdx]);

  const arcSegments = useMemo(() => {
    const colorCounts = { red: 0, yellow: 0, blue: 0, pointer: 0 };
  
    const yellowStart = centerIdx - YELLOW_RANGE;
    const yellowEnd = centerIdx + YELLOW_RANGE;
  
    // Calculate the angle spanned by each segment
    const segmentAngle = 180 / ARC_SEGMENTS;
    // Generate 22 points for 21 segments, offset by half a segment
    const arcPoints = Array.from({ length: ARC_SEGMENTS + 1 }).map((_, i) => {
      const angle = 180 - (i * 180) / ARC_SEGMENTS;
      return {
        inner: {
          x: ARC_CENTER_X + ARC_RADIUS_INNER * Math.cos((Math.PI / 180) * angle),
          y: ARC_CENTER_Y - ARC_RADIUS_INNER * Math.sin((Math.PI / 180) * angle)
        },
        outer: {
          x: ARC_CENTER_X + ARC_RADIUS_OUTER * Math.cos((Math.PI / 180) * angle),
          y: ARC_CENTER_Y - ARC_RADIUS_OUTER * Math.sin((Math.PI / 180) * angle)
        }
      };
    });
  
    const segments = Array.from({ length: ARC_SEGMENTS }).map((_, i) => {
      // Use arcPoints[i] and arcPoints[i+1] for segment boundaries
      const x1 = arcPoints[i].inner.x;
      const y1 = arcPoints[i].inner.y;
      const x2 = arcPoints[i].outer.x;
      const y2 = arcPoints[i].outer.y;
      const x3 = arcPoints[i + 1].outer.x;
      const y3 = arcPoints[i + 1].outer.y;
      const x4 = arcPoints[i + 1].inner.x;
      const y4 = arcPoints[i + 1].inner.y;
  
      const isPointer = i === pointerIdx;
      const shouldGlow = isPointer && closestNote === targetNote && isInTune;
  
      // Count colors
      if (i >= yellowStart && i <= yellowEnd) {
        colorCounts.yellow++;
      } else if (i < yellowStart) {
        colorCounts.blue++;
      } else {
        colorCounts.red++;
      }
  
      if (isPointer) {
        colorCounts.pointer++;
      }
  
      let fillColor;
      if (isPointer) {
        fillColor = isInTune ? '#00ff00' : '#ff3b3b';
      } else if (i >= yellowStart && i <= yellowEnd) {
        fillColor = '#ffd700';
      } else if (i < yellowStart) {
        fillColor = '#0095ff';
      } else {
        fillColor = '#ff3b3b';
      }
  
      const centerAngle = (i * 180) / (ARC_SEGMENTS - 1);
  
      return {
        key: i,
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
        fill: fillColor,
        opacity: isPointer ? 1 : 0.7,
        className: (shouldGlow ? 'glow-highlight ' : '') + (isPointer ? 'highlighted ' : '') + 'tuner-arc-segment'
      };
    });
  
    
  
    return segments;
  }, [pointerIdx, centerIdx, closestNote, targetNote, isInTune]);
  
  
  

  

  const pointerPosition = useMemo(() => {
    // Calculate the midpoint angle of the center segment
    const angle1 = 180 - (centerIdx * 180) / (ARC_SEGMENTS - 1);
    const angle2 = 180 - ((centerIdx + 1) * 180) / (ARC_SEGMENTS - 1);
    const centerAngle = (angle1 + angle2) / 2;

    // Adjust for SVG rotation so pointer is visually centered
    const adjustedPointerAngle = centerAngle + halfSegmentAngle * 12.5;
    const topX = ARC_CENTER_X + ARC_RADIUS_OUTER * Math.cos((Math.PI / 180) * adjustedPointerAngle);
    const topY = ARC_CENTER_Y - ARC_RADIUS_OUTER * Math.sin((Math.PI / 180) * adjustedPointerAngle);
    const pointerTipY = topY - 16;
    const pointerBaseY = pointerTipY - POINTER_HEIGHT;

    return {
      points: `${topX - POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX + POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX},${pointerTipY}`,
      opacity: frequency > 0 ? 1 : 0.3
    };
  }, [frequency, halfSegmentAngle]);

  // Utility function to get frequency for a note
  function getFrequencyForNote(note) {
    const A4 = 440;
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/^([A-G]#?)(-?\d)$/);
    if (!match) return null;
    const [, n, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    const nIndex = NOTES.indexOf(n);
    if (nIndex === -1) return null;
    const semitonesFromA4 = nIndex - 9 + (octave - 4) * 12;
    return +(A4 * Math.pow(2, semitonesFromA4 / 12)).toFixed(2);
  }

  const expectedHz = getFrequencyForNote(targetNote);

  // Debug: Log pointer calculation values
  useEffect(() => {
    console.log('[TunerDisplay Debug]', {
      cents,
      normalizedCents,
      segmentIndex,
      pointerIdx,
      centerIdx,
      ARC_SEGMENTS,
      ARC_SPAN
    });
  }, [cents, normalizedCents, segmentIndex, pointerIdx, centerIdx]);

  return (
    <div className="tuner-display">
      <div className="tuner-header">
        <div className="tuner-freq">{frequency ? `${frequency.toFixed(1)} Hz` : '-- Hz'}</div>
        <div className="tuner-mode">{instrument}</div>
      </div>
      <div className="tuner-expected-hz">
        Expected: {expectedHz ? `${expectedHz} Hz (${targetNote})` : '--'}
      </div>
      <div className="tuner-arc-container">
        <svg 
          width={SVG_WIDTH} 
          height={SVG_HEIGHT} 
          viewBox="0 0 300 300"
          className="tuner-arc-svg tuner-arc-tilt"
        >
          {/* Render segments in order from back to front */}
          {arcSegments.map(segment => (
            <polygon
              key={segment.key}
              points={segment.points}
              fill={segment.fill}
              opacity={segment.opacity}
              className={segment.className}
            />
          ))}
          
          {/* Center pointer - render last so it's on top */}
          <polygon
            points={pointerPosition.points}
            fill="#ff3b3b"
            opacity={pointerPosition.opacity}
            className="tuner-pointer"
          />
        </svg>
      </div>
      <div className="tuner-note-row" style={{ marginTop: '-10px' }}>
        <span className="tuner-arrow left" style={{ opacity: cents < -TUNING_THRESHOLD ? 1 : 0.3 }}>▶</span>
        <span className="tuner-note">{closestNote}</span>
        <span className="tuner-arrow right" style={{ opacity: cents > TUNING_THRESHOLD ? 1 : 0.3 }}>◀</span>
      </div>
    </div>
  );
};

export default React.memo(TunerDisplay);
