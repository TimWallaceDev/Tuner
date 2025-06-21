import React, { useState, useEffect, useRef } from 'react';
import './HomePage.scss';
import TunerDisplay from '../../Components/TunerDisplay';
// import { ARC_SEGMENTS, MAX_POINTER_CENTS } from '../../constants/tuner'; // Only if used directly in HomePage JSX
import { NOTE_FREQUENCIES, INSTRUMENTS_DATA } from '../../data/tuningData';


const HomePage = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cents, setCents] = useState(0);

  const [selectedInstrumentKey, setSelectedInstrumentKey] = useState(Object.keys(INSTRUMENTS_DATA)[0]);
  const [selectedTuningKey, setSelectedTuningKey] = useState(INSTRUMENTS_DATA[selectedInstrumentKey].defaultTuning);
  const [currentTargetNoteIndex, setCurrentTargetNoteIndex] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  const currentInstrument = INSTRUMENTS_DATA[selectedInstrumentKey];

  // Determine the effective tuning key for the current render.
  // If selectedTuningKey (from state, possibly stale from a previous instrument)
  // isn't a valid tuning for the currentInstrument, use the currentInstrument's defaultTuning.
  // The useEffect hook for selectedInstrumentKey will correctly update the selectedTuningKey state for subsequent renders.
  let effectiveTuningKey = selectedTuningKey;
  if (!currentInstrument.tunings[effectiveTuningKey]) {
    effectiveTuningKey = currentInstrument.defaultTuning;
  }
  const currentTuning = currentInstrument.tunings[effectiveTuningKey];

  // Safely access notes and target note name, defaulting if currentTuning or notes are unexpectedly undefined.
  const notesInCurrentTuning = currentTuning && currentTuning.notes ? currentTuning.notes : [];
  const currentTargetNoteName = notesInCurrentTuning[currentTargetNoteIndex]; // currentTargetNoteIndex is reset to 0 by useEffects
  const currentTargetNoteFrequency = currentTargetNoteName ? (NOTE_FREQUENCIES[currentTargetNoteName] || 0) : 0;

  const findClosestNote = (frequency) => {
    if (frequency <= 0) return '';
    let closestNote = '';
    let minDifference = Infinity;

    // Consider a sensible range or all notes
    // For simplicity, iterating all defined notes.
    // You might want to refine this based on instrument context later.
    for (const [note, noteFreq] of Object.entries(NOTE_FREQUENCIES)) {
      const difference = Math.abs(frequency - noteFreq);
      if (difference < minDifference) {
        minDifference = difference;
        closestNote = note;
      }
    }
    return closestNote;
  };

  const calculateCents = (currentFreq, targetFreq) => {
    if (currentFreq <= 0 || targetFreq <= 0) return 0;
    return Math.round(1200 * Math.log2(currentFreq / targetFreq));
  };

  // Update tuning and target note when instrument changes
  useEffect(() => {
    const instrument = INSTRUMENTS_DATA[selectedInstrumentKey];
    setSelectedTuningKey(instrument.defaultTuning);
    setCurrentTargetNoteIndex(0); // Reset to the first note of the new default tuning
  }, [selectedInstrumentKey]);

  // Update target note index when tuning changes
  useEffect(() => {
    setCurrentTargetNoteIndex(0); // Reset to the first note of the new tuning
  }, [selectedTuningKey]);

  const requestMicrophonePermission = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      console.log('Microphone access granted');
      setHasPermission(true);
      
      // Set up audio context and analyzer
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // Standard size, good balance
      analyserRef.current.smoothingTimeConstant = 0.5; // Reduced for better responsiveness
      
      // Connect microphone to analyzer
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      console.log('Audio context and analyzer set up');
      
      // Start frequency analysis
      startFrequencyAnalysis();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
    }
  };

  // Autocorrelation pitch detection
  function autoCorrelate(buffer, sampleRate) {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      let val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // too quiet

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    return sampleRate / T0;
  }

  const startFrequencyAnalysis = () => {
    const analyzeFrequency = () => {
      if (!analyserRef.current) return;
      
      // Use autocorrelation for pitch detection
      const bufferLength = analyserRef.current.fftSize;
      const timeDomainData = new Float32Array(bufferLength);
      analyserRef.current.getFloatTimeDomainData(timeDomainData);
      const frequency = autoCorrelate(timeDomainData, audioContextRef.current.sampleRate);
      
      // Only update if we have a significant signal
      if (frequency > 0) {
        setCurrentFrequency(frequency);
        const closestNote = findClosestNote(frequency);
        setCurrentNote(closestNote);
        setCents(calculateCents(frequency, currentTargetNoteFrequency));
        setIsAnalyzing(true);
        // Debug: Log raw detected frequency and closest note
        console.log('[HomePage Debug]', {
          detectedFrequency: frequency,
          closestNote,
          currentNote: closestNote,
          targetNote: currentTargetNoteName
        });
      } else {
        // No valid frequency detected (too quiet or unclear)
        // Reset cents and current note to avoid displaying stale data
        setCurrentFrequency(0);
        setCurrentNote('');
        setCents(0);
        setIsAnalyzing(false);
      }
      
      animationFrameRef.current = requestAnimationFrame(analyzeFrequency);
    };
    
    analyzeFrequency();
  };

  // Cleanup function to stop the analysis when component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);


  return (
    <div className="home-page">
      <h1>Instrument Tuner</h1>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div>
          <label htmlFor="instrument-select" style={{ fontWeight: 600, marginRight: 8 }}>Instrument:</label>
          <select
            id="instrument-select"
            value={selectedInstrumentKey}
            onChange={e => setSelectedInstrumentKey(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '0.3rem 1rem', borderRadius: 6 }}
          >
            {Object.entries(INSTRUMENTS_DATA).map(([key, instrument]) => (
              <option key={key} value={key}>{instrument.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tuning-select" style={{ fontWeight: 600, marginRight: 8 }}>Tuning:</label>
          <select
            id="tuning-select"
            value={selectedTuningKey}
            onChange={e => setSelectedTuningKey(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '0.3rem 1rem', borderRadius: 6 }}
          >
            {Object.entries(currentInstrument.tunings).map(([key, tuning]) => (
              <option key={key} value={key}>{tuning.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Display all notes of the current tuning, split into two sides */}
      {notesInCurrentTuning.length > 0 && (
        <div className="tuning-notes-display" style={{ display: 'flex', justifyContent: 'space-around', margin: '1rem 0', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          {[0, 1].map(side => {
            const sideNotes = notesInCurrentTuning.filter((_, index) => 
              side === 0 ? index < Math.ceil(notesInCurrentTuning.length / 2) : index >= Math.ceil(notesInCurrentTuning.length / 2)
            );
            const originalIndicesStart = side === 0 ? 0 : Math.ceil(notesInCurrentTuning.length / 2);

            return (
              <div key={side} className={`tuning-notes-side-${side === 0 ? 'left' : 'right'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {sideNotes.map((noteName, idx) => {
                  const originalIndex = originalIndicesStart + idx;
                  const isActive = originalIndex === currentTargetNoteIndex;
                  return (
                    <button
                      key={noteName + originalIndex}
                      onClick={() => setCurrentTargetNoteIndex(originalIndex)}
                      style={{
                        padding: '8px 12px', margin: '4px', fontSize: '1rem', cursor: 'pointer',
                        border: isActive ? '2px solid #007bff' : '1px solid #ddd',
                        backgroundColor: isActive ? '#e7f3ff' : 'white',
                        fontWeight: isActive ? 'bold' : 'normal',
                        borderRadius: '4px'
                      }}
                    >
                      {noteName} ({NOTE_FREQUENCIES[noteName]?.toFixed(1)} Hz)
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div className="tuner-container">
        {!hasPermission ? (
          <button 
            onClick={requestMicrophonePermission}
            className="mic-button"
          >
            Allow Microphone Access
          </button>
        ) : (
          <TunerDisplay
            note={currentNote}
            cents={cents}
            frequency={currentFrequency}
            targetNoteName={currentTargetNoteName}
            targetNoteFrequency={currentTargetNoteFrequency}
            isAnalyzing={isAnalyzing}
            instrumentName={currentInstrument.name}
          />
        )}
        <div className="status-message">
          {isAnalyzing ? '🎵 Detecting audio...' : 'Play a note on your instrument to see the detected pitch'}
        </div>
        <div className="debug-info">
          <p>Microphone Access: {hasPermission ? '✅ Granted' : '❌ Not granted'}</p>
          <p>Audio Context: {audioContextRef.current ? '✅ Active' : '❌ Not active'}</p>
          <p>Analyzer: {analyserRef.current ? '✅ Active' : '❌ Not active'}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
