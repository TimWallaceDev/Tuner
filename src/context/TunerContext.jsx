import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { INSTRUMENTS_DATA } from '../constants/tuningData';
import { useNoteDetector } from '../hooks/useNoteDetector';

const TunerContext = createContext();

export function TunerProvider({ children }) {
  const [instrument, setInstrument] = useState('guitar');
  const [tuningName, setTuningName] = useState(INSTRUMENTS_DATA['guitar'].defaultTuning);

  // Safe fallback if detector returns null
  const {
    frequency = 0,
    note = null,
    cents = 0
  } = useNoteDetector() || {};

  // Reset tuning to default when instrument changes
  useEffect(() => {
    setTuningName(INSTRUMENTS_DATA[instrument].defaultTuning);
  }, [instrument]);

  const currentInstrument = INSTRUMENTS_DATA[instrument];
  const currentTuning = currentInstrument?.tunings?.[tuningName];
  const tuningNotes = currentTuning?.notes || [];

  const value = useMemo(() => ({
    instrument,
    setInstrument,
    tuningName,
    setTuningName,
    tuningNotes,
    frequency,
    note,
    cents
  }), [instrument, tuningName, tuningNotes, frequency, note, cents]);

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