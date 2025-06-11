import React, { useState, useEffect, useRef } from 'react';
import './HomePage.scss';
import TunerDisplay from '../../Components/TunerDisplay';
import { ARC_SEGMENTS, ARC_SPAN, YELLOW_RANGE, TUNING_THRESHOLD, MAX_POINTER_CENTS } from '../../constants/tuner';



// Standard tuning frequencies for different instruments
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

const HomePage = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cents, setCents] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState('guitar');
  const [selectedTargetNote, setSelectedTargetNote] = useState('E2');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  const findClosestNote = (frequency) => {
    // If frequency is too low or high, return the closest boundary note
    const notes = INSTRUMENT_NOTES[selectedInstrument].notes;
    const noteValues = Object.entries(notes);
    const lowestNote = noteValues[0][0];
    const highestNote = noteValues[noteValues.length - 1][0];
    
    if (frequency < notes[lowestNote]) return lowestNote;
    if (frequency > notes[highestNote]) return highestNote;

    let closestNote = lowestNote;
    let minDifference = Math.abs(frequency - notes[lowestNote]);
    
    for (const [note, noteFreq] of Object.entries(notes)) {
      const difference = Math.abs(frequency - noteFreq);
      if (difference < minDifference) {
        minDifference = difference;
        closestNote = note;
      }
    }
    
    return closestNote;
  };

  const calculateCents = (frequency, targetNote) => {
    const targetFrequency = INSTRUMENT_NOTES[selectedInstrument].notes[targetNote];
    if (frequency <= 0 || targetFrequency <= 0) return 0;
    return Math.round(1200 * Math.log2(frequency / targetFrequency));
  };

  // Update target note when instrument changes
  useEffect(() => {
    const notes = INSTRUMENT_NOTES[selectedInstrument].notes;
    const firstNote = Object.keys(notes)[0];
    setSelectedTargetNote(firstNote);
  }, [selectedInstrument]);

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
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
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
        setCents(calculateCents(frequency, selectedTargetNote));
        setIsAnalyzing(true);
        // Debug: Log raw detected frequency and closest note
        console.log('[HomePage Debug]', {
          detectedFrequency: frequency,
          closestNote,
          currentNote: closestNote,
          targetNote: selectedTargetNote
        });
      } else {
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

  const getTuningStatus = () => {
    if (Math.abs(cents) < 5) return 'In Tune';
    if (cents > 0) return 'Too High';
    return 'Too Low';
  };

  const getTuningColor = () => {
    if (Math.abs(cents) < 5) return '#4CAF50';
    if (Math.abs(cents) < 20) return '#FFA500';
    return '#FF0000';
  };

  const normalizedCents = Math.max(-MAX_POINTER_CENTS, Math.min(MAX_POINTER_CENTS, cents));
  const segmentIndex = Math.round((normalizedCents + MAX_POINTER_CENTS) * (ARC_SEGMENTS - 1) / (2 * MAX_POINTER_CENTS));
  const pointerIdx = Math.max(0, Math.min(ARC_SEGMENTS - 1, segmentIndex));

  const showPointer = Math.abs(cents) <= MAX_POINTER_CENTS;

  return (
    <div className="home-page">
      <h1>Instrument Tuner</h1>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div>
          <label htmlFor="instrument-select" style={{ fontWeight: 600, marginRight: 8 }}>Instrument:</label>
          <select
            id="instrument-select"
            value={selectedInstrument}
            onChange={e => setSelectedInstrument(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '0.3rem 1rem', borderRadius: 6 }}
          >
            {Object.entries(INSTRUMENT_NOTES).map(([key, instrument]) => (
              <option key={key} value={key}>{instrument.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="target-note-select" style={{ fontWeight: 600, marginRight: 8 }}>Target Note:</label>
          <select
            id="target-note-select"
            value={selectedTargetNote}
            onChange={e => setSelectedTargetNote(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '0.3rem 1rem', borderRadius: 6 }}
          >
            {Object.keys(INSTRUMENT_NOTES[selectedInstrument].notes).map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>
      </div>
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
            isAnalyzing={isAnalyzing}
            targetNote={selectedTargetNote}
            instrument={INSTRUMENT_NOTES[selectedInstrument].name}
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
