import React from "react";
import './VerticalFrequencyMeter.scss';

const VerticalFrequencyMeter = ({
  frequency,
  targetFrequency,
  height = 120,
  width = 10,
  inTuneToleranceCents = 5, // tolerance for green
  maxDeviationCents = 20,   // full-scale deviation
}) => {
  if (!targetFrequency || frequency === 0) return null;

  // Compute cents deviation
  const centsDeviation = 1200 * Math.log2(frequency / targetFrequency);

  // Clamp to maxDeviation
  const clamped = Math.max(-maxDeviationCents, Math.min(maxDeviationCents, centsDeviation));

  // Normalize to 0..1 for vertical position
  const normalized = 0.5 - clamped / (2 * maxDeviationCents);
  const yPos = normalized * height;

  // Determine color
  let indicatorColor = "#00ff00"; // default green in tune
  if (Math.abs(clamped) > inTuneToleranceCents) {
    indicatorColor = clamped < 0 ? "#0095ff" : "#ff3b3b"; // blue if flat, red if sharp
  }

  return (
    <div className="vertical-frequency-meter" style={{ height, width }}>
      <div className="meter-track" />
      <div
        className="meter-indicator"
        style={{
          top: `${yPos}px`,
          background: indicatorColor
        }}
      />
    </div>
  );
};

export default VerticalFrequencyMeter;