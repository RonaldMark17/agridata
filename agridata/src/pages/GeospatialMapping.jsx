import React, { useState, useEffect, memo, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mappingAPI } from '../services/api';
import { 
  MapPinned, Users, Sprout, Loader2, Maximize, 
  Layers, Search, Navigation, Globe, Sun, Moon 
} from 'lucide-react';

// Fix Vite default icon issue for the User Location Pin
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- HELPER: Dynamic Crop Color Coding ---
const getCropColor = (cropName) => {
  const name = (cropName || '').toLowerCase();
  
  if (name.includes('rice') || name.includes('palay')) return { fill: '#eab308', stroke: '#ca8a04' }; // Yellow
  if (name.includes('coconut')) return { fill: '#10b981', stroke: '#047857' }; // Emerald
  if (name.includes('corn')) return { fill: '#f59e0b', stroke: '#d97706' }; // Amber
  if (name.includes('coffee') || name.includes('cacao')) return { fill: '#8b5cf6', stroke: '#1d4ed8' }; // Blue
  if (name.includes('livestock') || name.includes('poultry') || name.includes('chicken') || name.includes('cattle')) return { fill: '#f43f5e', stroke: '#be123c' }; // Rose
  if (name.includes('mixed')) return { fill: '#94a3b8', stroke: '#475569' }; // Slate
  
  const fallbackColors = [
    { fill: '#06b6d4', stroke: '#0891b2' }, // Cyan
    { fill: '#ec4899', stroke: '#db2777' }, // Pink
    { fill: '#84cc16', stroke: '#65a30d' }, // Lime
    { fill: '#a855f7', stroke: '#9333ea' }, // Purple
    { fill: '#f97316', stroke: '#ea580c' }, // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return fallbackColors[hash % fallbackColors.length];
};

// --- COMPONENT: Map Controller for Fly-To Animation ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
}

