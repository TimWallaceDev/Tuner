// src/Components/HeadStock.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { NOTE_FREQUENCIES }       from '../constants/tuningData';
import { IN_TUNE_HZ_TOLERANCE }   from '../constants/tuner';
import '../Components/HeadStock.scss';

export function Headstock({ instrument, tuningNotes = [], targetNoteFrequency = 0, targetCents = 0 }) {
  const [lockedNotes, setLockedNotes] = useState(new Set());

  // 1) Rolling buffer of the *same* in-tune note
  const noteBuffer     = useRef([]);
  const BUFFER_SIZE    = 1;         // require this many consecutive in-tune readings
  const Cents_THRESHOLD = 10;       // only consider when within ±10 cents

  // 2) Candidate & its hold timer
  const candidateRef   = useRef(null);
  const holdTimerRef   = useRef(null);

  // Compute which tuningNote (if any) we're actually centered on
  const closestNote = useMemo(() => {
    if (targetNoteFrequency <= 0) return null;
    return tuningNotes.find((note) => {
      const diffHz    = Math.abs(targetNoteFrequency - NOTE_FREQUENCIES[note]);
      const diffCents = Math.abs(targetCents);
      return diffHz <= IN_TUNE_HZ_TOLERANCE && diffCents <= Cents_THRESHOLD;
    }) || null;
  }, [targetNoteFrequency, targetCents, tuningNotes]);

  // Reset whenever the instrument or tuning changes
  useEffect(() => {
    setLockedNotes(new Set());
    noteBuffer.current = [];
    candidateRef.current = null;
    clearTimeout(holdTimerRef.current);
  }, [instrument, tuningNotes]);

  // Main “lock a peg” logic
  useEffect(() => {
    // Step 1: if we have a valid closestNote, push it; otherwise reset buffer
    if (closestNote) {
      const buf = noteBuffer.current;
      buf.push(closestNote);
      if (buf.length > BUFFER_SIZE) buf.shift();
    } else {
      noteBuffer.current = [];
      clearTimeout(holdTimerRef.current);
      candidateRef.current = null;
      return;
    }

    // Step 2: if buffer isn’t full yet, wait
    if (noteBuffer.current.length < BUFFER_SIZE) {
      return;
    }

    // Step 3: check that *all* entries in the buffer match the same note
    const allSame = noteBuffer.current.every((n) => n === noteBuffer.current[0]);
    if (!allSame) {
      // if it drifted, start over
      noteBuffer.current.shift();
      clearTimeout(holdTimerRef.current);
      candidateRef.current = null;
      return;
    }

    // This stable candidate
    const mode = noteBuffer.current[0];
    if (lockedNotes.has(mode)) {
      // already locked, nothing to do
      return;
    }

    // If it’s a brand-new candidate, (re)start the 2 s timer
    if (candidateRef.current !== mode) {
      candidateRef.current = mode;
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        setLockedNotes((prev) => new Set(prev).add(mode));
        candidateRef.current = null;
      }, 2000);
    }
    // else timer is already running—let it finish

  }, [closestNote, lockedNotes]);

  const isLocked = (note) => lockedNotes.has(note);

  // Lay out pegs: left half reversed, then right half
  const pegLayout = useMemo(() => {
    const half = Math.ceil(tuningNotes.length / 2);
    return [
      ...tuningNotes.slice(0, half).reverse(),
      ...tuningNotes.slice(half),
    ];
  }, [tuningNotes]);

  // Your existing SVG definitions follow...
  const layouts = {
    guitar: {
      svgProps: { width: '400', height: '400', viewBox: '30 30 150 180' },
      pathD: 'M 64.966777,196.10263 C 71.461204,145.30912 71.1023,108.89707 59.233186,59.622389 92.33014,36.651029 121.3659,38.595133 147.33328,60.457796 136.71351,115.96824 134.97312,147.97916 141.47749,196.43849 Z',
      pegs: [
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 56.53, cy: 159.61 },
        { cx: 153, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
        { cx: 153, cy: 159.61 },
      ],
    },
  
    bass: {
      svgProps: { width: '400', height: '500', viewBox: '35 35 140 170' },
      pathD: 'M 64.9,196 C 71.4,145 71.1,108 59.2,59 C 92.3,36 121.3,38 147.3,60 C 136.7,115 134.9,147 141.4,196 Z',
      pegs: [
        { cx: 53, cy: 90 },
        { cx: 56, cy: 120 },
        { cx: 153, cy: 90 },
        { cx: 153, cy: 120 },
      ],
    },
  
    ukulele: {
      svgProps: { width: '400', height: '300', viewBox: '40 30 130 140' },
      pathD: 'M 65.903438,153.63488 C 72.422368,115.82269 72.06211,88.716492 60.148215,52.034969 93.37004,34.934412 122.51535,36.381661 148.5807,52.65687 137.92087,93.980479 136.17391,117.81035 142.70282,153.8849 Z',
      pegs: [
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 152.5, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
      ],
    },
  
    banjo: {
      svgProps: { width: '400', height: '300', viewBox: '40 30 130 140' },
      pathD: 'M 66.5,150 C 72,120 72,90 60,50 C 90,30 125,30 150,55 C 140,100 135,130 142,155 Z',
      pegs: [
        { cx: 50, cy: 80 },
        { cx: 55, cy: 110 },
        { cx: 55, cy: 140 },
        { cx: 156, cy: 80 },
        { cx: 156, cy: 110 },
      ],
    },
  
    violin: {
      svgProps: { width: '400', height: '300', viewBox: '45 35 120 130' },
      pathD: 'M 65,150 C 70,120 70,90 60,55 C 90,35 125,35 150,60 C 140,95 135,120 140,150 Z',
      pegs: [
        { cx: 55, cy: 85 },
        { cx: 55, cy: 115 },
        { cx: 155, cy: 85 },
        { cx: 155, cy: 115 },
      ],
    },
  
    viola: {
      svgProps: { width: '400', height: '300', viewBox: '45 35 120 130' },
      pathD: 'M 65,150 C 70,120 70,90 60,55 C 90,35 125,35 150,60 C 140,95 135,120 140,150 Z',
      pegs: [
        { cx: 60, cy: 75 },
        { cx: 60, cy: 105 },
        { cx: 150, cy: 75 },
        { cx: 150, cy: 105 },
      ],
    },
  
  
  
    cello: {
      svgProps: { width: '400', height: '500', viewBox: '35 35 140 180' },
      pathD: 'M 65,200 C 72,150 72,110 60,60 C 90,35 125,35 150,65 C 140,115 135,150 140,200 Z',
      pegs: [
        { cx: 55, cy: 85 },
        { cx: 55, cy: 120 },
        { cx: 156, cy: 85 },
        { cx: 156, cy: 120 },
      ],
    },
  
  };

  const layout = layouts[instrument];
  if (!layout || pegLayout.length !== layout.pegs.length) {
    return <div className="headstock-placeholder">Graphics coming soon…</div>;
  }

  return (
    <svg {...layout.svgProps} className="headstock-svg">
      <path fill="none" stroke="#000" strokeWidth={2} d={layout.pathD} />

      {pegLayout.map((note, i) => {
        const peg     = layout.pegs[i];
        const active  = note === closestNote;
        const locked  = isLocked(note);

        return (
          <g key={note} className="peg-group">
            <ellipse
              cx={peg.cx}
              cy={peg.cy}
              rx={6.6}
              ry={10.4}
              fill={locked ? '#10B981' : active ? '#a7f3d0' : 'transparent'}
              stroke={locked || active ? '#10B981' : '#000'}
              strokeWidth={1.5}
            />
            <text
              x={peg.cx}
              y={peg.cy + 20}
              textAnchor="middle"
              className="peg-note"
            >
              {note}
            </text>
          </g>
        );
      })}

      <text x="72" y="72" className="headstock-brand">
        {instrument.toUpperCase()}
      </text>
    </svg>
  );
}