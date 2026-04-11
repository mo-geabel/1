'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target, Crosshair, Search, Loader2 } from 'lucide-react';

// Fix Leaflet marker icon issue in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSearch() {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await resp.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Map search error:', err);
    } finally {
      setSearching(false);
    }
  }

  const selectResult = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    onChange(newLat, newLng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  if (!mounted) return (
    <div className="w-full h-[280px] md:h-[450px] bg-card-bg/50 border border-border-color rounded-2xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <Target className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-20" />
        <span className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest px-8 text-center">Initializing Map...</span>
      </div>
    </div>
  );

  return (
    <div className="w-full h-[280px] md:h-[450px] relative rounded-[2rem] md:rounded-3xl overflow-hidden border border-border-color shadow-inner group">
      <MapContainer 
        center={[lat || 30.0444, lng || 31.2357]} // Default to Cairo as a fallback if not provided
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onChange={onChange} />
        <MapUpdater center={[lat || 30.0444, lng || 31.2357]} />
        {lat && lng && (
          <Marker position={[lat, lng]} draggable={true} eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onChange(position.lat, position.lng);
            }
          }} />
        )}
      </MapContainer>
      
      {/* Search Overlay */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 w-[calc(100%-1rem)] max-w-[240px] md:max-w-sm">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {searching ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search venue or city..."
            className="w-full pl-11 pr-4 py-3.5 md:py-3 bg-background/95 md:bg-background/80 backdrop-blur-3xl md:backdrop-blur-xl border border-border-color rounded-2xl text-xs font-bold text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-2xl"
          />
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-background/90 backdrop-blur-3xl border border-border-color rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full text-left px-4 py-3 text-[9px] md:text-xs font-bold text-gray-400 hover:text-foreground hover:bg-primary/10 transition-all border-b last:border-0 border-border-color uppercase tracking-tight leading-relaxed"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Instructions */}
      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3 md:px-4 py-2 bg-background/90 md:bg-background/80 backdrop-blur-md border border-border-color rounded-xl text-[8px] md:text-[10px] font-bold text-primary uppercase tracking-wider shadow-xl flex items-center gap-2">
          <Crosshair className="w-3 h-3" />
          Click or Drag marker to set location
        </div>
      </div>
      
      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(1) invert(1) brightness(0.9) contrast(1.1);
        }
        .dark .leaflet-container {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
