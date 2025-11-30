import React, { useEffect, useState, useCallback } from 'react';
import { getTrendingManhwa } from '../services/anilist';
import { getRecommendations } from '../services/gemini';
import { Manga, RecommendedManga } from '../types';
import MangaCard from '../components/MangaCard';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles, RefreshCcw } from 'lucide-react';
import { useLibrary } from '../hooks/useLibrary';

const HomePage: React.FC = () => {
  const [content, setContent] = useState<(Manga | RecommendedManga)[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'trending' | 'recommended'>('trending');
  const navigate = useNavigate();
  const { library, getStatus } = useLibrary();

  const loadContent = useCallback(async () => {
    setLoading(true);
    const hasLibrary = library.length > 0;
    
    // Logic: If user has a library, 60% chance to show AI picks, 40% random trending.
    // If no library, always show trending.
    const useRecommendations = hasLibrary && Math.random() > 0.4;

    if (useRecommendations) {
      setMode('recommended');
      try {
        const recs = await getRecommendations(library);
        if (recs.length > 0) {
          setContent(recs);
        } else {
          // Fallback if AI returns nothing
          setMode('trending');
          const randomPage = Math.floor(Math.random() * 5) + 1;
          const trending = await getTrendingManhwa(randomPage);
          setContent(trending);
        }
      } catch (e) {
        setMode('trending');
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const trending = await getTrendingManhwa(randomPage);
        setContent(trending);
      }
    } else {
      setMode('trending');
      // Fetch a random page between 1 and 5 to keep trending content fresh
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const trending = await getTrendingManhwa(randomPage);
      setContent(trending);
    }
    setLoading(false);
  }, [library]);

  useEffect(() => {
    loadContent();
  }, []); // Runs once on mount (refresh)

  return (
    <div className="p-4 pb-24 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Manhwa<span className="text-blue-500">Tracker</span></h1>
            <p className="text-gray-400 text-sm">Organize your reading journey.</p>
        </div>
        <button 
          onClick={loadContent}
          disabled={loading}
          className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {mode === 'recommended' ? (
          <>
            <Sparkles className="text-purple-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Picked for You
            </h2>
          </>
        ) : (
          <>
            <Flame className="text-orange-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-white">
              Discover Trending
            </h2>
          </>
        )}
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {content.map((manga) => (
            <div key={manga.id} className="flex flex-col">
                <MangaCard 
                    manga={manga} 
                    onClick={() => navigate(`/details/${manga.id}`, { state: { manga } })}
                    status={getStatus(manga.id)}
                />
                {'recommendationReason' in manga && (
                    <div className="mt-1 px-1">
                        <p className="text-[10px] text-purple-300 italic leading-tight line-clamp-2">
                        {(manga as RecommendedManga).recommendationReason}
                        </p>
                    </div>
                )}
            </div>
            ))}
            {content.length === 0 && !loading && (
                <div className="col-span-2 text-gray-500 text-sm">
                    No titles found. Try refreshing!
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default HomePage;