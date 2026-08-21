import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Bike, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  RotateCcw,
  Layers
} from 'lucide-react';
import { Pothole } from '../types';
import { KAMPALA_LANDMARKS } from '../data/kampalaData';

interface RouteHazardPlannerProps {
  potholes: Pothole[];
  onSelectPothole: (pothole: Pothole) => void;
  onOpenMapToPothole: (pothole: Pothole) => void;
}

export const RouteHazardPlanner: React.FC<RouteHazardPlannerProps> = ({
  potholes,
  onSelectPothole,
  onOpenMapToPothole
}) => {
  const [startPoint, setStartPoint] = useState(KAMPALA_LANDMARKS[1].name); // Nakawa Market
  const [endPoint, setEndPoint] = useState(KAMPALA_LANDMARKS[0].name); // KCCA City Hall / CBD
  const [vehicleType, setVehicleType] = useState<'car' | 'boda' | 'truck'>('car');
  const [calculated, setCalculated] = useState(false);

  const startLandmark = KAMPALA_LANDMARKS.find(l => l.name === startPoint) || KAMPALA_LANDMARKS[0];
  const endLandmark = KAMPALA_LANDMARKS.find(l => l.name === endPoint) || KAMPALA_LANDMARKS[1];

  // Helper to find potholes within the bounding corridor between Start & End
  const minLat = Math.min(startLandmark.lat, endLandmark.lat) - 0.015;
  const maxLat = Math.max(startLandmark.lat, endLandmark.lat) + 0.015;
  const minLng = Math.min(startLandmark.lng, endLandmark.lng) - 0.015;
  const maxLng = Math.max(startLandmark.lng, endLandmark.lng) + 0.015;

  const corridorHazards = potholes.filter(p => 
    p.lat >= minLat && p.lat <= maxLat && p.lng >= minLng && p.lng <= maxLng
  );

  const criticalOnRoute = corridorHazards.filter(p => p.severity === 'critical' && p.status !== 'patched');
  const totalOnRoute = corridorHazards.length;

  const routeSafetyScore = Math.max(15, 100 - (criticalOnRoute.length * 20 + totalOnRoute * 8));

  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-amber-400" /> Kampala Safe Corridor Navigator
        </h1>
        <p className="text-xs text-slate-400">
          Plan trips across Kampala and scan your travel path for tire-bursting craters and boda-boda rollover traps.
        </p>
      </div>

      {/* Planner Controls Box */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Starting Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Origin (Start Point)
            </label>
            <select
              value={startPoint}
              onChange={(e) => {
                setStartPoint(e.target.value);
                setCalculated(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              {KAMPALA_LANDMARKS.map(l => (
                <option key={l.name} value={l.name}>{l.name} ({l.division})</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Destination
            </label>
            <select
              value={endPoint}
              onChange={(e) => {
                setEndPoint(e.target.value);
                setCalculated(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              {KAMPALA_LANDMARKS.map(l => (
                <option key={l.name} value={l.name}>{l.name} ({l.division})</option>
              ))}
            </select>
          </div>

          {/* Vehicle Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Vehicle Profile
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVehicleType('car')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  vehicleType === 'car' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🚗 Saloon / SUV
              </button>
              <button
                onClick={() => setVehicleType('boda')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  vehicleType === 'boda' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🏍 Boda-Boda
              </button>
              <button
                onClick={() => setVehicleType('truck')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  vehicleType === 'truck' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🚚 Matatu / Truck
              </button>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            Real-time geospatial query across verified Kampala hazard database
          </span>
          <button
            onClick={handleCalculate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan Route Hazards</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {calculated && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Safety Score Card */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Corridor Hazard Safety Index
            </h3>

            <div className="text-center py-4 space-y-2">
              <div className={`text-5xl font-extrabold font-mono ${
                routeSafetyScore > 75 ? 'text-emerald-400' : routeSafetyScore > 45 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {routeSafetyScore}<span className="text-lg font-sans">/100</span>
              </div>
              <div className="text-xs font-bold text-slate-300">
                {routeSafetyScore > 75 ? 'Moderate Route Risk' : routeSafetyScore > 45 ? 'Caution: Severe Pothole Corridor' : 'Extreme Danger: Suspension & Rim Damage'}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Hazards on Corridor:</span>
                <strong className="text-white font-mono">{totalOnRoute}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-300">Critical Life/Axle Hazards:</span>
                <strong className="text-rose-400 font-mono font-bold">{criticalOnRoute.length}</strong>
              </div>
            </div>

            {vehicleType === 'boda' && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <strong className="flex items-center gap-1">
                  <Bike className="w-4 h-4 inline" /> Boda Rider Advisory:
                </strong>
                <p className="text-[11px] text-slate-300">
                  Avoid riding on road shoulders along this corridor during rain. Submerged water puddles conceal sharp 16cm drops.
                </p>
              </div>
            )}
          </div>

          {/* List of Road Hazards Along Route */}
          <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Detected Potholes Along Selected Corridor ({corridorHazards.length})
              </h3>
              <span className="text-xs text-slate-400">Click hazard to inspect details</span>
            </div>

            {corridorHazards.length > 0 ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {corridorHazards.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPothole(p)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {p.severity} &bull; {p.depthCm}cm
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{p.id}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs">{p.roadName}</h4>
                      <p className="text-slate-400 text-[11px] truncate">{p.landmark || p.description}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMapToPothole(p);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs shrink-0 flex items-center gap-1 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Map Pin</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Clear Corridor Detected</h4>
                <p className="text-xs text-slate-400">No major critical potholes recorded along this specific section.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
