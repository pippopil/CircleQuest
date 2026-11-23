/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safe wrapper around the Web Vibration API (`navigator.vibrate`)
 * for tactile feedback on mobile browsers and Android WebView.
 */
function triggerVibration(pattern: number | number[]): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return false;
  }
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

/** Tactile celebration pulse when completing a quest */
export function vibrateQuestComplete(): boolean {
  return triggerVibration([35, 45, 75]);
}

/** Warm double-tap pulse when sending a Spark of support */
export function vibrateSparkSent(): boolean {
  return triggerVibration([25, 35, 35]);
}

/** Gentle rhythmic pulse when receiving or playing a friend's Spark */
export function vibrateSparkReceived(): boolean {
  return triggerVibration([30, 50, 45, 50, 65]);
}

/** Grounding pulse when the Detox timer finishes */
export function vibrateDetoxComplete(): boolean {
  return triggerVibration([60, 70, 110]);
}

/** Subtle micro-tap feedback for interactive UI choices */
export function vibrateTap(): boolean {
  return triggerVibration(15);
}
