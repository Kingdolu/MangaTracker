import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchManga } from '../services/anilist';
import { Manga, ReadingStatus } from '../types';
import MangaCard from '../components/MangaCard';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getStatus } = useLibrary();

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const data = await searchManga(query);
    setResults(data);
    setLoading(false);
  }, [query]);

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Find Manhwa
      </h1>
      
      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500"
        />
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg text-white disabled:opacity-50"
          disabled={loading || !query}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <SearchIcon size={16} />}
        </button>
      </form>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((manga) => (
            <MangaCard 
              key={manga.id} 
              manga={manga} 
              onClick={() => navigate(`/details/${manga.id}`, { state: { manga } })}
              status={getStatus(manga.id)}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <SearchIcon size={48} className="mb-4 opacity-20" />
            <p>Search for your favorite manhwa</p>
          </div>
        )
      )}
    </div>
  );
};

export default SearchPage;
