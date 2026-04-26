import { NextResponse } from "next/server";
import { getNearbyTriggerLocations } from "@/lib/geo";
import { analyzeRisk } from "@/lib/claude";
import { sendSMS } from "@/lib/vonage";
import { AnalysisResult } from "@/lib/types";

export async function POST(req: Request) {
  const { heartRate, baseline, lat, lng } = await req.json();

  // Step 1: quick risk check, no API calls
  const percentAbove = ((heartRate - baseline) / baseline) * 100;
  if (percentAbove < 35) {
    return NextResponse.json({
      risk: "low",
      userMessage: "Your vitals look normal. Keep it up.",
      sponsorMessage: null,
    });
  }

  // Step 2:elevated, now check location
  const nearbyPlaces = await getNearbyTriggerLocations(lat, lng, 200);

  // Step 3: build context object for Claude
  const context = {
    heartRate,
    baseline,
    percentAboveBaseline: Math.round(percentAbove),
    nearbyPlaces: nearbyPlaces.map(p => ({
      name: p.name,
      distanceMeters: p.distanceMeters,
    })),
    nearAlcohol: nearbyPlaces.length > 0,
    timestamp: new Date().toISOString(),
  };

  //Step 4: claude reasons about everything and returns structured response
  const analysis = await analyzeRisk(context);

  // Step 5: if high risk, send SMS via Vonage
  if (analysis.risk === "high" || analysis.risk === "critical") {
    await sendSMS(
      process.env.SPONSOR_PHONE!,
      analysis.sponsorMessage
    );
  }

  // Step 6: send results back to frontend
  return NextResponse.json({
    risk: analysis.risk,
    userMessage: analysis.userMessage,
    sponsorMessage: analysis.sponsorMessage,
    context, 
  });
}