import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveReading(userId: string, heartRate: number, lat: number, lng: number) {
  console.log("saving reading for userId:", userId); // ← add this
  const { data, error } = await supabase.from('heart_rate_readings').insert({
    user_id: userId,
    heart_rate: heartRate,
    lat,
    lng,
  });
  console.log("save result:", data, error); // ← add this
  if (error) console.error("saveReading error:", error);
}

export async function getRecentReadings(userId: string) {
  const { data } = await supabase
    .from('heart_rate_readings')
    .select('heart_rate, lat, lng, recorded_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(4); // last 4 readings = 1 minute at 15s intervals
  return data ?? [];
}

export async function getUser(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}