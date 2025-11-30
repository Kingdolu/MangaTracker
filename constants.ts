
export const ANILIST_API_URL = 'https://graphql.anilist.co';

export const PLACEHOLDER_IMAGE = 'https://picsum.photos/300/450';

export const NAV_HEIGHT = '4rem'; // 64px

// Helper to safely get env vars in various environments (Vite, CRA, etc.)
const getEnv = (key: string): string => {
  try {
    // Check for Vite (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Check for Node/CRA (process.env)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return '';
};

// Supabase Configuration
// We check multiple naming conventions to support different hosting providers
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || getEnv('SUPABASE_URL');
export const SUPABASE_KEY = getEnv('VITE_SUPABASE_KEY') || getEnv('REACT_APP_SUPABASE_KEY') || getEnv('SUPABASE_KEY');

// Gemini Configuration
export const GEMINI_API_KEY = getEnv('VITE_API_KEY') || getEnv('REACT_APP_API_KEY') || getEnv('API_KEY') || getEnv('GOOGLE_GENAI_API_KEY');
