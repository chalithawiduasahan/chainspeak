import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  nickname: string;
  full_name?: string;
  avatar_url?: string;
  profile_completed: boolean;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
}

export interface SignUpResult {
  user?: UserProfile;
  needsVerification?: boolean;
  message?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  async signUp(data: SignUpData): Promise<SignUpResult> {
    try {
      console.log('AuthService: Starting sign up process for:', data.email);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nickname: data.nickname,
          }
        }
      });

      if (authError) {
        console.error('Auth sign up error:', authError);
        
        // Check if it's an email confirmation required error
        if (authError.message.includes('email') || authError.message.includes('confirmation')) {
          return {
            needsVerification: true,
            message: 'Please check your email for verification link'
          };
        }
        
        throw new Error(authError.message);
      }

      // Check if user needs email confirmation
      if (authData.user && !authData.session) {
        console.log('AuthService: User created but needs email verification');
        return {
          needsVerification: true,
          message: 'Please check your email for verification link'
        };
      }

      if (!authData.user) {
        return {
          needsVerification: true,
          message: 'Account created. Please check your email for verification link'
        };
      }

      console.log('AuthService: Auth user created:', authData.user.id);

      // If we have a session, the user is immediately signed in
      if (authData.session) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the created profile
        const profile = await this.getCurrentUser();
        if (profile) {
          console.log('AuthService: User profile created:', profile);
          return { user: profile };
        }
      }

      // Default to needing verification
      return {
        needsVerification: true,
        message: 'Please check your email for verification link'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(data: SignInData): Promise<UserProfile> {
    try {
      console.log('AuthService: Starting sign in process for:', data.email);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth sign in error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned from sign in');
      }

      console.log('AuthService: User signed in:', authData.user.id);

      // Get the user profile
      const profile = await this.getCurrentUser();
      if (!profile) {
        throw new Error('User profile not found');
      }

      console.log('AuthService: User profile retrieved:', profile);
      return profile;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      console.log('AuthService: Starting Google sign in');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw new Error(error.message);
      }

      // The redirect will handle the rest
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async resendVerification(email: string): Promise<void> {
    try {
      console.log('AuthService: Resending verification email to:', email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Resend verification error:', error);
        throw new Error(error.message);
      }

      console.log('AuthService: Verification email resent successfully');
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      // Get current auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.log('Get auth user error:', authError);
        // If it's just a session missing error, return null gracefully
        if (authError.message.includes('session missing') || authError.message.includes('Auth session missing')) {
          console.log('AuthService: No active session found');
          return null;
        }
        // For other auth errors, still return null but log the error
        console.error('AuthService: Auth error, but continuing:', authError.message);
        return null;
      }

      if (!user) {
        console.log('AuthService: No authenticated user');
        return null;
      }

      console.log('AuthService: Found authenticated user:', user.id);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) {
        console.error('Get user profile error:', profileError);
        // If profile doesn't exist, return null gracefully
        if (profileError.code === 'PGRST116') {
          console.log('AuthService: User profile not found for authenticated user');
          return null;
        }
        return null;
      }

      if (!profile) {
        console.log('AuthService: No user profile found');
        return null;
      }

      console.log('AuthService: User profile retrieved:', profile);
      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      // Always return null instead of throwing, so the app doesn't crash
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('AuthService: Signing out user');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }

      // Clear any local storage
      localStorage.removeItem('chainspeak_user_id');
      localStorage.removeItem('chainspeak_user');

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
        .eq('auth_user_id', currentUser.auth_user_id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        throw new Error(error.message);
      }

      console.log('AuthService: Profile updated:', profile);
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

  // Legacy method for backward compatibility
  async createUserProfile(nickname: string): Promise<UserProfile> {
    // This method is now deprecated in favor of the new auth system
    throw new Error('Please use the new sign up system instead');
  }
}

export const authService = new AuthService();