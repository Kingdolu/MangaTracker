import React, { Component, ReactNode, ErrorInfo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SearchPage from './pages/Search';
import LibraryPage from './pages/Library';
import DetailsPage from './pages/Details';
import RecommendationsPage from './pages/Recommendations';
import HomePage from './pages/Home';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch runtime crashes
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertTriangle className="text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-4">
            The application encountered an unexpected error.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-left text-xs text-red-300 font-mono w-full max-w-sm overflow-auto">
            {this.state.error?.toString() || "Unknown Error"}
          </div>
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="mt-6 bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-500"
          >
            Reset App & Data
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        {/* Main Layout Container */}
        <div className="bg-gray-900 min-h-screen relative text-gray-100 flex flex-col md:flex-row">
          
          <BottomNav />

          {/* Content Area */}
          {/* Mobile: pb-20 (nav height). Desktop: pl-64 (sidebar width), no bottom pad */}
          <div className="flex-1 w-full pb-20 md:pb-0 md:pl-64 transition-all duration-300">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/details/:id" element={<DetailsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;