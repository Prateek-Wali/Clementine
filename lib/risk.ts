//Simple threshold logic for calling claude API and sending messages
export function isElevated(heartRate: number, baseline: number): boolean {
  return heartRate > baseline * 1.2; // 20% above baseline = stressed
}