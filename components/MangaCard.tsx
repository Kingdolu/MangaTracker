import React from 'react';
import { Manga, ReadingStatus } from '../types';
import { PLACEHOLDER_IMAGE } from '../constants';
import { Star } from 'lucide-react';

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
      className="relative flex flex-col bg-gray-800 rounded-lg overflow-hidden shadow-lg active:scale-95 transition-transform duration-100 cursor-pointer"
    >
      <div className="aspect-[2/3] w-full relative">
        <img 
          src={manga.coverImage.large || PLACEHOLDER_IMAGE} 
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {status && (
          <div className={`absolute top-2 right-2 ${getStatusColor(status)} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md`}>
            {status}
          </div>
        )}
        {manga.averageScore && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            {manga.averageScore}%
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
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