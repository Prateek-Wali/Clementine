//Combines all data and 

import { NextResponse } from "next/server";
import { isElevated } from "@/lib/risk";
import { getNearbyTriggerLocations } from "@/lib/geo";

export async function POST(req: Request) {

  const { heartRate, baseline, lat, lng } = await req.json();

  const elevated = isElevated(heartRate, baseline);

  if (!elevated) {
    return NextResponse.json({ risk: "low", userMessage: "You're doing great." });
  }

  // Only call Google Places if stressed
  const triggers = await getNearbyTriggerLocations(lat, lng);
  const nearBar = triggers.length > 0;

  if (!nearBar) {
    return NextResponse.json({ risk: "low", userMessage: "Stress detected but you're in a safe area." });
  }

  return NextResponse.json({
    risk: "high",
    userMessage: `You're ${triggers[0].distanceMeters} meters away from ${triggers[0].name}. Your stress is elevated. Consider calling your sponsor.`,
    nearestBar: triggers[0].name,
  });
}