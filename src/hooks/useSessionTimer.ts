import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useSessionTimer(userId?: string) {
  const sessionStartTimeRef = useRef<number | null>(null); // When the current session started
  const accumulatedDurationRef = useRef<number>(0); // Total seconds accumulated for the current day
  const intervalIdRef = useRef<number | null>(null); // To clear the interval

  const SAVE_INTERVAL_SECONDS = 15; // Save every 15 seconds

  const saveActivity = async (durationToAdd: number) => {
    if (!userId || durationToAdd <= 0) return;

    // Get today's date in local timezone (YYYY-MM-DD format)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    console.log('💾 Saving activity:', {
      userId,
      date: today,
      durationToAdd,
      currentTime: now.toLocaleString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' })
    });

    try {
      // Test Supabase connection first
      const { error: connectionError } = await supabase
        .from('user_activity')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        // If it's a table not found error, log it but don't throw
        if (connectionError.code === 'PGRST116' || connectionError.message?.includes('does not exist')) {
          console.warn('user_activity table does not exist. Skipping activity save.');
          return;
        }
        throw connectionError;
      }

      // Upsert logic: try to update, if not found, insert
      const { data, error } = await supabase
        .from('user_activity')
        .select('id, seconds_spent')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user activity for save:', error);
        return;
      }

      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_activity')
          .update({ seconds_spent: data.seconds_spent + durationToAdd })
          .eq('id', data.id);
        if (updateError) {
          console.error('Error updating user activity:', updateError);
        } else {
          console.log('✅ Updated activity:', durationToAdd, 'seconds added to existing', data.seconds_spent, 'for date:', today);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_activity')
          .insert([{ user_id: userId, date: today, seconds_spent: durationToAdd }]);
        if (insertError) {
          console.error('Error inserting user activity:', insertError);
        } else {
          console.log('✅ Inserted new activity:', durationToAdd, 'seconds for', today);
        }
      }
    } catch (e) {
      console.error('Failed to save activity:', e);
      // Check if it's a network error
      if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
      }
    }
  };

  useEffect(() => {
    if (!userId) {
      // Clear any existing interval if userId becomes null
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      accumulatedDurationRef.current = 0;
      sessionStartTimeRef.current = null;
      return;
    }

    console.log('🕒 Starting session timer for user:', userId);

    // Initialize on mount
    sessionStartTimeRef.current = Date.now();
    accumulatedDurationRef.current = 0; // Reset for the new session/day

    // Set up periodic save
    intervalIdRef.current = window.setInterval(() => {
      if (sessionStartTimeRef.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStartTimeRef.current) / 1000);
        const durationSinceLastSave = elapsedSeconds - accumulatedDurationRef.current;

        if (durationSinceLastSave >= SAVE_INTERVAL_SECONDS) {
          console.log('⏰ Saving activity:', durationSinceLastSave, 'seconds');
          saveActivity(durationSinceLastSave);
          accumulatedDurationRef.current = elapsedSeconds; // Update accumulated duration
        }
      }
    }, SAVE_INTERVAL_SECONDS * 1000); // Convert to milliseconds

    const handleBeforeUnload = () => {
      if (sessionStartTimeRef.current) {
        const now = Date.now();
        const finalDuration = Math.floor((now - sessionStartTimeRef.current) / 1000);
        const remainingDuration = finalDuration - accumulatedDurationRef.current;
        if (remainingDuration > 0) {
          console.log('💾 Final save on unload:', remainingDuration, 'seconds');
          // For page unload, we'll attempt the save but won't wait for it
          // as the browser may terminate the request
          saveActivity(remainingDuration).catch(err => {
            console.warn('Failed to save activity on unload:', err);
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Ensure final save on unmount if not already handled by beforeunload
      handleBeforeUnload(); // Call one last time to save any unsaved duration
    };
  }, [userId]);
}