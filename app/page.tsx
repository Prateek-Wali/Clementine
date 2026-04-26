"use client";
import { M_PLUS_1 } from "next/font/google";
import {useEffect, useState} from 'react';


export default function Home() {
  const [message, setMessage] = useState("")
  const [position, setPosition] = useState({lat: 0, lng: 0})
  async function runTest(){
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers : { "Content-Type": "application/json"},
        body: JSON.stringify({
          heartRate: 110,
          baseline: 70,
          lat,
          lng,
          }),
      });
      const result = await res.json()
      setMessage(result.userMessage);
    });
    
  }

  useEffect(() =>{
    navigator.geolocation.getCurrentPosition(async (pos)=>{
  
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
    return 
  },[]);

  
  return (
   <div>
    <button onClick ={runTest}> Simulate Event</button>
    {message && <p>{message}</p>}

    
    {position.lat && <p>Location: {position.lat}, {position.lng}</p>}
    
    
   </div>
  );
}


