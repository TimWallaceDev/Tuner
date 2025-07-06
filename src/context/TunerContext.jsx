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
    const [instrument, setInstrument] = useState('guitar');
    const [tuningName, setTuningName] = useState(INSTRUMENTS_DATA['guitar'].defaultTuning);
  
    const {
      frequency: detectedFrequency,
      note: detectedNote,
      cents: detectedCents,
    } = useNoteDetector() || {};
  
    const [smoothedFrequency, setSmoothedFrequency] = useState(0);
    const [smoothedNote, setSmoothedNote] = useState(null);
    const [smoothedCents, setSmoothedCents] = useState(0);
  
    const lastDetectionTimeRef = useRef(0);
    const stableNoteRef = useRef(null);
    const noteChangeTimeoutRef = useRef(null);
  
    const lastValidFrequencyRef = useRef(0);
    const lastValidNoteRef = useRef(null);
    const lastValidCentsRef = useRef(0);
  
    const candidateNoteRef = useRef(null);
    const candidateNoteStartRef = useRef(null);
  
    const SMOOTHING_ALPHA = 0.25;
    const NOTE_HOLD_DELAY = 250;
    const MAX_SILENCE_MS = 1000;
    const NOTE_CHANGE_MIN_HZ_DIFF = 2.5; // require meaningful jump in Hz to change note
  
    useEffect(() => {
      const isValid =
        detectedFrequency > 20 &&
        detectedFrequency < 2000 &&
        detectedNote != null;
  
      if (isValid) {
        const now = Date.now();
        lastDetectionTimeRef.current = now;
  
        // Update valid history
        lastValidFrequencyRef.current = detectedFrequency;
        lastValidNoteRef.current = detectedNote;
        lastValidCentsRef.current = detectedCents;
  
        // Smooth frequency & cents
        setSmoothedFrequency(prev =>
          SMOOTHING_ALPHA * detectedFrequency + (1 - SMOOTHING_ALPHA) * prev
        );
  
        setSmoothedCents(prev =>
          SMOOTHING_ALPHA * detectedCents + (1 - SMOOTHING_ALPHA) * prev
        );
  
        const currentNote = stableNoteRef.current;
  
        const noteChanged = detectedNote !== currentNote;
        const freqDiff = Math.abs(detectedFrequency - smoothedFrequency);
  
        // If we're hearing a different note and it seems stable
        if (noteChanged && freqDiff > NOTE_CHANGE_MIN_HZ_DIFF) {
          if (candidateNoteRef.current !== detectedNote) {
            candidateNoteRef.current = detectedNote;
            candidateNoteStartRef.current = now;
          }
  
          const heldDuration = now - candidateNoteStartRef.current;
  
          if (heldDuration > NOTE_HOLD_DELAY) {
            stableNoteRef.current = detectedNote;
            setSmoothedNote(detectedNote);
          }
        } else {
          // Same note as current, reset candidate
          candidateNoteRef.current = null;
          candidateNoteStartRef.current = null;
        }
      }
    }, [detectedFrequency, detectedNote, detectedCents]);
  
    // Fallback: hold last good data during silence
    useEffect(() => {
      let frameId;
  
      const tick = () => {
        const now = Date.now();
        const timeSinceLastDetection = now - lastDetectionTimeRef.current;
  
        if (timeSinceLastDetection > MAX_SILENCE_MS) {
          const fallbackFreq = lastValidFrequencyRef.current;
          const fallbackCents = lastValidCentsRef.current;
          const fallbackNote = lastValidNoteRef.current;
  
          setSmoothedFrequency(prev =>
            SMOOTHING_ALPHA * fallbackFreq + (1 - SMOOTHING_ALPHA) * prev
          );
  
          setSmoothedCents(prev =>
            SMOOTHING_ALPHA * fallbackCents + (1 - SMOOTHING_ALPHA) * prev
          );
  
          if (stableNoteRef.current !== fallbackNote) {
            stableNoteRef.current = fallbackNote;
            setSmoothedNote(fallbackNote);
          }
        }
  
        frameId = requestAnimationFrame(tick);
      };
  
      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    }, []);
  
    useEffect(() => {
      setTuningName(INSTRUMENTS_DATA[instrument].defaultTuning);
    }, [instrument]);
  
    const currentInstrument = INSTRUMENTS_DATA[instrument];
    const currentTuning = currentInstrument?.tunings?.[tuningName];
    const tuningNotes = currentTuning?.notes || [];
  
    const contextValue = useMemo(() => ({
      instrument,
      setInstrument,
      tuningName,
      setTuningName,
      tuningNotes,
      frequency: smoothedFrequency,
      note: smoothedNote,
      cents: smoothedCents,
    }), [
      instrument,
      tuningName,
      tuningNotes,
      smoothedFrequency,
      smoothedNote,
      smoothedCents,
    ]);
  
    return (
      <TunerContext.Provider value={contextValue}>
        {children}
      </TunerContext.Provider>
    );
  }
  
  export function useTuner() {
    const context = useContext(TunerContext);
    if (!context) {
      throw new Error("useTuner must be used within a TunerProvider");
    }
    return context;
  }