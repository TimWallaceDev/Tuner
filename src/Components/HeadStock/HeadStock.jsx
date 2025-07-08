import { useEffect, useMemo, useRef, useState } from 'react';
import { NOTE_FREQUENCIES } from '../../constants/tuningData';

export function Headstock({ instrument, tuningNotes = [], targetNoteFrequency = 0 }) {
  const [lockedNotes, setLockedNotes] = useState(new Set());
  const currentNoteRef = useRef(null);
  const timerRef = useRef(null);

  const currentNote = useMemo(() => {
    if (!targetNoteFrequency) return null;
    return tuningNotes.find((note) => NOTE_FREQUENCIES[note] === targetNoteFrequency) || null;
  }, [targetNoteFrequency, tuningNotes]);

  useEffect(() => {
    setLockedNotes(new Set());
    currentNoteRef.current = null;
    clearTimeout(timerRef.current);
  }, [instrument, tuningNotes]);
  // Timer logic for 1s sustained match
  useEffect(() => {
    if (!currentNote) {
      clearTimeout(timerRef.current);
      currentNoteRef.current = null;
      return;
    }

    if (lockedNotes.has(currentNote)) return;

    if (currentNoteRef.current !== currentNote) {
      clearTimeout(timerRef.current);
      currentNoteRef.current = currentNote;

      // Start 2s timer
      timerRef.current = setTimeout(() => {
        setLockedNotes((prev) => new Set(prev).add(currentNote));
        currentNoteRef.current = null;
      }, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [currentNote, lockedNotes]);

  const isLocked = (note) => lockedNotes.has(note);

  const pegLayout = useMemo(() => {
    const half = Math.ceil(tuningNotes.length / 2);
    const left = tuningNotes.slice(0, half).reverse();
    const right = tuningNotes.slice(half);
    return [...left, ...right];
  }, [tuningNotes]);

  const layouts = {
    guitar: {
      svgProps: { width: '400', height: '500', viewBox: '0 0 210 297' },
      pathD:
        'M 64.966777,196.10263 C 71.461204,145.30912 71.1023,108.89707 59.233186,59.622389 92.33014,36.651029 121.3659,38.595133 147.33328,60.457796 136.71351,115.96824 134.97312,147.97916 141.47749,196.43849 Z',
      pegs: [
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 56.53, cy: 159.61 },
        
        { cx: 151, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
        { cx: 153, cy: 159.61 },
      ],
    },
    ukulele: {
      svgProps: { width: '400', height: '300', viewBox: '0 0 210 200' },
      pathD:
        'M 65.903438,153.63488 C 72.422368,115.82269 72.06211,88.716492 60.148215,52.034969 93.37004,34.934412 122.51535,36.381661 148.5807,52.65687 137.92087,93.980479 136.17391,117.81035 142.70282,153.8849 Z',
      pegs: [
        
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 152.5, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
      ],
    },
  };

  const layout = layouts[instrument];
  if (!layout || pegLayout.length !== layout.pegs.length) {
    return <div>Graphics coming soon...</div>;
  }

  return (
    <svg {...layout.svgProps} className="max-w-full h-auto">
      <path
        style={{ fill: 'transparent', stroke: '#000', strokeWidth: 2 }}
        d={layout.pathD}
      />

      {/* Pegs */}
      {pegLayout.map((note, i) => {
        const peg = layout.pegs[i];
        const isActive = currentNote === note;
        const isGreen = isLocked(note);

        return (
          <g key={note}>
            <ellipse
              id={`peg-${i + 1}`}
              style={{
                fill: isGreen ? '#10B981' : isActive ? '#a7f3d0' : 'transparent',
                stroke: isGreen || isActive ? '#10B981' : '#000000',
                strokeWidth: 1.5,
                cursor: 'pointer',
              }}
              cx={peg.cx}
              cy={peg.cy}
              rx="6.62"
              ry="10.41"
            />
            <text
              x={peg.cx}
              y={peg.cy + 20}
              textAnchor="middle"
              style={{ fontSize: '10px', fill: '#000' }}
            >
              {note}
            </text>
          </g>
        );
      })}

      {/* Brand text */}
      <text
        style={{ fontSize: '8.5px', letterSpacing: '2.1px', fill: '#000000' }}
        x="81.355515"
        y="71.895561"
      >
        DELUXE
      </text>
    </svg>
  );
}