// --- COMPONENT: Memoized Markers to prevent Context crashes ---
const MapMarkers = memo(({ data }) => {
  return (
    <>
      {data.map((point) => {
        const colors = getCropColor(point.top_product);
        return (
          <CircleMarker
            key={`marker-${point.id}`}
            center={[point.lat, point.lng]}
            radius={Math.max(12, Math.min((point.farmer_count || 1) * 2.5, 45))}
            fillColor={colors.fill}
            color={colors.stroke}
            weight={2}
            fillOpacity={0.7}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
              <span className="font-black uppercase text-[10px] tracking-widest">{point.name}</span>
            </Tooltip>
            
            <Popup className="custom-popup">
              <div className="p-4 space-y-4 font-sans bg-white dark:bg-[#041d18] rounded-2xl w-56 shadow-2xl border border-slate-100 dark:border-white/10">
                <div className="border-b border-slate-100 dark:border-white/10 pb-3">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate">{point.name}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Territory Sector</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg"><Users size={14}/></div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{point.farmer_count || 0}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Active Farmers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3" style={{ color: colors.fill }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.fill}20` }}>
                      <Sprout size={14}/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase truncate text-slate-900 dark:text-white">{point.top_product || 'Mixed Crops'}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Primary Yield</p>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
});

export default function GeospatialMapping() {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Global Theme Detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mapTheme, setMapTheme] = useState('light'); // 'light' | 'dark' | 'satellite'
  
  const [mapCenter, setMapCenter] = useState([14.0673, 121.3242]); 
  const [mapZoom, setMapZoom] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Define Map Tiles (Added Light Theme)
  const mapTiles = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Sync Map Theme with Global App Theme
  useEffect(() => {
    const checkTheme = () => {
      const darkGlobal = document.documentElement.classList.contains('dark');
      setIsDarkMode(darkGlobal);
      // Auto-update map theme unless the user explicitly locked it to satellite
      setMapTheme(prev => prev === 'satellite' ? 'satellite' : (darkGlobal ? 'dark' : 'light'));
    };
    checkTheme(); // Initial check
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    let isSubscribed = true;

    const fetchMapData = async () => {
      try {
        const response = await mappingAPI.getDemographics();
        if (isSubscribed) {
          const data = Array.isArray(response.data) ? response.data : [];
          setMapData(data);
          setTotalFarmers(data.reduce((sum, point) => sum + (point.farmer_count || 0), 0));
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchMapData();
    return () => { isSubscribed = false; };
  }, []);

  const dynamicLegend = useMemo(() => {
    const uniqueProducts = new Set();
    mapData.forEach(point => {
      if (point.top_product) uniqueProducts.add(point.top_product);
    });

    return Array.from(uniqueProducts)
      .sort() 
      .map(productName => ({
        label: productName,
        color: getCropColor(productName).fill
      }));
  }, [mapData]);

  const handleSearchSelect = (e) => {
    const selectedId = e.target.value;
    setSearchQuery(selectedId);
    if (!selectedId) return;

    const target = mapData.find(b => b.id.toString() === selectedId);
    if (target && target.lat && target.lng) {
      setMapCenter([target.lat, target.lng]);
      setMapZoom(16); 
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
      },
      () => {
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibrating Satellites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white shadow-lg">
              <MapPinned size={16} />
            </div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Geospatial Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Demographic Map</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Live territorial distribution and crop analysis of agricultural sectors.</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white dark:bg-[#0b241f] border border-slate-100 dark:border-white/5 rounded-[1.5rem] px-6 py-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users size={20}/>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmers Mapped</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalFarmers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative h-[75vh] w-full rounded-[3rem] overflow-hidden border-8 border-white dark:border-[#0b241f] shadow-2xl z-0 group bg-slate-100 dark:bg-[#020c0a]">
        
        {/* OVERLAY: Top-Right Control Panel */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
           <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-white/20 flex flex-col gap-1">
             

             {/* FIX: Toggle Satellite Logic */}
             <button 
                onClick={() => setMapTheme(prev => prev === 'satellite' ? (isDarkMode ? 'dark' : 'light') : 'satellite')} 
                className={`p-2.5 rounded-xl transition-all ${mapTheme === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`} 
                title={mapTheme === 'satellite' ? "Return to Base Map" : "Toggle Satellite View"}
             >
               <Globe size={18} />
             </button>
           </div>

           <button onClick={handleLocateMe} className="bg-white/90 dark:bg-black/60 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-white/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex justify-center" title="Find My Location">
             <Navigation size={18} />
           </button>
        </div>

        {/* OVERLAY: Top-Left Search Bar */}
        <div className="absolute top-6 left-6 z-[1000] w-72">
          <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-white/20 flex items-center px-4 py-3 overflow-hidden">
            <Search size={16} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
            <select 
              value={searchQuery}
              onChange={handleSearchSelect}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 w-full cursor-pointer appearance-none"
            >
              <option value="">Fly to Barangay...</option>
              {mapData.sort((a,b) => a.name.localeCompare(b.name)).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* OVERLAY: Bottom-Left DYNAMIC Crop Legend */}
        {dynamicLegend.length > 0 && (
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 dark:bg-black/70 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-slate-200 dark:border-white/20 w-48 max-h-[40vh] overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4 border-b border-slate-200 dark:border-white/10 pb-2">Active Database Crops</h4>
            <div className="space-y-3">
              {dynamicLegend.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THE MAP */}
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: 'transparent' }}
        >
          <TileLayer
            key={mapTheme} // Re-renders specifically just the tiles when theme changes
            url={mapTiles[mapTheme]}
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />

          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
               <Popup className="font-sans font-bold">You are here</Popup>
            </Marker>
          )}

          <MapMarkers data={mapData} />
        </MapContainer>
      </div>

      {/* CSS overrides strictly synced to isDarkMode */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { background: ${isDarkMode ? '#041d18' : '#ffffff'} !important; }
        .custom-tooltip { 
          background-color: ${isDarkMode ? '#041d18' : '#ffffff'} !important; 
          color: ${isDarkMode ? 'white' : '#0f172a'} !important; 
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important; 
          border-radius: 8px; padding: 4px 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); 
        }
        .leaflet-tooltip-top:before { border-top-color: ${isDarkMode ? '#041d18' : '#ffffff'} !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
      `}} />
    </div>
  );
}