import { NextResponse } from "next/server";
import { getNearbyTriggerLocations } from "@/lib/geo";
import { analyzeRisk } from "@/lib/claude";
import { sendSMS } from "@/lib/vonage";
import { saveReading, getRecentReadings, getUser } from "@/lib/db";

export async function POST(req: Request) {
  const { heartRate, baseline, lat, lng } = await req.json();
  const userId = process.env.USER_ID!;

  // Step 1: save reading to database
  await saveReading(userId, heartRate, lat, lng);

  // Step 2: get last 4 readings and check for spike
  const readings = await getRecentReadings(userId);
  const oldest = readings[readings.length - 1]?.heart_rate ?? baseline;
  const newest = readings[0]?.heart_rate ?? heartRate;
  const spikeDetected = (newest - oldest) >= 20;

  // Step 3: quick risk check
  const percentAbove = ((heartRate - baseline) / baseline) * 100;
  if (percentAbove < 20 && !spikeDetected) {
    return NextResponse.json({
      risk: "low",
      userMessage: "Your vitals look normal. Keep it up.",
      sponsorMessage: null,
    });
  }

  // Step 4: elevated, check location
  const nearbyPlaces = await getNearbyTriggerLocations(lat, lng, 200);

  // Step 5: get real user + sponsor info from db
  const user = await getUser(userId);

  // Step 6: build context for Claude
  const context = {
    heartRate,
    baseline,
    percentAboveBaseline: Math.round(percentAbove),
    spikeDetected,
    userName: user?.name ?? "the user",
    sponsorName: user?.sponsor_name ?? "their sponsor",
    nearbyPlaces: nearbyPlaces.map(p => ({
      name: p.name,
      distanceMeters: p.distanceMeters,
    })),
    nearAlcohol: nearbyPlaces.length > 0,
    timestamp: new Date().toISOString(),
  };

  // Step 7: Claude reasons about everything
  const analysis = await analyzeRisk(context);
  console.log("Claude response:", analysis);

  // Step 8: if high risk, send SMS to real sponsor phone
  if (analysis.riskLevel === "high" || analysis.riskLevel === "critical") {
    if (user?.sponsor_phone) {
      await sendSMS(user.sponsor_phone, analysis.sponsorMessage);
    }
    if (user?.phone) {
      await sendSMS(user.phone, analysis.userMessage);
    }
  }

  // Step 9: return to frontend
  return NextResponse.json({
    risk: analysis.riskLevel,
    userMessage: analysis.userMessage,
    sponsorMessage: analysis.sponsorMessage,
    context,
  });
}