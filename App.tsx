import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SearchPage from './pages/Search';
import LibraryPage from './pages/Library';
import DetailsPage from './pages/Details';
import RecommendationsPage from './pages/Recommendations';
import HomePage from './pages/Home';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="max-w-md mx-auto bg-gray-900 min-h-screen relative shadow-2xl overflow-hidden">
        {/* The max-w-md constrains it to "mobile size" on desktop for a better preview */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/details/:id" element={<DetailsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
