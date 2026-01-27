import { useMemo } from "react";

export function useArcSegments({
  notes = [],
  activeIndex = null, // user position relative to target
  centerIndex = null,
  radiusInner = 100,
  radiusOuter = 140,
  centerX = 160,
  centerY = 190,
  yellowRange = 2, // ±2 around center
}) {
  const ARC_SEGMENTS = notes.length || 1;
  const totalAngle = 180;
  const segmentAngle = totalAngle / ARC_SEGMENTS;

  // 1️⃣ Static geometry
  const segmentGeometry = useMemo(() => {
    const toRad = (deg) => (Math.PI / 180) * deg;

    return Array.from({ length: ARC_SEGMENTS }).map((_, idx) => {
      const angleStart = 180 - idx * segmentAngle;
      const angleEnd = 180 - (idx + 1) * segmentAngle;

      const angleStartRad = toRad(angleStart);
      const angleEndRad = toRad(angleEnd);

      const x1 = centerX + radiusInner * Math.cos(angleStartRad);
      const y1 = centerY - radiusInner * Math.sin(angleStartRad);
      const x2 = centerX + radiusOuter * Math.cos(angleStartRad);
      const y2 = centerY - radiusOuter * Math.sin(angleStartRad);
      const x3 = centerX + radiusOuter * Math.cos(angleEndRad);
      const y3 = centerY - radiusOuter * Math.sin(angleEndRad);
      const x4 = centerX + radiusInner * Math.cos(angleEndRad);
      const y4 = centerY - radiusInner * Math.sin(angleEndRad);

      return {
        key: idx,
        note: notes[idx],
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
      };
    });
  }, [ARC_SEGMENTS, notes, segmentAngle, radiusInner, radiusOuter, centerX, centerY]);

  // 2️⃣ Apply colors
  return useMemo(() => {
return segmentGeometry.map((seg, idx) => {
  const isCenter = idx >= centerIndex - yellowRange && idx <= centerIndex + yellowRange;

  // base defaults
  let fillColor = idx < centerIndex ? "#0095ff" : "#ff3b3b"; // blue left, red right
  let opacity = 0.7;
  let className = "tuner-arc-segment";

  // middle yellow band
  if (isCenter) {
    fillColor = "#ffd700";
  }

  // 🔹 Active segment: single override for user feedback
  if (idx === activeIndex) {
    fillColor = idx < centerIndex ? "#0095ff" : idx > centerIndex ? "#ff3b3b" : "#ffd700";
    opacity = 1;
    className += " highlighted"; // append the highlighted class
  }

  return {
    ...seg,
    fill: fillColor,
    opacity,
    className,
  };
});
  }, [segmentGeometry, centerIndex, yellowRange, activeIndex]);
}