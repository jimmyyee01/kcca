import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  Download, 
  ThumbsUp, 
  ExternalLink, 
  Bike, 
  Building2, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle,
  Layers,
  Sparkles,
  WifiOff,
  CloudOff
} from 'lucide-react';
import { DivisionName, Pothole, PotholeSeverity, PotholeStatus } from '../types';

interface PotholeListProps {
  potholes: Pothole[];
  onSelectPothole: (pothole: Pothole) => void;
  onUpvote: (id: string, e?: React.MouseEvent) => void;
  onOpenMapToPothole: (pothole: Pothole) => void;
}

export const PotholeList: React.FC<PotholeListProps> = ({
  potholes,
  onSelectPothole,
  onUpvote,
  onOpenMapToPothole
}) => {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<DivisionName | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<PotholeSeverity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<PotholeStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'severity' | 'upvotes' | 'depth'>('severity');

  // Filter Logic
  const filtered = potholes.filter((p) => {
    if (divisionFilter !== 'All' && p.division !== divisionFilter) return false;
    if (severityFilter !== 'All' && p.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchRoad = p.roadName.toLowerCase().includes(q);
      const matchLandmark = p.landmark?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchTitle && !matchRoad && !matchLandmark && !matchId) return false;
    }

    return true;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'severity') {
      const rank = { critical: 4, severe: 3, moderate: 2, minor: 1 };
      return rank[b.severity] - rank[a.severity];
    }
    if (sortBy === 'depth') {
      return b.depthCm - a.depthCm;
    }
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    // Newest
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Road Name', 'Landmark', 'Division', 'Latitude', 'Longitude', 'Severity', 'Depth (cm)', 'Diameter (cm)', 'Status', 'Upvotes', 'Est Repair UGX'];
    const rows = sorted.map(p => [
      p.id,
      `"${p.roadName}"`,
      `"${p.landmark || ''}"`,
      p.division,
      p.lat,
      p.lng,
      p.severity,
      p.depthCm,
      p.diameterCm,
      p.status,
      p.upvotes,
      p.aiAnalysis?.estimatedRepairCostUGX || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kampala_potholes_register_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: PotholeSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'severe':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: PotholeStatus) => {
    switch (status) {
      case 'patched':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'in_repair':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'verified':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Kampala Pothole Register
          </h1>
          <p className="text-xs text-slate-400">
            Official road inventory, damage inspection records & KCCA repair pipeline
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export CSV for Works Engineers</span>
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search road, landmark, or ID (e.g. Jinja Road, Nakawa)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Divisions</option>
              <option value="Central">Central (CBD)</option>
              <option value="Nakawa">Nakawa</option>
              <option value="Kawempe">Kawempe</option>
              <option value="Makindye">Makindye</option>
              <option value="Rubaga">Rubaga</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="critical">Critical (&gt;15cm)</option>
              <option value="severe">Severe (10-15cm)</option>
              <option value="moderate">Moderate (5-10cm)</option>
              <option value="minor">Minor (&lt;5cm)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="severity">Sort: Highest Severity</option>
              <option value="depth">Sort: Deepest (cm)</option>
              <option value="upvotes">Sort: Most Upvoted</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Showing <strong className="text-amber-400 font-mono">{sorted.length}</strong> of {potholes.length} plotted hazards</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>{potholes.filter(p => p.severity === 'critical' && p.status !== 'patched').length} Active Critical Hazards</span>
          </div>
        </div>
      </div>

      {/* Grid of Pothole Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((pothole) => (
          <div
            key={pothole.id}
            id={`pothole-card-${pothole.id}`}
            onClick={() => onSelectPothole(pothole)}
            className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Thumbnail Image */}
              <div className="relative w-full h-40 overflow-hidden bg-slate-950">
                {pothole.imageUrl ? (
                  <img
                    src={pothole.imageUrl}
                    alt={pothole.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600 text-xs font-mono">
                    [No Photo Provided]
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border backdrop-blur-md ${getSeverityBadge(pothole.severity)}`}>
                      {pothole.severity}
                    </span>
                    {pothole.syncStatus === 'pending_sync' && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border backdrop-blur-md bg-amber-500/30 text-amber-200 border-amber-500/50 flex items-center gap-0.5">
                        <WifiOff className="w-2.5 h-2.5" /> Offline
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border backdrop-blur-md ${getStatusBadge(pothole.status)}`}>
                    {pothole.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Boda Warning Chip */}
                {pothole.bodaHazardWarning && (
                  <div className="absolute bottom-2 left-2.5 bg-amber-500/90 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Bike className="w-3 h-3" /> Boda Hazard
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono font-bold text-amber-400">{pothole.id}</span>
                  <span className="font-semibold text-slate-300">{pothole.division} Division</span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition leading-snug line-clamp-2">
                  {pothole.title}
                </h3>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{pothole.roadName} {pothole.landmark ? `(${pothole.landmark})` : ''}</span>
                </p>

                {/* Dimensions pill */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Depth:</span>
                    <strong className="text-amber-400 font-mono font-bold">{pothole.depthCm} cm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Repair:</span>
                    <strong className="text-emerald-400 font-mono font-bold text-[10px]">
                      {(pothole.aiAnalysis?.estimatedRepairCostUGX || 0).toLocaleString()} UGX
                    </strong>
                  </div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {pothole.description}
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(pothole.id, e);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                <span>{pothole.upvotes}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMapToPothole(pothole);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="View on Kampala Map"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                </button>
                <button
                  onClick={() => onSelectPothole(pothole)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
