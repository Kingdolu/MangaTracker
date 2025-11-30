
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Manga, ReadingStatus, RecommendedManga } from '../types';
import { useLibrary } from '../hooks/useLibrary';
import { getRecommendations } from '../services/gemini';
import { ChevronLeft, Star, Sparkles, Loader2 } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../constants';
import MangaCard from '../components/MangaCard';

const DetailsPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToLibrary, removeFromLibrary, getStatus } = useLibrary();
  
  const [recommendations, setRecommendations] = useState<RecommendedManga[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  const manga = state?.manga as Manga;
  const currentStatus = getStatus(manga?.id);

  useEffect(() => {
    const fetchRecs = async () => {
        if (!manga) return;
        setRecLoading(true);
        try {
            const recs = await getRecommendations([], manga);
            setRecommendations(recs);
        } catch (e) {
            console.error("Failed to load recs", e);
        } finally {
            setRecLoading(false);
        }
    };
    fetchRecs();
  }, [manga?.id]);

  if (!manga) {
    return <div className="p-4 text-center mt-20 text-white">Manga not found.</div>;
  }

  const title = manga.title.english || manga.title.userPreferred || manga.title.romaji;
  const description = manga.description?.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '') || 'No description available.';

  const handleStatusChange = (status: ReadingStatus) => {
    addToLibrary(manga, status);
  };

  const handleRemove = () => {
    removeFromLibrary(manga.id);
  };

  return (
    <div className="bg-gray-900 min-h-screen pb-24 md:pb-10">
      
      {/* Banner / Header Image */}
      <div className="relative h-64 md:h-80 w-full">
        <div className="absolute inset-0">
          <img 
            src={manga.coverImage.extraLarge || PLACEHOLDER_IMAGE} 
            alt="banner" 
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md z-10 hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="px-5 -mt-32 md:-mt-48 relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            
            {/* Left Column: Cover Image (Mobile: overlapping, Desktop: Side) */}
            <div className="flex-shrink-0">
                <img 
                    src={manga.coverImage.extraLarge || PLACEHOLDER_IMAGE}
                    alt={title}
                    className="w-32 h-48 md:w-64 md:h-96 object-cover rounded-lg shadow-2xl border-2 border-gray-700 mx-auto md:mx-0"
                />
            </div>

            {/* Right Column: Details */}
            <div className="flex-1 pt-4 md:pt-20">
                <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2 md:mb-4">{title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
                    <span className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star size={18} fill="currentColor" /> {manga.averageScore || '?'}%
                    </span>
                    <span className="px-3 py-1 bg-gray-800 rounded-full capitalize">
                        {manga.status?.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 rounded-full">
                        {manga.chapters ? `${manga.chapters} Chapters` : 'Ongoing'}
                    </span>
                </div>

                {/* Desktop Buttons Layout */}
                <div className="flex flex-col md:flex-row gap-3 mb-8 max-w-md">
                     <select 
                        value={currentStatus || ''}
                        onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                        className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-3 px-6 rounded-xl outline-none appearance-none cursor-pointer flex-1"
                    >
                        <option value="" disabled>Add to Library</option>
                        {Object.values(ReadingStatus).map(s => (
                            <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>
                        ))}
                    </select>
                    
                    {currentStatus && (
                        <button 
                            onClick={handleRemove}
                            className="bg-gray-800 hover:bg-gray-700 text-red-400 font-semibold py-3 px-6 rounded-xl border border-gray-700 transition-colors"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {manga.genres?.map(genre => (
                    <span key={genre} className="px-3 py-1 bg-gray-800 border border-gray-700 text-xs rounded-full text-gray-300">
                        {genre}
                    </span>
                    ))}
                </div>

                {/* Summary */}
                <div className="mb-10 max-w-4xl">
                    <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {description}
                    </p>
                </div>

                {/* Recommendations Section */}
                <div className="border-t border-gray-800 pt-8 pb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-purple-500" size={24} />
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Similar Titles
                        </h3>
                    </div>

                    {recLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-purple-500" size={32} />
                        </div>
                    ) : recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {recommendations.map(rec => (
                                <div key={rec.id} className="flex flex-col h-full">
                                    <MangaCard 
                                        manga={rec}
                                        onClick={() => {
                                            navigate(`/details/${rec.id}`, { state: { manga: rec } });
                                            window.scrollTo(0, 0);
                                        }}
                                        status={getStatus(rec.id)}
                                    />
                                    <div className="bg-gray-800/50 p-3 rounded-b-lg border-x border-b border-gray-700/50 mt-1 flex-1">
                                        <p className="text-[11px] text-purple-300 italic leading-snug">
                                            "{rec.recommendationReason}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Unable to load recommendations at this time.
                        </p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
