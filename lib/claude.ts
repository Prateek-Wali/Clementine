import Anthropic from '@anthropic-ai/sdk';

// 1. Initialize the client using the API key from your .env file
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 2. Export the main function with the updated parameters
export async function analyzeRisk(context: any) {
  // 3. Create the Prompt
  // We feed Claude the user's current physical state, baseline, and environment

  // Safely extract the nearest location from the context
  const nearestTrigger = context.nearAlcohol && context.nearbyPlaces.length > 0
    ? context.nearbyPlaces[0]
    : { name: "Unknown", distanceMeters: 0 };

  const prompt = `You are the AI brain for Clementine, a relapse prevention app.
The user is a recovering addict.
Time: ${context.timestamp}

ALERT TRIGGERED:
The user's biometric system and location tracking just flagged a high-risk event.
Current biometrics: Heart rate spiked to ${context.heartRate} bpm (normal baseline is ${context.baseline} bpm).
Current location: The user is currently ${nearestTrigger.distanceMeters} meters away from a known trigger location: "${nearestTrigger.name}".

TASK:
1. Assess the relapse risk level (must be "high" or "critical" since the alert was already triggered).
2. Generate a short, non-alarming text message to the user's sponsor. It should urge the sponsor to check in. If the risk is critical, urge the sponsor to call immediately.
3. Generate a short grounding message to show the user on their screen. If the risk is critical, instruct the user to leave the area and call their sponsor immediately.

Return ONLY valid JSON in this exact format, with no markdown formatting or extra text:
{
  "riskLevel": "high",
  "sponsorMessage": "Hey [Sponsor Name]...",
  "userMessage": "Take a deep breath..."
}`;

  try {
    // 4. Call the Claude API
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.7,
      system: "You output strict JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    // 5. Parse and Return the JSON
    const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    return JSON.parse(responseText);

  } catch (error) {
    // 6. Error Handling
    // Return a safe fallback JSON object that matches the expected schema
    console.error("Error calling Claude:", error);
    return {
      riskLevel: "high",
      sponsorMessage: "Hey Mike, John's biometric system flagged an event near a trigger location. Might be worth checking in with him.",
      userMessage: "Take a deep breath and step away from your current location. Reach out to your sponsor if you need immediate support."
    };
  }
}
