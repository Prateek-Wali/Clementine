"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState("")
  const [smessage, setSMessage] = useState("")
  const [risk, setRisk] = useState("")
  const [position, setPosition] = useState({ lat: 0, lng: 0 })

  async function runTest() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heartRate: 110, baseline: 70, lat, lng }),
      });

      const result = await res.json()
      setMessage(result.userMessage);
      setSMessage(result.sponsorMessage);
      setRisk(result.risk ?? result.riskLevel);
    });
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return (
    <div>
      <button onClick={runTest}>Simulate Event</button>
      {risk && <p>Risk: {risk}</p>}
      {message && <p>{message}</p>}
      {smessage && <p>{smessage}</p>}
      {position.lat !== 0 && <p>Location: {position.lat}, {position.lng}</p>}
    </div>
  );
}