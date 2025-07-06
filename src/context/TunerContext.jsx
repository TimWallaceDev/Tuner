import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { INSTRUMENTS_DATA } from '../constants/tuningData';
import { useNoteDetector } from '../hooks/useNoteDetector';

const TunerContext = createContext();

export function TunerProvider({ children }) {
  // ─── Instrument & Tuning ───────────────────────────────────────────────
  const [instrument, setInstrument] = useState('guitar');
  const [tuningName, setTuningName] = useState(
    INSTRUMENTS_DATA['guitar'].defaultTuning
  );

  // ─── Raw Detection ──────────────────────────────────────────────────────
  const {
    frequency: rawFrequency,
    note: rawNote,
    cents: rawCents,
  } = useNoteDetector() || {};

  // ─── Smoothing & Stability ─────────────────────────────────────────────
  const SMOOTHING_ALPHA = 0.25;          // smoothing factor
  const NOTE_HOLD_DELAY = 250;          // ms to hold new note before switching
  const MAX_SILENCE_MS   = 800;          // ms of silence before fallback
  const MIN_HZ_CHANGE    = 2.5;          // require this Hz jump to start a note change

  // Buffers & refs for smoothing & fallback
  const bufferRef         = useRef([]);  // rolling window of rawFrequency
  const lastDetectRef     = useRef(Date.now());
  const lastValidFreqRef  = useRef(0);
  const lastValidCentsRef = useRef(0);
  const lastValidNoteRef  = useRef(null);

  // Candidate logic
  const stableNoteRef         = useRef(null);
  const candidateNoteRef      = useRef(null);
  const candidateStartRef     = useRef(0);

  // Exposed state
  const [frequency, setFrequency] = useState(0);
  const [note,      setNote     ] = useState(null);
  const [cents,     setCents    ] = useState(0);

  // ─── When raw detection comes in ────────────────────────────────────────
  useEffect(() => {
    if (rawFrequency > 20 && rawFrequency < 5000 && rawNote) {
      const now = Date.now();
      lastDetectRef.current = now;

      // keep history for fallback
      lastValidFreqRef.current  = rawFrequency;
      lastValidCentsRef.current = rawCents;
      lastValidNoteRef.current  = rawNote;

      // smoothing rolling buffer
      const buf = bufferRef.current;
      buf.push(rawFrequency);
      if (buf.length > 6) buf.shift();
      const avgFreq = buf.reduce((a, b) => a + b, 0) / buf.length;

      // update smoothed frequency & cents
      setFrequency(prev =>
        SMOOTHING_ALPHA * avgFreq + (1 - SMOOTHING_ALPHA) * prev
      );
      setCents(prev =>
        SMOOTHING_ALPHA * rawCents + (1 - SMOOTHING_ALPHA) * prev
      );

      // decide if note change candidate
      const current = stableNoteRef.current;
      const hzJump = Math.abs(rawFrequency - frequency);
      if (rawNote !== current && hzJump > MIN_HZ_CHANGE) {
        // new candidate
        if (candidateNoteRef.current !== rawNote) {
          candidateNoteRef.current  = rawNote;
          candidateStartRef.current = now;
        }
        // held long enough?
        if (now - candidateStartRef.current > NOTE_HOLD_DELAY) {
          stableNoteRef.current = rawNote;
          setNote(rawNote);
        }
      } else {
        // same note or not enough jump: reset candidate
        candidateNoteRef.current  = null;
        candidateStartRef.current = 0;
      }
    }
  }, [rawFrequency, rawNote, rawCents, frequency]);

  // ─── Fallback when silent ──────────────────────────────────────────────
  useEffect(() => {
    let raf;
    const tick = () => {
      const now = Date.now();
      if (now - lastDetectRef.current > MAX_SILENCE_MS) {
        // fade frequency towards last valid
        setFrequency(prev =>
          SMOOTHING_ALPHA * lastValidFreqRef.current + (1 - SMOOTHING_ALPHA) * prev
        );
        // fade cents similarly
        setCents(prev =>
          SMOOTHING_ALPHA * lastValidCentsRef.current + (1 - SMOOTHING_ALPHA) * prev
        );
        // if note drifted, snap back
        if (stableNoteRef.current !== lastValidNoteRef.current) {
          stableNoteRef.current = lastValidNoteRef.current;
          setNote(lastValidNoteRef.current);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ─── Reset tuning on instrument change ─────────────────────────────────
  useEffect(() => {
    setTuningName(INSTRUMENTS_DATA[instrument].defaultTuning);
  }, [instrument]);

  // ─── Build context value ───────────────────────────────────────────────
  const tuningNotes = useMemo(() => {
    const inst = INSTRUMENTS_DATA[instrument];
    return (inst.tunings[tuningName]?.notes || []);
  }, [instrument, tuningName]);

  const value = useMemo(() => ({
    instrument,
    setInstrument,
    tuningName,
    setTuningName,
    tuningNotes,
    frequency,
    note,
    cents,
  }), [
    instrument,
    tuningName,
    tuningNotes,
    frequency,
    note,
    cents,
  ]);

  return (
    <TunerContext.Provider value={value}>
      {children}
    </TunerContext.Provider>
  );
}

export function useTuner() {
  const ctx = useContext(TunerContext);
  if (!ctx) throw new Error("useTuner must be used within TunerProvider");
  return ctx;
}