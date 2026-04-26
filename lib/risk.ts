//Simple threshold logic for calling claude API and sending messages
// export function isElevated(heartRate: number, baseline: number): boolean {
//   return heartRate > baseline * 1.2; // 20% above baseline = stressed
// }


// lib/risk.ts

export interface BiometricData {
  heartRate: number;
  baseline: number;
}

export interface RiskResult {
  elevated: boolean;
  percentAboveBaseline: number;
}

export function assessRisk(data: BiometricData): RiskResult {
  const { heartRate, baseline } = data;
  const percentAbove = ((heartRate - baseline) / baseline) * 100;
  const elevated = percentAbove >= 35; // 35% above baseline = stressed

  return {
    elevated,
    percentAboveBaseline: Math.round(percentAbove),
  };
}