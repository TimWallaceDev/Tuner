import { useMemo } from "react";

export function useArcSegments({
  notes = [],
  activeIndex = null,
  centerIndex = null,
  isInTune = false,
  hzDifference = 0,
  radiusInner = 100,
  radiusOuter = 140,
  centerX = 160,
  centerY = 190,
  yellowRange = 2,
}) {
  const ARC_SEGMENTS = notes.length || 1;
  const totalAngle = 180;
  const segmentAngle = totalAngle / ARC_SEGMENTS;

  const segments = useMemo(() => {
    return Array.from({ length: ARC_SEGMENTS }).map((_, idx) => {
      const angleStart = 180 - idx * segmentAngle;
      const angleEnd = 180 - (idx + 1) * segmentAngle;

      const toRad = (deg) => (Math.PI / 180) * deg;

      const x1 = centerX + radiusInner * Math.cos(toRad(angleStart));
      const y1 = centerY - radiusInner * Math.sin(toRad(angleStart));
      const x2 = centerX + radiusOuter * Math.cos(toRad(angleStart));
      const y2 = centerY - radiusOuter * Math.sin(toRad(angleStart));
      const x3 = centerX + radiusOuter * Math.cos(toRad(angleEnd));
      const y3 = centerY - radiusOuter * Math.sin(toRad(angleEnd));
      const x4 = centerX + radiusInner * Math.cos(toRad(angleEnd));
      const y4 = centerY - radiusInner * Math.sin(toRad(angleEnd));

      const isCenter = idx === centerIndex;
      const isActive = idx === activeIndex;
      const isYellow = idx >= centerIndex - yellowRange && idx <= centerIndex + yellowRange;

      let fillColor = "#666";
      let opacity = 0.4;
      let shouldGlow = false;

      if (isInTune && isCenter) {
        fillColor = "#00ff00"; // Green
        opacity = 1;
        shouldGlow = true;
      } else if (isActive) {
        fillColor = hzDifference < 0 ? "#0095ff" : "#ff3b3b"; // Blue or red
        opacity = 1;
      } else if (isYellow) {
        fillColor = "#ffd700";
        opacity = 0.7;
      } else {
        fillColor = idx < centerIndex ? "#0095ff" : "#ff3b3b";
        opacity = 0.5;
      }

      return {
        key: idx,
        note: notes[idx],
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
        fill: fillColor,
        opacity,
        className: (shouldGlow ? "glow-highlight " : "") +
                   (isActive ? "highlighted " : "") +
                   "tuner-arc-segment",
      };
    });
  }, [
    notes,
    ARC_SEGMENTS,
    centerIndex,
    activeIndex,
    isInTune,
    hzDifference,
    yellowRange,
    centerX,
    centerY,
    radiusInner,
    radiusOuter,
  ]);

  return segments;
}