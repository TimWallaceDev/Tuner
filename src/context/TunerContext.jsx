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
      cents: detectedCents
    } = useNoteDetector() || {};
  
    // Refs to store last valid values
    const lastValidFrequencyRef = useRef(0);
    const lastValidNoteRef = useRef(null);
    const lastValidCentsRef = useRef(0);
  
    // Update refs only if we get a non-null, non-zero frequency
    useEffect(() => {
      if (detectedFrequency && detectedNote != null) {
        lastValidFrequencyRef.current = detectedFrequency;
        lastValidNoteRef.current = detectedNote;
        lastValidCentsRef.current = detectedCents;
      }
    }, [detectedFrequency, detectedNote, detectedCents]);
  
    // Reset tuning when instrument changes
    useEffect(() => {
      setTuningName(INSTRUMENTS_DATA[instrument].defaultTuning);
    }, [instrument]);
  
    const currentInstrument = INSTRUMENTS_DATA[instrument];
    const currentTuning = currentInstrument?.tunings?.[tuningName];
    const tuningNotes = currentTuning?.notes || [];
    const SMOOTHING_ALPHA = 0.2; // Lower = more smoothing

const smoothedFrequencyRef = useRef(0);
const smoothedNoteRef = useRef(null);
const smoothedCentsRef = useRef(0);

// Stability timer refs
const stableNoteRef = useRef(null);
const noteChangeTimeoutRef = useRef(null);

// Track smoothed versions
useEffect(() => {
  if (!detectedFrequency || detectedNote == null) return;

  // Smooth frequency
  smoothedFrequencyRef.current =
    SMOOTHING_ALPHA * detectedFrequency +
    (1 - SMOOTHING_ALPHA) * smoothedFrequencyRef.current;

  // If new note is different, delay switching
  if (detectedNote !== stableNoteRef.current) {
    clearTimeout(noteChangeTimeoutRef.current);

    noteChangeTimeoutRef.current = setTimeout(() => {
      stableNoteRef.current = detectedNote;
      smoothedNoteRef.current = detectedNote;
      smoothedCentsRef.current = detectedCents;
    }, 300); // Require 300ms stable detection before switch
  } else {
    // If same note, update cents immediately
    smoothedCentsRef.current =
      SMOOTHING_ALPHA * detectedCents +
      (1 - SMOOTHING_ALPHA) * smoothedCentsRef.current;
  }
}, [detectedFrequency, detectedNote, detectedCents]);
    const value = useMemo(() => ({
  instrument,
  setInstrument,
  tuningName,
  setTuningName,
  tuningNotes,
  frequency: smoothedFrequencyRef.current,
  note: smoothedNoteRef.current,
  cents: smoothedCentsRef.current
}), [instrument, tuningName, tuningNotes, detectedFrequency, detectedNote, detectedCents]);
  
    return (
      <TunerContext.Provider value={value}>
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