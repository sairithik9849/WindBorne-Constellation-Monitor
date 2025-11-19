import React, { useEffect, useRef, memo } from 'react';
import { Loader2 } from 'lucide-react';

// --- STYLING ---
const currentMarkerStyle = {
  color: '#3b82f6',
  fillColor: '#3b82f6',
  fillOpacity: 0.8,
  radius: 4,
  weight: 1,
};

const historyTrailStyle = {
  color: '#6b7280',
  fillColor: '#6b7280',
  fillOpacity: 0.1,
  radius: 2,
  weight: 0,
};

const historyPathStyle = {
  color: '#3b82f6', // Same blue as the marker
  weight: 2,
  opacity: 0.8,
};
// --- END STYLING ---


// --- HELPERS (Unchanged) ---
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const loadLink = (href) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

/**
 * This component renders the map and handles all user interaction with it.
 * It's driven by the 'balloons' prop from App.jsx.
 */
// *** FIX: Added onBalloonSelect to props ***
const MapComponent = ({ balloons, onBalloonSelect }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = React.useState(false);
  
  const historyPathLayer = useRef(null);

  // 1. Load Leaflet (Unchanged)
  useEffect(() => {
    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }
    loadLink('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')
      .then(() => loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'))
      .then(() => {
        setIsLeafletLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });
  }, []);

  // 2. Initialize the map (Unchanged)
  useEffect(() => {
    if (isLeafletLoaded && mapRef.current && !leafletMap.current) {
      const bounds = [[-90, -180], [90, 180]];
      const map = window.L.map(mapRef.current, {
        minZoom: 2,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
      }).setView([20, 0], 2);
      leafletMap.current = map;

      const canvasRenderer = window.L.canvas();
      leafletMap.current.canvasRenderer = canvasRenderer;

      window.L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap &copy; CARTO' }
      ).addTo(map);

      map.on('click', () => {
        if (historyPathLayer.current) {
          map.removeLayer(historyPathLayer.current);
          historyPathLayer.current = null;
        }
      });
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isLeafletLoaded]);

  // 3. Add/Update map data layers (This is the core logic)
  useEffect(() => {
    if (!leafletMap.current || !leafletMap.current.canvasRenderer) return;

    const map = leafletMap.current;
    const canvasRenderer = leafletMap.current.canvasRenderer;

    // Clear all old layers before drawing new ones
    if (leafletMap.current.dataLayers) {
      leafletMap.current.dataLayers.forEach(layer => map.removeLayer(layer));
    }
    if (historyPathLayer.current) {
      map.removeLayer(historyPathLayer.current);
      historyPathLayer.current = null; 
    }
    leafletMap.current.dataLayers = [];
    
    const historyLayer = window.L.layerGroup(); 
    const currentLayer = window.L.layerGroup();
    
    balloons.forEach((balloon) => {
      const currentPosition = [balloon.current[0], balloon.current[1]];
      const altitude = balloon.current[2];
      
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #3b82f6;">Balloon ID: ${balloon.id}</div>
          <div style="margin-bottom: 4px;"><strong>Latitude:</strong> ${currentPosition[0].toFixed(4)}°</div>
          <div style="margin-bottom: 4px;"><strong>Longitude:</strong> ${currentPosition[1].toFixed(4)}°</div>
          <div style="margin-bottom: 12px;"><strong>Altitude:</strong> ${altitude.toFixed(2)} km</div>
          <button 
            onclick="window.analyzeBallon${balloon.id}()" 
            style="
              width: 100%;
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            "
            onmouseover="this.style.background='#2563eb'"
            onmouseout="this.style.background='#3b82f6'"
          >
            ✨ Analyze with Gemini
          </button>
        </div>
      `;

      // --- 1. Add the "current" marker (blue dot) ---
      const marker = window.L.circleMarker(currentPosition, {
        ...currentMarkerStyle,
        renderer: canvasRenderer
      }).bindPopup(popupContent);

      // --- CLICK HANDLER to draw path ---
      marker.on('click', (e) => {
        // 1. Clear any previously drawn path
        if (historyPathLayer.current) {
          map.removeLayer(historyPathLayer.current);
        }
        
        // 2. Create the new path points
        const pathPoints = [
          [balloon.current[0], balloon.current[1]], // Current position
          ...balloon.history.map(p => [p[0], p[1]]) // All history positions
        ];

        // 3. Draw a single Polyline (bright blue)
        const polyline = window.L.polyline(pathPoints, historyPathStyle);
        
        // 4. Add to map and store the ref
        polyline.addTo(map);
        historyPathLayer.current = polyline;

        // 5. Zoom the map to fit the path
        map.fitBounds(polyline.getBounds().pad(0.1));

        // 6. Stop the click from propagating to the map
        window.L.DomEvent.stopPropagation(e);

        // 7. Create a global callback for the Gemini button
        window[`analyzeBallon${balloon.id}`] = () => {
          onBalloonSelect(balloon);
        };
      });
      // --- END CLICK HANDLER ---

      marker.addTo(currentLayer); // Add the blue dot to its layer

      // --- 2. Add ALL history trails (faint grey) ---
      balloon.history.forEach((histPoint) => {
        const histPosition = [histPoint[0], histPoint[1]];
        window.L.circleMarker(histPosition, {
          ...historyTrailStyle,
          renderer: canvasRenderer
        }).addTo(historyLayer);
      });
      // --- END HISTORY TRAILS ---
    });

    map.addLayer(historyLayer);
    map.addLayer(currentLayer);
    
    leafletMap.current.dataLayers.push(historyLayer);
    leafletMap.current.dataLayers.push(currentLayer);

  // *** FIX: Added onBalloonSelect to dependency array ***
  }, [balloons, isLeafletLoaded, onBalloonSelect]);

  
  // --- RENDER LOGIC (Unchanged) ---
  if (!isLeafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <Loader2 className="animate-spin text-white" size={48} />
        <span className="ml-4 text-white/70">Loading Map...</span>
      </div>
    );
  }

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default memo(MapComponent);