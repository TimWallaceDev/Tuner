import { useState, useEffect, useRef, useMemo } from "react";
import { NOTE_FREQUENCIES } from "../constants/tuningData";

function getClosestNote(frequency) {
  if (!frequency) return null;
  let closestNote = null;
  let minDiff = Infinity;
  for (const [note, targetFreq] of Object.entries(NOTE_FREQUENCIES)) {
    const diff = Math.abs(frequency - targetFreq);
    if (diff < minDiff) {
      minDiff = diff;
      closestNote = note;
    }
  }
  if (!closestNote) return null;
  const centsOff = 1200 * Math.log2(frequency / NOTE_FREQUENCIES[closestNote]);
  return { note: closestNote, frequency: NOTE_FREQUENCIES[closestNote], cents: centsOff };
}

export function useNoteDetector() {
  const [frequency, setFrequency] = useState(0);
  const [waveform, setWaveform] = useState(new Float32Array(2048));
  const rafIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const BUFFER_LENGTH = 2048;

  useEffect(() => {
    let micSource = null;
    const data = new Float32Array(BUFFER_LENGTH);

    const update = () => {
      if (!analyserRef.current) return;

      // Copy the current waveform into state for visualization
      analyserRef.current.getFloatTimeDomainData(data);
      setWaveform(new Float32Array(data)); // create a fresh copy

      // Detect frequency
      const freq = autoCorrelate(data, audioContextRef.current.sampleRate);
      if (freq !== -1 && freq < 2000) setFrequency(freq);

      rafIdRef.current = requestAnimationFrame(update);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = BUFFER_LENGTH;

        micSource = audioContextRef.current.createMediaStreamSource(stream);
        micSource.connect(analyserRef.current);

        update(); // start the loop
      } catch (err) {
        console.error("Mic access failed", err);
      }
    };

    start();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  const detected = useMemo(() => getClosestNote(frequency), [frequency]);

  return { frequency, note: detected?.note || null, cents: detected?.cents || 0, waveform };
}

// Autocorrelation function
function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break; }
  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE - i; j++)
      c[i] += buf[j] * buf[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++)
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }

  return sampleRate / maxpos;
}