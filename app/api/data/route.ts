import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    heartRate: 110,      // elevated
    baseline: 70,        // their normal
    lat: 40.65655517578125,        // Times Square NYC — has bars everywhere
    lng: -74.20797729492188,
  });
}