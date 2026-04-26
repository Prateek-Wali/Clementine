const API_KEY = process.env.VONAGE_API_KEY; // GET THIS FROM VONAGE DASHBOARD
const API_SECRET = process.env.VONAGE_API_SECRET; // GET THIS FROM VONAGE DASHBOARD

export async function sendSMS(to: string, message: string) {

  const response = await fetch('https://rest.nexmo.com/sms/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: API_KEY,
      api_secret: API_SECRET,
      to: to.replace('+', ''),
      from: '18165972207', //sender number from vonage
      text: message
    })
  });

  const data = await response.json();
  return data;
}