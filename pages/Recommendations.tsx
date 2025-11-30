
import React, { useState, useEffect } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { getRecommendations } from '../services/gemini';
import { Sparkles, Bot, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Manga, RecommendedManga } from '../types';
import MangaCard from '../components/MangaCard';

const RecommendationsPage: React.FC = () => {
  const { library, getStatus } = useLibrary();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState<RecommendedManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sourceManga, setSourceManga] = useState<Manga | undefined>(undefined);

  // Sync state with location state when navigating from Details page
  useEffect(() => {
    if (location.state?.sourceManga) {
      setSourceManga(location.state.sourceManga);
      setRecommendations([]); // Reset previous results when switching context
      setHasSearched(false);
    } else {
        setSourceManga(undefined);
    }
  }, [location.state]);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setHasSearched(true);
    setRecommendations([]); // Clear old results
    
    // Pass sourceManga if it exists, otherwise it defaults to library usage inside the service
    const result = await getRecommendations(library, sourceManga);
    setRecommendations(result);
    setLoading(false);
  };

  const clearSource = () => {
      setSourceManga(undefined);
      setRecommendations([]);
      setHasSearched(false);
  };

  return (
    <div className="p-4 pb-24 min-h-screen max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-lg">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                <Sparkles className="text-purple-400" />
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    AI Recommendations
                </h1>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center mb-8 relative overflow-hidden">
            {sourceManga && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            )}
            
            <Bot size={48} className={`mx-auto mb-4 ${sourceManga ? 'text-purple-400' : 'text-blue-400'}`} />
            
            <div className="text-gray-300 mb-6">
                {sourceManga ? (
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400">Because you liked</span>
                        <div className="font-bold text-white text-lg mt-1 mb-2 line-clamp-1 px-4">
                            "{sourceManga.title.english || sourceManga.title.userPreferred}"
                        </div>
                        <button 
                            onClick={clearSource}
                            className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors"
                        >
                            <X size={12} /> Switch to Library Mode
                        </button>
                    </div>
                ) : (
                    <p>
                        Based on the <strong>{library.length} titles</strong> in your library, 
                        Gemini can find the perfect next read for you.
                    </p>
                )}
            </div>
            
            <button
                onClick={handleGetRecommendations}
                disabled={loading}
                className={`w-full bg-gradient-to-r text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2
                    ${sourceManga 
                        ? 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/20' 
                        : 'from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/20'
                    }`}
            >
                {loading ? (
                <>Thinking...</>
                ) : (
                <>
                    <Sparkles size={18} /> {sourceManga ? 'Find Similar' : 'Get Recommendations'}
                </>
                )}
            </button>
            </div>
        </div>
      </div>

      {/* Results Grid */}
      {hasSearched && !loading && recommendations.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
              No recommendations found. Try adding more titles to your library!
          </div>
      ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recommendations.map((manga) => (
                <div key={manga.id} className="flex flex-col h-full">
                    <MangaCard 
                        manga={manga} 
                        onClick={() => navigate(`/details/${manga.id}`, { state: { manga } })}
                        status={getStatus(manga.id)}
                    />
                    <div className="bg-gray-800/50 p-3 rounded-b-lg border-x border-b border-gray-700/50 mt-1 flex-1">
                         <p className="text-[11px] text-purple-300 italic leading-snug">
                            "{manga.recommendationReason}"
                         </p>
                    </div>
                </div>
            ))}
          </div>
      )}
      
      {loading && (
          <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
