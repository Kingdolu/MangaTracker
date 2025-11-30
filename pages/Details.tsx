import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Manga, ReadingStatus } from '../types';
import { useLibrary } from '../hooks/useLibrary';
import { ChevronLeft, Star, Sparkles } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../constants';

const DetailsPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToLibrary, removeFromLibrary, getStatus } = useLibrary();
  
  // In a real app, we might fetch by ID if state is missing, but for this demo we assume state passage
  const manga = state?.manga as Manga;
  
  // Derived state directly from the hook to ensure it updates when library loads from storage
  const currentStatus = getStatus(manga?.id);

  if (!manga) {
    return <div className="p-4 text-center mt-20 text-white">Manga not found.</div>;
  }

  // Prioritize English title, fallback to userPreferred, then romaji
  const title = manga.title.english || manga.title.userPreferred || manga.title.romaji;
  
  const description = manga.description?.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '') || 'No description available.';

  const handleStatusChange = (status: ReadingStatus) => {
    addToLibrary(manga, status);
  };

  const handleRemove = () => {
    removeFromLibrary(manga.id);
  };

  return (
    <div className="bg-gray-900 min-h-screen pb-24">
      {/* Header Image */}
      <div className="relative h-64 w-full">
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
          className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md z-10"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 -mt-32 relative z-10">
        <div className="flex gap-4">
          <img 
            src={manga.coverImage.extraLarge || PLACEHOLDER_IMAGE}
            alt={title}
            className="w-32 h-48 object-cover rounded-lg shadow-2xl border-2 border-gray-700"
          />
          <div className="flex-1 pt-32">
             {/* Spacer for layout */}
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">{title}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
            <span className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" /> {manga.averageScore || '?'}%
            </span>
            <span className="capitalize">{manga.status?.replace(/_/g, ' ').toLowerCase()}</span>
            <span>{manga.chapters ? `${manga.chapters} Ch.` : 'Ongoing'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
                <select 
                value={currentStatus || ''}
                onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                className="bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl outline-none text-center appearance-none w-full"
                style={{ textAlignLast: 'center' }}
                >
                <option value="" disabled>Add to Library</option>
                {Object.values(ReadingStatus).map(s => (
                    <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>
                ))}
                </select>
                
                {currentStatus ? (
                <button 
                    onClick={handleRemove}
                    className="bg-gray-800 text-red-400 font-semibold py-3 px-4 rounded-xl border border-gray-700 w-full"
                >
                    Remove
                </button>
                ) : (
                    <div className="bg-gray-800 text-gray-500 font-semibold py-3 px-4 rounded-xl border border-gray-700 flex items-center justify-center text-sm">
                        Not in Library
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate('/recommendations', { state: { sourceManga: manga } })}
                className="w-full bg-purple-600/20 text-purple-300 border border-purple-500/50 hover:bg-purple-600/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
                <Sparkles size={18} /> Find Similar Titles
            </button>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {manga.genres?.map(genre => (
              <span key={genre} className="px-3 py-1 bg-gray-800 text-xs rounded-full text-gray-300">
                {genre}
              </span>
            ))}
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;