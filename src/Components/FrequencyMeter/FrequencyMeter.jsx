// FrequencyMeter.jsx
import React from "react";
import './FrequencyMeter.scss';

const FrequencyMeter = ({ frequency, targetFrequency, width = 200, height = 60, threshold = 5 }) => {
  if (!targetFrequency) return null;

  // Calculate deviation in cents
  const deviation = 1200 * Math.log2(frequency / targetFrequency);

  // Normalize deviation to -1..1 for display (clamp at +/- threshold)
  const clamped = Math.max(-threshold, Math.min(threshold, deviation));
  const percent = (clamped + threshold) / (2 * threshold); // 0 to 1
  const x = percent * width;

  return (
    <div className="frequency-meter" style={{ width, height }}>
      <div className="meter-bg" />
      <div
        className="meter-line"
        style={{ left: `${x}px` }}
      />
    </div>
  );
};

export default FrequencyMeter;