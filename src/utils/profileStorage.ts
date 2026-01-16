// Utility functions for profile management
// This is a legacy utility that's being phased out in favor of Supabase
// but kept for compatibility with existing components

export const clearProfile = () => {
  // Clear any legacy localStorage data
  localStorage.removeItem('chainspeakProfile');
  
  // In the new system, this would also handle Supabase logout
  // but for now we'll just clear localStorage for compatibility
  console.log('Profile cleared from localStorage');
};

export const getProfile = () => {
  try {
    const profile = localStorage.getItem('chainspeakProfile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const setProfile = (profile: { name: string }) => {
  try {
    localStorage.setItem('chainspeakProfile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error setting profile:', error);
  }
};