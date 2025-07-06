// src/hooks/useNoteDetector.js
import { useEffect, useState, useMemo, useRef } from "react";
import { NOTE_FREQUENCIES } from "../constants/tuningData";

// Helper: find closest note + cents offset
const getClosestNote = (frequency) => {
  let closest = null, minDiff = Infinity;
  for (const [note, targetFreq] of Object.entries(NOTE_FREQUENCIES)) {
    const d = Math.abs(frequency - targetFreq);
    if (d < minDiff) {
      minDiff = d;
      closest = note;
    }
  }
  if (!closest) return null;
  const centsOff = 1200 * Math.log2(frequency / NOTE_FREQUENCIES[closest]);
  return { note: closest, frequency: NOTE_FREQUENCIES[closest], cents: centsOff };
};

// Auto-correlation with parabolic peak refinement
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.02) return -1;  // too quiet

  let r1 = 0, r2 = SIZE - 1, threshold = 0.2;
  for (let i = 0; i < SIZE/2; i++) if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  for (let i = 1; i < SIZE/2; i++) if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break; }

  const trimmed = buf.slice(r1, r2);
  const N = trimmed.length;
  const c = new Array(N).fill(0);
  for (let lag = 0; lag < N; lag++) {
    for (let i = 0; i < N - lag; i++) {
      c[lag] += trimmed[i] * trimmed[i + lag];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1] && d < N - 2) d++;
  let maxVal = -Infinity, maxPos = -1;
  for (let i = d; i < N; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }

  if (maxPos <= 0 || maxPos >= N - 1) return sampleRate / maxPos;
  // parabolic interpolation
  const left   = c[maxPos - 1];
  const center = c[maxPos];
  const right  = c[maxPos + 1];
  const adj    = 0.5 * (right - left) / (2 * center - right - left);
  const T0     = maxPos + adj;
  const pitch  = sampleRate / T0;
  return (pitch < 50 || pitch > 2000) ? -1 : pitch;
}

export function useNoteDetector() {
  const [frequency, setFrequency] = useState(0);
  const bufferRef    = useRef([]);                      // for median smoothing
  const lastFreqRef  = useRef(0);                       // to gate small changes
  const dataBuf      = useRef(new Float32Array(2048));  // audio buffer
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const rafRef       = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ac = new AudioContext();
        const analyser = ac.createAnalyser();
        analyser.fftSize = dataBuf.current.length;
        const src = ac.createMediaStreamSource(stream);
        src.connect(analyser);

        audioCtxRef.current = ac;
        analyserRef.current = analyser;
        tick();
      } catch (err) {
        console.error("Mic init failed", err);
      }
    }

    function median(arr) {
      const sorted = [...arr].sort((a, b) => a - b);
      const m = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
    }

    function tick() {
      if (cancelled) return;
      const analyser = analyserRef.current;
      if (analyser) {
        analyser.getFloatTimeDomainData(dataBuf.current);
        const raw = autoCorrelate(dataBuf.current, analyser.context.sampleRate);

        if (raw > 0) {
          // push into our small history, keep last 5
          const buf = bufferRef.current;
          buf.push(raw);
          if (buf.length > 5) buf.shift();
          const smooth = median(buf);

          // only update if it’s moved enough
          if (Math.abs(smooth - lastFreqRef.current) > 0.5) {
            lastFreqRef.current = smooth;
            setFrequency(smooth);
          }
        } else {
          // no pitch: clear buffer and drop to zero
          bufferRef.current = [];
          if (lastFreqRef.current !== 0) {
            lastFreqRef.current = 0;
            setFrequency(0);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    init();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []); // run once

  const detected = useMemo(() => {
    if (!frequency) return null;
    return getClosestNote(frequency);
  }, [frequency]);

  return {
    frequency,
    note: detected?.note || null,
    cents: detected?.cents || 0,
  };
}

