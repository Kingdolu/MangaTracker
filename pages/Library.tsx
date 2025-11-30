
import React, { useState, useMemo } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { ReadingStatus } from '../types';
import MangaCard from '../components/MangaCard';
import { useNavigate } from 'react-router-dom';
import { Filter, X, Smartphone, Loader2 } from 'lucide-react';

const LibraryPage: React.FC = () => {
  const { library, loading } = useLibrary();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'All'>('All');
  const [activeGenre, setActiveGenre] = useState<string>('All');

  // Extract all unique genres from the user's library
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    library.forEach(item => {
      item.genres?.forEach(g => genres.add(g));
    });
    return ['All', ...Array.from(genres).sort()];
  }, [library]);

  const filteredLibrary = useMemo(() => {
    return library.filter((item) => {
      const statusMatch = activeTab === 'All' || item.readingStatus === activeTab;
      const genreMatch = activeGenre === 'All' || item.genres?.includes(activeGenre);
      return statusMatch && genreMatch;
    });
  }, [library, activeTab, activeGenre]);

  const tabs = ['All', ...Object.values(ReadingStatus)];

  return (
    <div className="p-4 pb-24 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            My Library
            <Smartphone size={18} className="text-blue-400" />
          </h1>
          <span className="text-xs text-gray-500">
            Stored on this device
          </span>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Status</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as ReadingStatus | 'All')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filters */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 ml-1">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Genre</h3>
             {activeGenre !== 'All' && (
                 <button 
                    onClick={() => setActiveGenre('All')}
                    className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors"
                 >
                    <X size={12} /> Clear Filter
                 </button>
             )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeGenre === genre
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filteredLibrary.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredLibrary.map((item) => (
            <MangaCard 
              key={item.id} 
              manga={item} 
              onClick={() => navigate(`/details/${item.id}`, { state: { manga: item } })}
              status={item.readingStatus}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-12 text-gray-500">
          <Filter size={48} className="mb-4 opacity-20" />
          <p className="text-center">
            No titles found in <span className="text-blue-400 font-medium">"{activeTab}"</span> 
            {activeGenre !== 'All' && <> with genre <span className="text-purple-400 font-medium">"{activeGenre}"</span></>}
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
