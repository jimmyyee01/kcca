import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Crosshair, 
  Flame, 
  Info, 
  Maximize2, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation,
  Compass,
  Building2,
  Bike
} from 'lucide-react';
import { DivisionName, Pothole, PotholeSeverity } from '../types';
import { KAMPALA_CENTER, KAMPALA_DEFAULT_ZOOM, KAMPALA_DIVISIONS, KAMPALA_LANDMARKS } from '../data/kampalaData';

interface KampalaMapProps {
  potholes: Pothole[];
  selectedPothole: Pothole | null;
  onSelectPothole: (pothole: Pothole) => void;
  onPlotLocationPicked: (lat: number, lng: number, detectedDivision: DivisionName) => void;
  selectedDivision: DivisionName | 'All';
  setSelectedDivision: (div: DivisionName | 'All') => void;
  selectedSeverity: PotholeSeverity | 'All';
  setSelectedSeverity: (sev: PotholeSeverity | 'All') => void;
  onUpvote: (id: string, e?: React.MouseEvent) => void;
}

type TileProvider = 'dark' | 'street' | 'satellite';

export const KampalaMap: React.FC<KampalaMapProps> = ({
  potholes,
  selectedPothole,
  onSelectPothole,
  onPlotLocationPicked,
  selectedDivision,
  setSelectedDivision,
  selectedSeverity,
  setSelectedSeverity,
  onUpvote
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const divisionBoundsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [tileType, setTileType] = useState<TileProvider>('dark');
  const [showDivisionBounds, setShowDivisionBounds] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isPlottingMode, setIsPlottingMode] = useState<boolean>(false);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // Helper to determine division from lat/lng in Kampala
  const getDivisionFromCoords = (lat: number, lng: number): DivisionName => {
    if (lat > 0.335) return 'Kawempe';
    if (lng > 0.605 || (lat > 0.315 && lng > 0.595)) return 'Nakawa';
    if (lat < 0.295) return 'Makindye';
    if (lng < 0.565) return 'Rubaga';
    return 'Central';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: KAMPALA_CENTER,
      zoom: KAMPALA_DEFAULT_ZOOM,
      zoomControl: false,
      minZoom: 11,
      maxZoom: 19
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default Dark Matter Tiles (high contrast for road hazards)
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = darkTile;

    // Setup Layer Groups
    const markersLayer = L.layerGroup().addTo(map);
    const boundsLayer = L.layerGroup().addTo(map);
    const heatLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    divisionBoundsLayerRef.current = boundsLayer;
    heatmapLayerRef.current = heatLayer;
    mapInstanceRef.current = map;

    // Click handler for plotting mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const division = getDivisionFromCoords(lat, lng);
      onPlotLocationPicked(lat, lng, division);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update Tile Layer when tileType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (tileType === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO &copy; OpenStreetMap';
    } else if (tileType === 'street') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else {
      // Satellite / Hybrid OpenTopoMap
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics';
    }

    const newTile = L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [tileType]);

  // Render Division Polygons / Boundary Boxes
  useEffect(() => {
    if (!divisionBoundsLayerRef.current) return;
    divisionBoundsLayerRef.current.clearLayers();

    if (!showDivisionBounds) return;

    Object.values(KAMPALA_DIVISIONS).forEach(div => {
      const bounds = L.latLngBounds(div.bounds[0], div.bounds[1]);

      const rect = L.rectangle(bounds, {
        color: div.color,
        weight: 1.5,
        fillColor: div.color,
        fillOpacity: selectedDivision === div.name ? 0.15 : 0.04,
        dashArray: '4, 6'
      });

      rect.bindTooltip(
        `<strong>${div.fullName}</strong><br/><span style="color:#94a3b8; font-size:11px;">HQ: ${div.hqLocation}</span>`,
        { permanent: false, direction: 'center', className: 'division-tooltip' }
      );

      rect.on('click', () => {
        setSelectedDivision(div.name);
      });

      divisionBoundsLayerRef.current?.addLayer(rect);
    });
  }, [showDivisionBounds, selectedDivision]);

  // Render Heatmap / Density Circles
  useEffect(() => {
    if (!heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    potholes.forEach(p => {
      const radius = p.severity === 'critical' ? 320 : p.severity === 'severe' ? 240 : 160;
      const color = p.severity === 'critical' ? '#f43f5e' : p.severity === 'severe' ? '#f97316' : '#eab308';

      const circle = L.circle([p.lat, p.lng], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 0
      });

      heatmapLayerRef.current?.addLayer(circle);
    });
  }, [showHeatmap, potholes]);

  // Render Pothole Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    const filtered = potholes.filter(p => {
      if (selectedDivision !== 'All' && p.division !== selectedDivision) return false;
      if (selectedSeverity !== 'All' && p.severity !== selectedSeverity) return false;
      return true;
    });

    filtered.forEach(p => {
      // Create Custom SVG Pin
      const isCritical = p.severity === 'critical';
      const isPatched = p.status === 'patched';
      const isInRepair = p.status === 'in_repair';

      let markerColor = '#f43f5e'; // red
      if (isPatched) markerColor = '#10b981'; // green
      else if (isInRepair) markerColor = '#f59e0b'; // amber
      else if (p.severity === 'severe') markerColor = '#f97316'; // orange
      else if (p.severity === 'moderate') markerColor = '#eab308'; // yellow
      else if (p.severity === 'minor') markerColor = '#06b6d4'; // cyan

      const isSelected = selectedPothole?.id === p.id;

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          ${isCritical && !isPatched ? `
            <span class="absolute w-10 h-10 rounded-full animate-pulse-ring" style="background-color: ${markerColor};"></span>
          ` : ''}
          <div class="relative flex items-center justify-center rounded-full shadow-2xl transition-transform duration-200 transform ${isSelected ? 'scale-125 ring-4 ring-amber-400' : 'group-hover:scale-115'}"
               style="width: 32px; height: 32px; background: #0f172a; border: 2.5px solid ${markerColor};">
            ${isPatched 
              ? `<span style="color: ${markerColor}; font-weight: 800; font-size: 14px;">✓</span>`
              : `<span class="font-mono text-[11px] font-extrabold" style="color: ${markerColor};">${p.depthCm}cm</span>`
            }
          </div>
          ${p.bodaHazardWarning ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center shadow" title="High Boda-Boda hazard">
              <span class="text-[9px] font-black text-slate-950">🏍</span>
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-pothole-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });

      // Create Custom Popup with Rich Details
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 max-w-[280px] bg-slate-900 text-slate-100 rounded-xl text-xs';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                style="background: ${markerColor}25; color: ${markerColor}; border: 1px solid ${markerColor}40;">
            ${p.severity.toUpperCase()} &bull; ${p.depthCm}cm DEPTH
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${p.division}</span>
        </div>
        
        <h4 class="font-bold text-sm text-white mb-1 leading-snug">${p.roadName}</h4>
        ${p.landmark ? `<p class="text-[11px] text-amber-300/90 mb-2">📍 ${p.landmark}</p>` : ''}
        
        <p class="text-slate-300 text-[11px] mb-3 line-clamp-2 leading-relaxed">${p.description}</p>
        
        <div class="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 mb-3 text-[10px]">
          <div>
            <span class="text-slate-400 block">Diameter:</span>
            <strong class="text-slate-200 font-mono">${p.diameterCm} cm</strong>
          </div>
          <div>
            <span class="text-slate-400 block">Est. Repair:</span>
            <strong class="text-amber-400 font-mono">${(p.aiAnalysis?.estimatedRepairCostUGX || 0).toLocaleString()} UGX</strong>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <button id="popup-upvote-${p.id}" class="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition">
            👍 <span>${p.upvotes}</span>
          </button>
          <button id="popup-view-${p.id}" class="flex-1 py-1 px-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] text-center transition">
            View Assessment
          </button>
        </div>
      `;

      // Attach DOM Event Listeners after popup opens
      marker.on('popupopen', () => {
        const upvoteBtn = document.getElementById(`popup-upvote-${p.id}`);
        const viewBtn = document.getElementById(`popup-view-${p.id}`);

        if (upvoteBtn) {
          upvoteBtn.onclick = (e) => {
            e.stopPropagation();
            onUpvote(p.id);
            const span = upvoteBtn.querySelector('span');
            if (span) span.innerText = String(p.upvotes + 1);
          };
        }

        if (viewBtn) {
          viewBtn.onclick = (e) => {
            e.stopPropagation();
            onSelectPothole(p);
          };
        }
      });

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectPothole(p);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [potholes, selectedDivision, selectedSeverity, selectedPothole]);

  // Center on Selected Pothole if any
  useEffect(() => {
    if (selectedPothole && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPothole.lat, selectedPothole.lng], 16, {
        duration: 1.2
      });
    }
  }, [selectedPothole]);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16);
          // Show marker at user location
          const userMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#38bdf8',
            fillColor: '#0284c7',
            fillOpacity: 0.9,
            weight: 3
          }).addTo(mapInstanceRef.current);
          userMarker.bindTooltip('Your Location in Kampala', { permanent: true, direction: 'top' });
        }
      },
      (err) => {
        // Fallback to Kampala Center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(KAMPALA_CENTER, 14);
        }
      }
    );
  };

  const jumpToLandmark = (landmark: typeof KAMPALA_LANDMARKS[0]) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([landmark.lat, landmark.lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Side: Filter Chips & Division Selector */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Division Selector */}
          <div className="flex items-center gap-1 pl-2 pr-1 border-r border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="filter-map-division"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-2"
            >
              <option value="All" className="bg-slate-900 text-white">All 5 Divisions</option>
              <option value="Central" className="bg-slate-900 text-amber-400">Central (CBD)</option>
              <option value="Nakawa" className="bg-slate-900 text-blue-400">Nakawa</option>
              <option value="Kawempe" className="bg-slate-900 text-pink-400">Kawempe</option>
              <option value="Makindye" className="bg-slate-900 text-emerald-400">Makindye</option>
              <option value="Rubaga" className="bg-slate-900 text-purple-400">Rubaga</option>
            </select>
          </div>

          {/* Severity Quick Filters */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? 'All' : 'critical')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                selectedSeverity === 'critical'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Critical ({potholes.filter(p => p.severity === 'critical').length})
            </button>

            <button
              onClick={() => setSelectedSeverity(selectedSeverity === 'severe' ? 'All' : 'severe')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                selectedSeverity === 'severe'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Severe ({potholes.filter(p => p.severity === 'severe').length})
            </button>
          </div>
        </div>

        {/* Right Side: Map Layer Controls & Plot Mode */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Plotting Mode Banner / Toggle */}
          <button
            id="toggle-plotting-mode"
            onClick={() => setIsPlottingMode(!isPlottingMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
              isPlottingMode
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isPlottingMode ? 'Click Map to Plot!' : 'Drop Pin on Map'}</span>
          </button>

          {/* Heatmap Overlay Toggle */}
          <button
            id="toggle-heatmap"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-xl text-xs font-semibold transition ${
              showHeatmap ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Hazard Density Glow"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* Division Boundaries Toggle */}
          <button
            id="toggle-divisions"
            onClick={() => setShowDivisionBounds(!showDivisionBounds)}
            className={`p-2 rounded-xl text-xs font-semibold transition ${
              showDivisionBounds ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Kampala Division Borders"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Tile Type Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setTileType('dark')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                tileType === 'dark' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileType('street')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                tileType === 'street' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setTileType('satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                tileType === 'satellite' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sat
            </button>
          </div>

          {/* Locate Me */}
          <button
            id="btn-locate-me"
            onClick={handleLocateMe}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Locate my position in Kampala"
          >
            <Compass className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Plot Mode Active Helper Banner */}
      {isPlottingMode && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-rose-600/95 text-white px-4 py-2 rounded-full shadow-2xl border border-rose-400/60 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Crosshair className="w-4 h-4" />
          <span>Click anywhere on the Kampala map to record a pothole coordinate!</span>
          <button 
            onClick={() => setIsPlottingMode(false)}
            className="ml-2 text-rose-200 hover:text-white underline text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Horizontal Landmark Quick Jump Bar */}
      <div className="absolute bottom-4 left-4 right-16 z-[1000] flex items-center gap-2 overflow-x-auto pb-1 pointer-events-none scrollbar-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-2xl text-xs whitespace-nowrap">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
            📍 Jump To:
          </span>
          {KAMPALA_LANDMARKS.slice(0, 7).map((lm, idx) => (
            <button
              key={idx}
              onClick={() => jumpToLandmark(lm)}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition"
            >
              {lm.name.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* The Leaflet Map DOM Element */}
      <div 
        id="kampala-leaflet-map"
        ref={mapContainerRef} 
        className={`w-full h-full ${isPlottingMode ? 'cursor-crosshair' : ''}`}
      />
    </div>
  );
};
