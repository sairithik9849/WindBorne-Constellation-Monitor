import { useState, useEffect, lazy, Suspense, useMemo, useRef } from 'react';
import { Loader2, ServerCrash, MapPin, Layers, Info, RefreshCw, Sparkles, Globe2, Database, InfoIcon } from 'lucide-react';
const MapComponent = lazy(() => import('./MapComponent'));
import AnalysisModal from './AnalysisModal';
import About from './About';

// --- Backend URL selection ---
// Prefer environment override (e.g. VITE_BACKEND_URL="http://localhost:3000/api/constellation")
// Fallback to relative path for Vercel serverless deployment.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api/constellation';

export default function App() {
  const [balloons, setBalloons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const mapSectionRef = useRef(null);

  // --- NEW MODAL STATE ---
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- END NEW STATE ---

  // --- Fetch Data Function ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(BACKEND_URL);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error: ${response.status} ${errText}`);
      }
      const result = await response.json();
      if (result.data && Array.isArray(result.data.balloons)) {
        setBalloons(result.data.balloons);
        setDataSource(result.source);
      } else {
        throw new Error('Data structure from backend is incorrect.');
      }
    } catch (err) {
      console.error("Failed to fetch constellation data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Force Refresh Handler ---
  const handleForceRefresh = async () => {
    setIsLoading(true);
    setError(null);
    // Derive refresh endpoints based on BACKEND_URL
    const refreshQueryEndpoint = BACKEND_URL.includes('?') ? `${BACKEND_URL}&refresh=1` : `${BACKEND_URL}?refresh=1`;
    const refreshPostEndpoint = BACKEND_URL.replace('constellation', 'constellation-refresh');
    try {
      // Try POST refresh endpoint first (serverless dedicated function)
      let response = await fetch(refreshPostEndpoint, { method: 'POST' });
      if (!response.ok) {
        // Fallback to GET with refresh query
        response = await fetch(refreshQueryEndpoint, { method: 'GET' });
      }
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error: ${response.status} ${errText}`);
      }
      // Re-fetch latest cached/live data
      await fetchData();
    } catch (err) {
      console.error('Failed to force refresh cache:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW HANDLERS ---
  const handleBalloonSelect = (balloon) => {
    setSelectedBalloon(balloon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBalloon(null);
  };
  // --- END NEW HANDLERS ---

  // --- Derived Stats ---
  const totalHistoryPoints = useMemo(() => balloons.reduce((acc, b) => acc + (b.history?.length || 0), 0), [balloons]);
  const avgAltitude = useMemo(() => {
    if (!balloons.length) return 0;
    const sum = balloons.reduce((acc, b) => acc + (b.current?.[2] || 0), 0);
    return sum / balloons.length;
  }, [balloons]);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  const openMap = () => {
    setShowMap(true);
    setTimeout(() => {
      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const StatCard = ({ title, value, icon, loading }) => (
    // ... (This component is 100% unchanged) ...
    <div className="bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white/80">{title}</h3>
        {icon}
      </div>
      {loading ? (
        <div className="h-8 w-1/2 bg-white/20 rounded animate-pulse"></div>
      ) : (
        <p className="text-3xl font-bold text-white">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );

  // If About page is shown, render it instead
  if (showAbout) {
    return (
      <div className="min-h-screen w-full bg-gray-900">
        <div className="p-4">
          <button
            onClick={toggleAbout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/20 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <About />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-3 bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-green-300">
          WindBorne Constellation Monitor
        </h1>
        <p className="text-lg text-white/70 mb-6 max-w-3xl mx-auto">
          Track thousands of live weather balloons worldwide, highlight their 24‑hour paths, and get instant AI journey insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={openMap}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-colors"
          >
            <Globe2 size={18} />
            Open Live Map
          </button>
          <button
            onClick={handleForceRefresh}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/20 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={18} />
            Force Refresh
          </button>
          <button
            onClick={toggleAbout}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/20 transition-colors"
          >
            <InfoIcon size={18} />
            About This Project
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl">
        
        {/* --- Stats Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Live Balloon Count"
            value={balloons.length}
            icon={<MapPin className="text-blue-300" size={24} />}
            loading={isLoading}
          />
          <StatCard
            title="Historical Points (24h)"
            value={totalHistoryPoints}
            icon={<Layers className="text-gray-300" size={24} />}
            loading={isLoading}
          />
          <StatCard
            title="Avg Altitude (km)"
            value={Number.isFinite(avgAltitude) ? Number(avgAltitude.toFixed(2)) : 0}
            icon={<Database className="text-green-300" size={24} />}
            loading={isLoading}
          />
        </div>
        <div className="w-full p-6 bg-white/10 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 mb-8">
          {isLoading && (
            <div className="flex items-center justify-center text-white/80">
              <Loader2 className="animate-spin mr-3" size={24} />
              <span className="text-lg">Fetching data from your backend...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center text-red-300">
              <ServerCrash className="mr-3" size={24} />
              <span className="text-lg font-medium">Error:</span>
              <span className="ml-2 text-red-200">{error}</span>
            </div>
          )}
          {!isLoading && !error && (
            <div className="flex items-center justify-center text-green-300">
              <span className="text-lg font-medium">Connection Successful.</span>
              <span className="ml-2 text-white/70">
                (Data source: {dataSource})
              </span>
            </div>
          )}
        </div>

        {/* --- Feature Highlights --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 p-6 rounded-lg border border-white/20">
            <div className="flex items-center mb-3 text-blue-300"><Sparkles className="mr-2" size={20}/>AI Journey Analysis</div>
            <p className="text-white/70">One‑click summaries of each balloon’s 24‑hour movement using Gemini, rendered with clean Markdown.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg border border-white/20">
            <div className="flex items-center mb-3 text-green-300"><Globe2 className="mr-2" size={20}/>Real‑time Constellation</div>
            <p className="text-white/70">Interactive map with path highlight and history trails for thousands of balloons worldwide.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg border border-white/20">
            <div className="flex items-center mb-3 text-gray-300"><Database className="mr-2" size={20}/>Serverless + Redis</div>
            <p className="text-white/70">Fast API backed by Redis cache and serverless functions; manual refresh available anytime.</p>
          </div>
        </section>
        
        {/* --- Map Section / Teaser --- */}
        <div ref={mapSectionRef} className="w-full h-[70vh] bg-gray-800 rounded-lg shadow-lg border border-white/20 overflow-hidden flex items-center justify-center">
          {/* ... (Loading and No Data logic is unchanged) ... */}
          {isLoading && (
            <div className="flex flex-col items-center text-white/70">
              <Loader2 className="animate-spin" size={48} />
              <span className="mt-4 text-lg">Loading Map & Data...</span>
            </div>
          )}
          {!isLoading && !error && balloons.length === 0 && (
            <div className="flex flex-col items-center text-yellow-300 p-8 text-center">
              <Info size={48} className="mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Live Data Available</h3>
              <p className="text-yellow-200/80">
                The server is running, but the WindBorne API (00.json) is 
                not providing live data right now. The app will refresh automatically.
              </p>
            </div>
          )}
          {/* Teaser when map is hidden */}
          {!isLoading && !error && balloons.length > 0 && !showMap && (
            <div className="flex flex-col items-center text-white/80 p-8 text-center">
              <Globe2 size={56} className="mb-4 text-blue-300" />
              <h3 className="text-2xl font-bold mb-2">Explore the Live Map</h3>
              <p className="text-white/60 mb-4 max-w-xl">Highlight any balloon’s 24‑hour path and open AI analysis on demand.</p>
              <button onClick={openMap} className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-colors">
                <Globe2 size={18}/> Open Live Map
              </button>
            </div>
          )}

          {/* Lazy-loaded Map */}
          {!isLoading && balloons.length > 0 && showMap && (
            <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-white/70"><Loader2 className="animate-spin mr-3"/>Loading Map…</div>}>
              <MapComponent 
                balloons={balloons}
                onBalloonSelect={handleBalloonSelect}
              />
            </Suspense>
          )}
        </div>
      </main>

      {/* --- RENDER THE MODAL --- */}
      {isModalOpen && selectedBalloon && (
        <AnalysisModal 
          balloon={selectedBalloon}
          onClose={handleCloseModal}
        />
      )}
      {/* --- END MODAL --- */}
    </div>
  );
}