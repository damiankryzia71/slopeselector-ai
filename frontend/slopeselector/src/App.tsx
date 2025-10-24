import React, { useState, useEffect } from 'react';
import { Snowflake, History, Loader2, AlertCircle, ExternalLink, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { ApiResponse, HistoryItem, Product, Category } from './types';
import { getRecommendations, getHistory, getRecommendationById } from './services/apiService';

// Generate a unique user ID and store it in localStorage
const getUserId = (): string => {
  let userId = localStorage.getItem('slopeselector_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('slopeselector_user_id', userId);
  }
  return userId;
};

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'results' | 'history'>('home');
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(getUserId());

  // Load history when switching to history view
  useEffect(() => {
    if (currentPage === 'history' && history.length === 0) {
      loadHistory();
    }
  }, [currentPage]);

  const loadHistory = async () => {
    try {
      const historyData = await getHistory(userId);
      setHistory(historyData);
    } catch (err) {
      setError('Failed to load history');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getRecommendations(prompt, userId);
      setResults(response);
      setCurrentPage('results');
      // Refresh history if we're on the history view
      if (currentPage === 'history') {
        loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = async (item: HistoryItem) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRecommendationById(item.id);
      setResults(response);
      setCurrentPage('results');
    } catch (err) {
      setError('Failed to load recommendation details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 bg-mountain bg-cover bg-center">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Snowflake className="h-12 w-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">SlopeSelector AI</h1>
          </div>
          <p className="text-slate-300 text-lg">Personalized ski and snowboard gear recommendations</p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                setCurrentPage('home');
                setPrompt(''); // Clear the search box
                setError(null); // Clear any error messages
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 'home'
                  ? 'bg-cyan-500 text-black shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Get Recommendations
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 'history'
                  ? 'bg-cyan-500 text-black shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <History className="inline h-4 w-4 mr-2" />
              History
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          {currentPage === 'home' && (
            <HomePage 
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}
          
          {currentPage === 'results' && results && (
            <ResultsPage 
              results={results}
              onBack={() => {
                setCurrentPage('home');
                setPrompt(''); // Clear the search box
                setError(null); // Clear any error messages
              }}
            />
          )}
          
          {currentPage === 'history' && (
            <HistoryView 
              history={history} 
              onItemClick={handleHistoryItemClick}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ 
  prompt, 
  setPrompt, 
  handleSubmit, 
  isLoading, 
  error 
}: { 
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Find Your Perfect Gear</h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Describe your skiing or snowboarding needs and get personalized recommendations 
          with detailed specs, price ranges, and honest pros/cons.
        </p>
      </div>

      {/* Prompt Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <label htmlFor="prompt" className="block text-white font-semibold mb-4 text-lg">
            What gear are you looking for?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I'm an intermediate skier looking for all-mountain skis for Colorado trips. I prefer stability and want something that handles both groomed runs and light powder. My budget is around $500-800..."
            className="w-full h-40 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white placeholder-slate-400 border border-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="mt-6 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-black font-bold rounded-lg px-8 py-4 text-lg transform hover:-translate-y-0.5 transition-all disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="inline h-5 w-5 mr-3 animate-spin" />
                Getting Recommendations...
              </>
            ) : (
              'Get My Recommendations'
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-2 text-red-200">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <Snowflake className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
          <p className="text-slate-300 text-sm">Advanced AI analyzes your needs and preferences</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Detailed Specs</h3>
          <p className="text-slate-300 text-sm">Key specifications and technical details</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <ExternalLink className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Price Ranges</h3>
          <p className="text-slate-300 text-sm">Realistic pricing to help with budgeting</p>
        </div>
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ 
  results, 
  onBack 
}: { 
  results: ApiResponse;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </button>

      {/* Results */}
      <ResultsDisplay results={results} />
    </div>
  );
}

// Results Display Component
function ResultsDisplay({ results }: { results: ApiResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Personalized Recommendations</h2>
        {results.prompt_text && (
          <p className="text-slate-300 italic">"{results.prompt_text}"</p>
        )}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
          <p className="text-blue-200 text-sm">
            💡 <strong>Note:</strong> Product names are clear and searchable. Each recommendation includes price ranges, key specs, and concise pros/cons for easy comparison. Use the search suggestions to find products at REI, Evo, Backcountry, or your local ski shop.
          </p>
        </div>
      </div>

      {results.categories.map((category, index) => (
        <CategorySection key={index} category={category} />
      ))}
    </div>
  );
}

// Category Section Component
function CategorySection({ category }: { category: Category }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Snowflake className="h-5 w-5 text-cyan-400" />
        {category.categoryTitle}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:bg-white/10 transition-all">
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-white text-lg leading-tight">{product.name}</h4>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm">{product.brand}</p>
            {product.priceRange && (
              <p className="text-green-400 text-sm font-semibold mt-1">{product.priceRange}</p>
            )}
          </div>
          <span className="bg-slate-700/50 text-slate-200 text-xs font-medium px-3 py-1 rounded-full border border-slate-600/50">
            {product.highlight}
          </span>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-3 font-medium">{product.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <h5 className="text-green-400 text-xs font-semibold mb-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Pros
          </h5>
          <ul className="text-slate-300 text-xs space-y-1">
            {product.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h5 className="text-red-400 text-xs font-semibold mb-1 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cons
          </h5>
          <ul className="text-slate-300 text-xs space-y-1">
            {product.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="space-y-2">
        {product.storeLink && product.storeLink.length > 0 ? (
          product.storeLink.map((link, index) => {
            const storeName = link.includes('rei.com') ? 'REI' : 
                             link.includes('evo.com') ? 'Evo' : 
                             link.includes('backcountry.com') ? 'Backcountry' : 'Store';
            
            return (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg px-3 py-2 text-xs transition-all hover:-translate-y-0.5 w-full justify-center"
              >
                {storeName}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          })
        ) : (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center">
            <p className="text-slate-300 text-sm">
              <strong>Search for:</strong> {product.name}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Try REI, Evo, Backcountry, or your local ski shop
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// History View Component
function HistoryView({ 
  history, 
  onItemClick, 
  isLoading 
}: { 
  history: HistoryItem[]; 
  onItemClick: (item: HistoryItem) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
        <p className="text-slate-400">Your recommendation history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Your Recommendation History</h2>
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 cursor-pointer hover:bg-white/15 transition-all"
        >
          <p className="text-white font-medium mb-2">{item.prompt_text}</p>
          <p className="text-slate-400 text-sm">
            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default App;