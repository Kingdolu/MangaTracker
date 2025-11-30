import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

// Only create the client if keys are present
export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Helper to map Supabase row to LibraryItem
export const mapRowToLibraryItem = (row: any) => ({
  ...row.manga_data,
  readingStatus: row.status,
  savedAt: row.saved_at
});