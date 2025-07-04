import { useMemo } from 'react';
import {
  ARC_RADIUS_OUTER,
  ARC_CENTER_X,
  ARC_CENTER_Y,
  POINTER_HEIGHT,
  POINTER_BASE_WIDTH,
  HZ_DEVIATION_FOR_FULL_SCALE,
} from '../constants/tuner';

export function usePointerShape(frequency, hzDifference) {
  return useMemo(() => {
    // Normalize Hz difference to angle: e.g. ±50 Hz → ±90 degrees
    const maxAngle = 90;
    const clampedHz = Math.max(-HZ_DEVIATION_FOR_FULL_SCALE, Math.min(HZ_DEVIATION_FOR_FULL_SCALE, hzDifference));
    const angle = (clampedHz / HZ_DEVIATION_FOR_FULL_SCALE) * maxAngle;

    const rad = (Math.PI / 180) * (180 - angle); // Flip since SVG Y-axis is inverted

    const topX = ARC_CENTER_X + ARC_RADIUS_OUTER * Math.cos(rad);
    const topY = ARC_CENTER_Y - ARC_RADIUS_OUTER * Math.sin(rad);

    const pointerTipY = topY - 16;
    const pointerBaseY = pointerTipY - POINTER_HEIGHT;

    return {
      points: `${topX - POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX + POINTER_BASE_WIDTH / 2},${pointerBaseY} ${topX},${pointerTipY}`,
      opacity: frequency > 0 ? 1 : 0.3,
    };
  }, [frequency, hzDifference]);
}