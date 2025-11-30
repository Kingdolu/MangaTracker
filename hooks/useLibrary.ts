
import { useState, useEffect } from 'react';
import { LibraryItem, Manga, ReadingStatus } from '../types';

const STORAGE_KEY = 'manhwa-organizer-library';

export const useLibrary = () => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Library from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLibrary(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse library from local storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLibraryLocal = (newLibrary: LibraryItem[]) => {
    setLibrary(newLibrary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  };

  const addToLibrary = (manga: Manga, status: ReadingStatus) => {
    const newItem: LibraryItem = {
      ...manga,
      readingStatus: status,
      savedAt: Date.now(),
    };

    const exists = library.find(item => item.id === manga.id);
    if (exists) {
      const updated = library.map(item => item.id === manga.id ? newItem : item);
      saveLibraryLocal(updated);
    } else {
      saveLibraryLocal([newItem, ...library]);
    }
  };

  const removeFromLibrary = (id: number) => {
    const updated = library.filter(item => item.id !== id);
    saveLibraryLocal(updated);
  };

  const getStatus = (id: number): ReadingStatus | undefined => {
    return library.find(item => item.id === id)?.readingStatus;
  };

  return { 
    library, 
    addToLibrary, 
    removeFromLibrary, 
    getStatus, 
    user: null, // No user in local-only mode
    loading 
  };
};
