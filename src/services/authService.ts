import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  nickname: string;
  full_name?: string | null;
  avatar_url?: string | null;
  profile_completed: boolean;
  created_at: string;
}

export class AuthService {
  /**
   * Sign in or sign up with username
   * If username exists, returns that user
   * If username doesn't exist, creates a new user and returns it
   */
  async signInWithUsername(username: string): Promise<UserProfile> {
    try {
      console.log('AuthService: Starting username auth for:', username);

      // Validate username
      if (!username || username.trim().length < 3 || username.trim().length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
      }

      // Check if username matches pattern (letters, numbers, underscores, hyphens)
      const usernamePattern = /^[a-zA-Z0-9_-]+$/;
      if (!usernamePattern.test(username.trim())) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
      }

      const trimmedUsername = username.trim().toLowerCase();

      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('nickname', trimmedUsername)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking username:', checkError);
        throw new Error('Failed to check username availability');
      }

      if (existingUser) {
        console.log('AuthService: User found, logging in:', existingUser.id);
        // Store user ID in localStorage for session management
        localStorage.setItem('chainspeak_user_id', existingUser.id);
        localStorage.setItem('chainspeak_username', existingUser.nickname);
        return existingUser;
      }

      // User doesn't exist, create new user
      console.log('AuthService: User not found, creating new user');
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            nickname: trimmedUsername,
            profile_completed: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        
        // Check if it's a unique constraint violation (username already exists)
        if (createError.code === '23505' || createError.message.includes('unique')) {
          // Try to get the existing user
          const { data: user } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('nickname', trimmedUsername)
            .single();
          
          if (user) {
            localStorage.setItem('chainspeak_user_id', user.id);
            localStorage.setItem('chainspeak_username', user.nickname);
            return user;
          }
        }
        
        throw new Error('Failed to create user account');
      }

      if (!newUser) {
        throw new Error('User creation failed - no data returned');
      }

      console.log('AuthService: New user created:', newUser.id);
      localStorage.setItem('chainspeak_user_id', newUser.id);
      localStorage.setItem('chainspeak_username', newUser.nickname);
      return newUser;
    } catch (error) {
      console.error('Sign in with username error:', error);
      throw error;
    }
  }

  /**
   * Get current user from localStorage
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const userId = localStorage.getItem('chainspeak_user_id');
      const username = localStorage.getItem('chainspeak_username');

      if (!userId || !username) {
        console.log('AuthService: No user in localStorage');
        return null;
      }

      // Fetch user from database to get latest data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Get user profile error:', profileError);
        // Clear invalid localStorage data
        localStorage.removeItem('chainspeak_user_id');
        localStorage.removeItem('chainspeak_username');
        return null;
      }

      if (!profile) {
        console.log('AuthService: User profile not found');
        localStorage.removeItem('chainspeak_user_id');
        localStorage.removeItem('chainspeak_username');
        return null;
      }

      console.log('AuthService: User profile retrieved:', profile);
      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('AuthService: Signing out user');

      // Clear localStorage
      localStorage.removeItem('chainspeak_user_id');
      localStorage.removeItem('chainspeak_username');

      console.log('AuthService: User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async updateProfile(updates: {
    nickname?: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<UserProfile> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        throw new Error(error.message);
      }

      console.log('AuthService: Profile updated:', profile);
      
      // Update localStorage if nickname changed
      if (updates.nickname && profile) {
        localStorage.setItem('chainspeak_username', profile.nickname);
      }
      
      return profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();