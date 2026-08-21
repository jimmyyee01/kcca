import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Coins, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  Building2,
  Bike,
  Flame,
  Truck
} from 'lucide-react';
import { DivisionName, Pothole } from '../types';
import { KAMPALA_DIVISIONS } from '../data/kampalaData';

interface AnalyticsViewProps {
  potholes: Pothole[];
  onSelectDivision: (div: DivisionName) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  potholes,
  onSelectDivision
}) => {
  const total = potholes.length;
  const critical = potholes.filter(p => p.severity === 'critical').length;
  const severe = potholes.filter(p => p.severity === 'severe').length;
  const moderate = potholes.filter(p => p.severity === 'moderate').length;
  const minor = potholes.filter(p => p.severity === 'minor').length;
  const patched = potholes.filter(p => p.status === 'patched').length;
  const inRepair = potholes.filter(p => p.status === 'in_repair').length;
  const bodaHazards = potholes.filter(p => p.bodaHazardWarning).length;

  const totalAsphaltTons = potholes.reduce((acc, p) => acc + (p.aiAnalysis?.estimatedAsphaltTons || 0.8), 0);
  const totalCostUGX = potholes.reduce((acc, p) => acc + (p.aiAnalysis?.estimatedRepairCostUGX || 2000000), 0);
  const totalCostUSD = Math.round(totalCostUGX / 3700);

  // Group by Division
  const divisions: DivisionName[] = ['Central', 'Nakawa', 'Makindye', 'Kawempe', 'Rubaga'];
  const divisionStats = divisions.map(div => {
    const list = potholes.filter(p => p.division === div);
    const divCritical = list.filter(p => p.severity === 'critical').length;
    const divPatched = list.filter(p => p.status === 'patched').length;
    const divCostUGX = list.reduce((acc, p) => acc + (p.aiAnalysis?.estimatedRepairCostUGX || 0), 0);

    return {
      name: div,
      count: list.length,
      critical: divCritical,
      patched: divPatched,
      costUGX: divCostUGX,
      percentage: total > 0 ? Math.round((list.length / total) * 100) : 0
    };
  });

  // Top Most Affected Roads
  const roadCounts: Record<string, { count: number; critical: number }> = {};
  potholes.forEach(p => {
    if (!roadCounts[p.roadName]) {
      roadCounts[p.roadName] = { count: 0, critical: 0 };
    }
    roadCounts[p.roadName].count += 1;
    if (p.severity === 'critical') roadCounts[p.roadName].critical += 1;
  });

  const topRoads = Object.entries(roadCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Analytics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Kampala City Road Hazard Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Geospatial metrics, KCCA asphalt requirements & budgetary projections
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            Fiscal Year 2026-2027
          </span>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Plotted Traps</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{total}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-rose-400 font-bold">{critical} Critical</span> &bull; {severe} Severe
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Asphalt Needed</span>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {totalAsphaltTons.toFixed(1)} <span className="text-sm font-sans">Tons</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Wearing course AC 0/14mm Hot Mix
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Estimated Repair Budget</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {(totalCostUGX / 1000000).toFixed(1)}M <span className="text-sm font-sans">UGX</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Approx. ${totalCostUSD.toLocaleString()} USD
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Boda-Boda High Hazards</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">{bodaHazards}</div>
          <div className="text-[11px] text-slate-400">
            {Math.round((bodaHazards / (total || 1)) * 100)}% of total city potholes
          </div>
        </div>

      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Division Distribution Bars */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Division Pothole Density (Kampala)
            </h3>
            <span className="text-xs text-slate-400">Click a division to inspect</span>
          </div>

          <div className="space-y-3">
            {divisionStats.map((d) => (
              <div 
                key={d.name}
                onClick={() => onSelectDivision(d.name)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: KAMPALA_DIVISIONS[d.name].color }}
                    />
                    {KAMPALA_DIVISIONS[d.name].fullName}
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-rose-400 font-bold">{d.critical} Critical</span>
                    <span className="text-emerald-400">{d.patched} Patched</span>
                    <span className="text-slate-300 font-bold">{d.count} Total</span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: `${(d.count / (total || 1)) * 100}%`,
                      backgroundColor: KAMPALA_DIVISIONS[d.name].color 
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>HQ: {KAMPALA_DIVISIONS[d.name].hqLocation}</span>
                  <span className="font-mono text-amber-400">Budget: {(d.costUGX / 1000000).toFixed(1)}M UGX</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution & KCCA Fix Ratio */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Severity Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-300">Critical (&gt;15cm)</span>
                <span className="font-mono font-bold text-rose-400">{critical} ({Math.round((critical/total)*100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="font-bold text-orange-300">Severe (10-15cm)</span>
                <span className="font-mono font-bold text-orange-400">{severe} ({Math.round((severe/total)*100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-300">Moderate (5-10cm)</span>
                <span className="font-mono font-bold text-amber-400">{moderate} ({Math.round((moderate/total)*100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-300">Minor (&lt;5cm)</span>
                <span className="font-mono font-bold text-emerald-400">{minor} ({Math.round((minor/total)*100)}%)</span>
              </div>
            </div>
          </div>

          {/* KCCA Resolution Rate Meter */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">KCCA Patching Velocity</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.round((patched / (total || 1)) * 100)}% Resolved
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(patched / (total || 1)) * 100}%` }}
              />
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${(inRepair / (total || 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">● {patched} Patched</span>
              <span className="flex items-center gap-1 text-amber-400">● {inRepair} In Progress</span>
              <span className="flex items-center gap-1 text-slate-400">● {total - patched - inRepair} Pending</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top 6 Most Affected Arterial Roads Leaderboard */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" /> Kampala Arterial Roads Hazard Leaderboard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topRoads.map(([road, data], idx) => (
            <div key={road} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">#{idx + 1} {road}</span>
                <span className="font-mono text-amber-400 font-bold">{data.count} Potholes</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-rose-400 font-semibold">{data.critical} Critical Emergencies</span>
                <span className="text-[10px] text-slate-500">KCCA Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
