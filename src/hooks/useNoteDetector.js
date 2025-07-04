import { useEffect, useState, useMemo } from "react";
import { NOTE_FREQUENCIES, INSTRUMENTS_DATA } from "../constants/tuningData";

const getClosestNote = (frequency) => {
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

  return {
    note: closestNote,
    frequency: NOTE_FREQUENCIES[closestNote],
    cents: centsOff,
    diff: minDiff,
  };
};



function autoCorrelate(buf, sampleRate) {
  // A simple autocorrelation algorithm
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // Too quiet

  let r1 = 0,
    r2 = SIZE - 1,
    threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1,
    maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  return sampleRate / T0;
}

export function useNoteDetector() {
  const [frequency, setFrequency] = useState(0);

  useEffect(() => {
    let audioContext = null;
    let analyser = null;
    let micSource = null;
    let rafId = null;

    const bufferLength = 2048;
    const data = new Float32Array(bufferLength);

    const update = () => {
      if (!analyser) return;

      analyser.getFloatTimeDomainData(data);
      const freq = autoCorrelate(data, audioContext.sampleRate);
      if (freq !== -1 && freq < 2000) {
        setFrequency(freq);
      }

      rafId = requestAnimationFrame(update);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = bufferLength;
        micSource = audioContext.createMediaStreamSource(stream);
        micSource.connect(analyser);
        update(); // Start loop
      } catch (err) {
        console.error("Mic access failed", err);
      }
    };

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioContext) audioContext.close();
    };
  }, []);

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
