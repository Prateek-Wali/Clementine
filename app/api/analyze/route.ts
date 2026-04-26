import { NextResponse } from "next/server";
import { getNearbyTriggerLocations } from "@/lib/geo";
import { analyzeRisk } from "@/lib/claude";
import { sendSMS } from "@/lib/vonage";


export async function POST(req: Request) {
  const { heartRate, baseline, lat, lng } = await req.json();

  // Step 1: quick risk check, no API calls
  const percentAbove = ((heartRate - baseline) / baseline) * 100;
  if (percentAbove < 20) {
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

  // Step 5: if high risk, send WhatsApp via Vonage sandbox
  if (analysis.riskLevel === "high" || analysis.riskLevel === "critical") {
    try {
      const smsResponse = await sendSMS(
        process.env.SPONSOR_PHONE_NUMBER!, // set in .env
        analysis.sponsorMessage
      );
      console.log("Vonage WhatsApp sent:", smsResponse);
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
    }
  }

  // Step 6: send results back to frontend
  return NextResponse.json({
    risk: analysis.riskLevel,
    userMessage: analysis.userMessage,
    sponsorMessage: analysis.sponsorMessage,
    context,
  });
}