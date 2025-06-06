import React, { useState, useEffect, useRef } from 'react';

// Standard guitar tuning frequencies (E2 to E6)
const GUITAR_NOTES = {
  'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00,
  'A#2': 116.54, 'B2': 123.47, 'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51,
  'E6': 1318.51
};

const HomePage = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cents, setCents] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  const findClosestNote = (frequency) => {
    let closestNote = null;
    let minDifference = Infinity;
    
    for (const [note, noteFreq] of Object.entries(GUITAR_NOTES)) {
      const difference = Math.abs(frequency - noteFreq);
      if (difference < minDifference) {
        minDifference = difference;
        closestNote = note;
      }
    }
    
    return closestNote;
  };

  const calculateCents = (frequency, targetNote) => {
    const targetFrequency = GUITAR_NOTES[targetNote];
    return Math.round(1200 * Math.log2(frequency / targetFrequency));
  };

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

  const startFrequencyAnalysis = () => {
    const analyzeFrequency = () => {
      if (!analyserRef.current) {
        console.log('No analyzer available');
        return;
      }
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyserRef.current.getFloatFrequencyData(dataArray);
      
      // Find the frequency with the highest amplitude
      let maxValue = -Infinity;
      let dominantIndex = 0;
      
      // Only look at frequencies between 80Hz and 1320Hz (guitar range)
      const minFreqIndex = Math.floor(80 * bufferLength / audioContextRef.current.sampleRate);
      const maxFreqIndex = Math.floor(1320 * bufferLength / audioContextRef.current.sampleRate);
      
      for (let i = minFreqIndex; i < maxFreqIndex; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          dominantIndex = i;
        }
      }
      
      // Convert index to frequency
      const frequency = dominantIndex * audioContextRef.current.sampleRate / analyserRef.current.fftSize;
      
      // Only update if we have a significant signal
      if (maxValue > -50) { // -50 dB is a reasonable threshold
        console.log('Detected frequency:', frequency, 'Hz, Amplitude:', maxValue, 'dB');
        setCurrentFrequency(frequency);
        
        const closestNote = findClosestNote(frequency);
        setCurrentNote(closestNote);
        setCents(calculateCents(frequency, closestNote));
        setIsAnalyzing(true);
      } else {
        console.log('No significant signal detected');
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

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Guitar Tuner</h1>
      
      {!hasPermission ? (
        <button 
          onClick={requestMicrophonePermission}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Allow Microphone Access
        </button>
      ) : (
        <div>
          <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{currentNote || 'No note detected'}</h2>
          <p>Frequency: {currentFrequency > 0 ? currentFrequency.toFixed(2) : '0.00'} Hz</p>
          {isAnalyzing && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ 
                fontSize: '1.2rem', 
                color: getTuningColor(),
                fontWeight: 'bold'
              }}>
                {getTuningStatus()} ({cents} cents)
              </p>
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
            {isAnalyzing ? '🎵 Detecting audio...' : 'Play a note on your guitar to see the detected pitch'}
          </p>
          <div style={{ 
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            <p>Debug Info:</p>
            <p>Microphone Access: {hasPermission ? '✅ Granted' : '❌ Not granted'}</p>
            <p>Audio Context: {audioContextRef.current ? '✅ Active' : '❌ Not active'}</p>
            <p>Analyzer: {analyserRef.current ? '✅ Active' : '❌ Not active'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
