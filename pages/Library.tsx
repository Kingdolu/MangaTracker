import React, { useState, useMemo } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { ReadingStatus } from '../types';
import MangaCard from '../components/MangaCard';
import { useNavigate } from 'react-router-dom';
import { Filter, X, Cloud, LogIn, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const LibraryPage: React.FC = () => {
  const { library, user, loading } = useLibrary();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'All'>('All');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError('');
    
    // Attempt sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If sign in fails, try sign up (simple flow for demo)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setAuthError(error.message);
      } else {
        setIsAuthModalOpen(false); // Success (check email usually, but for dev env might be auto)
        alert("Account created! Please check your email to confirm if required, or sign in now.");
      }
    } else {
      setIsAuthModalOpen(false);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <div className="p-4 pb-24 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            My Library
            {user ? (
               <Cloud size={18} className="text-green-400" /> 
            ) : (
               <Cloud size={18} className="text-gray-600" />
            )}
          </h1>
          <span className="text-xs text-gray-500">
            {user ? 'Synced to Cloud' : 'Local Storage'}
          </span>
        </div>
        
        {supabase ? (
            user ? (
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-gray-800 rounded-full text-red-400 border border-gray-700 hover:bg-gray-700"
                >
                  <LogOut size={20} />
                </button>
            ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-500"
                >
                  <LogIn size={14} /> Sign In
                </button>
            )
        ) : null}
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-gray-900 w-full max-w-sm p-6 rounded-2xl border border-gray-700 shadow-2xl relative">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Sync to Cloud</h2>
            <p className="text-sm text-gray-400 mb-6">Sign in or create an account to backup your library.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
              {authError && <p className="text-red-400 text-xs">{authError}</p>}
              
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-500 disabled:opacity-50"
              >
                {authLoading ? <Loader2 className="animate-spin" /> : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

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