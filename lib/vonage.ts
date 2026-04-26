export async function sendSMS(to: string, message: string) {
  const API_KEY = process.env.VONAGE_API_KEY;
  const API_SECRET = process.env.VONAGE_API_SECRET;

  // Vonage WhatsApp Sandbox — bypasses US carrier A2P restrictions
  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const response = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify({
      message_type: 'text',
      text: message,
      to: to.replace(/\D/g, ''),         // strip non-digits
      from: '14157386102',               // Vonage sandbox WhatsApp number
      channel: 'whatsapp',
    }),
  });

  const data = await response.json();
  console.log("Vonage response:", JSON.stringify(data));
  return data;
}