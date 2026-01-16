import { supabase } from '../lib/supabase';

export async function getWeeklyActivitySeconds(userId: string) {
  if (!userId) {
    console.log('getWeeklyActivitySeconds: No userId provided');
    return [];
  }

  // Get the last 7 days including today, ensuring we use local timezone
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Format as YYYY-MM-DD in local timezone
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    days.push(dateString);
  }

  console.log('getWeeklyActivitySeconds: Fetching data for days:', days);
  console.log('getWeeklyActivitySeconds: User ID:', userId);
  console.log('getWeeklyActivitySeconds: Today is:', today.toDateString(), 'Day of week:', today.getDay());

  // Fetch all 7 days at once
  const { data, error } = await supabase
    .from('user_activity')
    .select('date, seconds_spent')
    .eq('user_id', userId)
    .in('date', days);

  if (error) {
    console.error('getWeeklyActivitySeconds: Error fetching weekly activity:', error);
    return days.map(date => ({ date, seconds_spent: 0 }));
  }

  console.log('getWeeklyActivitySeconds: Raw data from database:', data);

  // Map results to all 7 days, filling in 0 if missing
  const result = days.map(date => {
    const found = data?.find(row => row.date === date);
    const seconds_spent = found ? found.seconds_spent : 0;
    console.log(`getWeeklyActivitySeconds: ${date} -> ${seconds_spent} seconds`);
    return { date, seconds_spent };
  });

  console.log('getWeeklyActivitySeconds: Final result:', result);
  return result;
}