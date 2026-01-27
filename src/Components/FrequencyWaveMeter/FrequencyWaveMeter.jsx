// src/Components/FrequencyWaveMeter/FrequencyWaveMeter.jsx
import React, { useRef, useEffect } from "react";
import './FrequencyWaveMeter.scss';

const FrequencyWaveMeter = ({
  audioData = [], // array of floats (-1 to 1)
  width = 200,
  height = 60,
  lineColor = "#00ff00",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (audioData.length === 0) return;

    const step = width / audioData.length;

    audioData.forEach((val, idx) => {
      const x = idx * step;
      const y = height / 2 - val * (height / 2); // invert for correct y-axis
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [audioData, width, height, lineColor]);

  return <canvas className="frequency-wave-meter" ref={canvasRef} width={width} height={height} />;
};

export default FrequencyWaveMeter;