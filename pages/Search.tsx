import React, { useState, useCallback, useEffect } from 'react';
import { Search as SearchIcon, Loader2, X, Filter, Globe } from 'lucide-react';
import { searchManga } from '../services/anilist';
import { Manga } from '../types';
import MangaCard from '../components/MangaCard';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
];

const ORIGINS = [
  { label: "All", value: "All" },
  { label: "Manhwa (KR)", value: "KR" },
  { label: "Manga (JP)", value: "JP" },
  { label: "Manhua (CN)", value: "CN" },
];

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeCountry, setActiveCountry] = useState('All');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getStatus } = useLibrary();

  // Load state from session storage on mount
  useEffect(() => {
    const cachedQuery = sessionStorage.getItem('search_query');
    const cachedGenre = sessionStorage.getItem('search_genre');
    const cachedCountry = sessionStorage.getItem('search_country');
    const cachedResults = sessionStorage.getItem('search_results');
    
    if (cachedQuery) setQuery(cachedQuery);
    if (cachedGenre) setActiveGenre(cachedGenre);
    if (cachedCountry) setActiveCountry(cachedCountry);
    if (cachedResults) {
      try {
        setResults(JSON.parse(cachedResults));
      } catch (e) {
        console.error("Failed to parse cached search results");
      }
    }
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideGenre?: string, overrideCountry?: string) => {
    if (e) e.preventDefault();
    
    const genreToUse = overrideGenre !== undefined ? overrideGenre : activeGenre;
    const countryToUse = overrideCountry !== undefined ? overrideCountry : activeCountry;

    // Allow search if query exists OR filters are active (not All)
    if (!query.trim() && genreToUse === 'All' && countryToUse === 'All') return;

    setLoading(true);
    try {
      const data = await searchManga(
        query, 
        genreToUse === 'All' ? undefined : genreToUse,
        countryToUse === 'All' ? undefined : countryToUse
      );
      setResults(data);
      
      // Persist to session storage
      sessionStorage.setItem('search_query', query);
      sessionStorage.setItem('search_genre', genreToUse);
      sessionStorage.setItem('search_country', countryToUse);
      sessionStorage.setItem('search_results', JSON.stringify(data));
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, [query, activeGenre, activeCountry]);

  const onGenreClick = (genre: string) => {
    const newGenre = activeGenre === genre ? 'All' : genre;
    setActiveGenre(newGenre);
    handleSearch(undefined, newGenre, activeCountry);
  };

  const onCountryClick = (country: string) => {
    const newCountry = activeCountry === country ? 'All' : country;
    setActiveCountry(newCountry);
    handleSearch(undefined, activeGenre, newCountry);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveGenre('All');
    setActiveCountry('All');
    setResults([]);
    sessionStorage.removeItem('search_query');
    sessionStorage.removeItem('search_genre');
    sessionStorage.removeItem('search_country');
    sessionStorage.removeItem('search_results');
  };

  return (
    <div className="p-4 pb-24 min-h-screen max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Find Titles
      </h1>
      
      <div className="max-w-xl mb-6">
        {/* Search Bar */}
        <form onSubmit={(e) => handleSearch(e)} className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500"
          />
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}

          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg text-white disabled:opacity-50 hover:bg-blue-500 transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <SearchIcon size={16} />}
          </button>
        </form>

        {/* Origin/Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 flex-shrink-0">
            <Globe size={14} className="mr-1" /> Origin
          </div>
          {ORIGINS.map((origin) => (
            <button
              key={origin.value}
              onClick={() => onCountryClick(origin.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
                activeCountry === origin.value
                  ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              {origin.label}
            </button>
          ))}
        </div>

        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 flex-shrink-0">
            <Filter size={14} className="mr-1" /> Genre
          </div>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreClick(genre)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
                activeGenre === genre
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            <p>Search by title, genre, or origin</p>
          </div>
        )
      )}
      
      {loading && results.length === 0 && (
         <div className="flex justify-center mt-20">
             <Loader2 size={32} className="animate-spin text-blue-500" />
         </div>
      )}
    </div>
  );
};

export default SearchPage;