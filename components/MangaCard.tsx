import React from 'react';
import { Manga, ReadingStatus } from '../types';
import { PLACEHOLDER_IMAGE } from '../constants';
import { Star, Book } from 'lucide-react';

interface MangaCardProps {
  manga: Manga;
  onClick: () => void;
  status?: ReadingStatus;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, onClick, status }) => {
  // Prioritize English title, fallback to userPreferred, then romaji
  const title = manga.title.english || manga.title.userPreferred || manga.title.romaji;
  
  const getStatusColor = (s: ReadingStatus) => {
    switch (s) {
      case ReadingStatus.READING: return 'bg-blue-600';
      case ReadingStatus.COMPLETED: return 'bg-green-600';
      case ReadingStatus.WANT_TO_READ: return 'bg-yellow-600';
      case ReadingStatus.DROPPED: return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col bg-gray-800 rounded-lg overflow-hidden shadow-lg active:scale-95 transition-transform duration-100 cursor-pointer group"
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img 
          src={manga.coverImage.large || PLACEHOLDER_IMAGE} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Status Badge (Top Right) */}
        {status && (
          <div className={`absolute top-2 right-2 ${getStatusColor(status)} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10`}>
            {status}
          </div>
        )}

        {/* Score Badge (Bottom Right) */}
        {manga.averageScore && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <Star size={10} fill="currentColor" />
            {manga.averageScore}%
          </div>
        )}

        {/* Chapter Count Badge (Bottom Left) */}
        {manga.chapters && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <Book size={10} />
            {manga.chapters}
          </div>
        )}
        
        {/* Gradient Overlay for text readability if needed */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-3 flex-1 flex flex-col justify-between bg-gray-800 z-20">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {manga.status?.replace(/_/g, ' ').toLowerCase() || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

export default MangaCard;