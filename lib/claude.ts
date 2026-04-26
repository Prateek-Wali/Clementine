import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult } from "@/lib/types";

const client = new Anthropic();

// Matches exactly what route.ts builds as `context`
interface RiskContext {
  heartRate: number;
  baseline: number;
  percentAboveBaseline: number;
  nearbyPlaces: {
    name: string;
    distanceMeters: number;
  }[];
  nearAlcohol: boolean;
  timestamp: string;
}



export async function analyzeRisk(context: RiskContext): Promise<AnalysisResult> {
  const prompt = `You are a relapse prevention system for someone in addiction recovery. You will receive real-time biometric and location data and must assess their risk level.

DATA:
- Heart rate: ${context.heartRate} bpm (baseline: ${context.baseline} bpm, ${context.percentAboveBaseline}% above baseline)
- Near alcohol-related locations: ${context.nearAlcohol}
${context.nearbyPlaces.length > 0
  ? `- Nearby trigger locations:\n${context.nearbyPlaces.map(p => `  • ${p.name} (${p.distanceMeters}m away)`).join("\n")}`
  : "- No trigger locations nearby"
}
- Time: ${context.timestamp}

Respond ONLY with a JSON object, no markdown, no explanation outside the JSON:
{
  "risk": "low" | "medium" | "high" | "critical",
  "userMessage": "A short calming message shown directly to the user on their screen",
  "sponsorMessage": "A warm, non-alarming text to send to their sponsor (empty string if risk is low or medium)"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(raw) as AnalysisResult;
}