import { useState, useEffect } from 'react';
import { LibraryItem, Manga, ReadingStatus } from '../types';
import { supabase, mapRowToLibraryItem } from '../services/supabase';

const STORAGE_KEY = 'manhwa-organizer-library';

export const useLibrary = () => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Auth Session
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Library (Local vs Cloud)
  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);
      
      if (user && supabase) {
        // --- CLOUD MODE ---
        try {
          const { data, error } = await supabase
            .from('library')
            .select('*')
            .order('saved_at', { ascending: false });

          if (error) throw error;
          
          if (data) {
            setLibrary(data.map(mapRowToLibraryItem));
          }
        } catch (err) {
          console.error('Error loading from Supabase:', err);
        }
      } else {
        // --- OFFLINE MODE ---
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setLibrary(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse library", e);
          }
        }
      }
      setLoading(false);
    };

    // If supabase isn't configured, we just load local immediately
    if (!supabase) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setLibrary(JSON.parse(stored));
        setLoading(false);
    } else {
        loadLibrary();
    }
  }, [user]);

  const saveLibraryLocal = (newLibrary: LibraryItem[]) => {
    setLibrary(newLibrary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  };

  const addToLibrary = async (manga: Manga, status: ReadingStatus) => {
    const newItem: LibraryItem = {
      ...manga,
      readingStatus: status,
      savedAt: Date.now(),
    };

    if (user && supabase) {
      // --- CLOUD SAVE ---
      // Optimistic update
      setLibrary(prev => {
        const exists = prev.find(item => item.id === manga.id);
        return exists 
          ? prev.map(item => item.id === manga.id ? newItem : item)
          : [newItem, ...prev];
      });

      try {
        const { error } = await supabase
          .from('library')
          .upsert({
            user_id: user.id,
            manga_id: String(manga.id),
            manga_data: manga, // Storing full object as JSONB
            status: status,
            saved_at: Date.now()
          }, { onConflict: 'user_id, manga_id' });

        if (error) throw error;
      } catch (err) {
        console.error("Supabase upsert error:", err);
        // Ideally revert optimistic update here on failure
      }
    } else {
      // --- LOCAL SAVE ---
      const exists = library.find(item => item.id === manga.id);
      if (exists) {
        const updated = library.map(item => item.id === manga.id ? newItem : item);
        saveLibraryLocal(updated);
      } else {
        saveLibraryLocal([newItem, ...library]);
      }
    }
  };

  const removeFromLibrary = async (id: number) => {
    if (user && supabase) {
      // --- CLOUD REMOVE ---
      setLibrary(prev => prev.filter(item => item.id !== id));
      try {
        const { error } = await supabase
          .from('library')
          .delete()
          .match({ user_id: user.id, manga_id: String(id) });
        
        if (error) throw error;
      } catch (err) {
        console.error("Supabase delete error:", err);
      }
    } else {
      // --- LOCAL REMOVE ---
      const updated = library.filter(item => item.id !== id);
      saveLibraryLocal(updated);
    }
  };

  const getStatus = (id: number): ReadingStatus | undefined => {
    return library.find(item => item.id === id)?.readingStatus;
  };

  return { library, addToLibrary, removeFromLibrary, getStatus, user, loading };
};