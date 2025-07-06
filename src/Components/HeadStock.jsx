import { useEffect, useMemo, useRef, useState } from 'react';
import { NOTE_FREQUENCIES } from '../constants/tuningData';
import { IN_TUNE_HZ_TOLERANCE,  } from '../constants/tuner';  
import '../Components/HeadStock.scss'
export function Headstock({ instrument, tuningNotes = [], targetNoteFrequency = 0 }) {
  const [lockedNotes, setLockedNotes] = useState(new Set());
  const currentNoteRef = useRef(null);
  const currentFreqRef = useRef(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
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
    if (!currentNote || lockedNotes.has(currentNote)) return;

    const expectedFreq = NOTE_FREQUENCIES[currentNote];
    const now = Date.now();

    // Start monitoring this note
    if (currentNoteRef.current !== currentNote) {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
      currentNoteRef.current = currentNote;
      currentFreqRef.current = targetNoteFrequency;

      let elapsed = 0;
      const start = now;

      intervalRef.current = setInterval(() => {
        const diff = Math.abs(targetNoteFrequency - expectedFreq);
        const stable = diff <= IN_TUNE_HZ_TOLERANCE;

        if (!stable) {
          clearInterval(intervalRef.current);
          clearTimeout(timerRef.current);
          currentNoteRef.current = null;
          return;
        }

        elapsed = Date.now() - start;
        if (elapsed >= 2000) {
          setLockedNotes((prev) => new Set(prev).add(currentNote));
          clearInterval(intervalRef.current);
          clearTimeout(timerRef.current);
          currentNoteRef.current = null;
        }
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, [currentNote, targetNoteFrequency, lockedNotes]);
  

  const isLocked = (note) => lockedNotes.has(note);

  const pegLayout = useMemo(() => {
    const half = Math.ceil(tuningNotes.length / 2);
    const left = tuningNotes.slice(0, half).reverse();
    const right = tuningNotes.slice(half);
    return [...left, ...right];
  }, [tuningNotes]);

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
    return <div>Graphics coming soon...</div>;
  }

  return (
    <svg {...layout.svgProps} className="max-w-full h-auto" preserveAspectRatio='xMidYMid meet'>
      {/* Headstock body */}
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
            <ellipse className='peg'
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
              style={{ fontSize: '10px',  }}
              className='peg-note'
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