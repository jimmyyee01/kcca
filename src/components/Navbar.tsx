import React from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Plus, 
  BarChart3, 
  Navigation, 
  ShieldAlert, 
  ListFilter,
  Layers,
  PhoneCall,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CloudOff
} from 'lucide-react';
import { ActiveTab, Pothole } from '../types';
import { useOffline } from '../context/OfflineContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  potholes: Pothole[];
  onOpenReportModal: () => void;
  onOpenOfflineDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  potholes,
  onOpenReportModal,
  onOpenOfflineDrawer,
}) => {
  const { 
    isEffectiveOnline, 
    isSimulatedOffline, 
    pendingCount, 
    isSyncing, 
    triggerSync, 
    toggleSimulatedOffline 
  } = useOffline();

  const totalPotholes = potholes.length;
  const criticalCount = potholes.filter(p => p.severity === 'critical' && p.status !== 'patched').length;
  const inRepairCount = potholes.filter(p => p.status === 'in_repair').length;
  const patchedCount = potholes.filter(p => p.status === 'patched').length;
  const offlinePendingCount = potholes.filter(p => p.syncStatus === 'pending_sync').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner with Kampala City Crest indicator & Offline/Online Status Pill */}
      <div className="bg-gradient-to-r from-amber-600/20 via-slate-900 to-amber-950/30 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            KCCA INITIATIVE
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-300 font-medium truncate">
            Kampala Capital City Authority &bull; Citizen Pothole Plotter & Rapid Response
          </span>
        </div>

        {/* Real-time Connectivity & Sync Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection Mode Pill */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenOfflineDrawer}
              title={isEffectiveOnline ? 'Online: Connected to city network' : 'Offline: Saving reports to device storage'}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                isEffectiveOnline
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              {isEffectiveOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="font-mono">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="font-mono">OFFLINE MODE</span>
                </>
              )}
            </button>

            {/* Simulated Offline Toggle */}
            <button
              onClick={toggleSimulatedOffline}
              className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                isSimulatedOffline 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle simulated network drop to test offline recording and auto-sync"
            >
              {isSimulatedOffline ? 'Simulating Offline' : 'Test Offline'}
            </button>
          </div>

          {/* Pending Sync Outbox Badge */}
          {pendingCount > 0 && (
            <button
              onClick={onOpenOfflineDrawer}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition animate-pulse"
              title="Click to view pending outbox queue and trigger manual sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} Pending Sync</span>
            </button>
          )}

          <span className="hidden lg:inline text-slate-600">&bull;</span>
          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>Toll-Free: <strong>0800 990 000</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & City Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/25 border border-amber-400/40">
              <MapPin className="w-5 h-5 text-slate-950 font-black" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Kampala<span className="text-amber-400">Pothole</span>
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700 rounded">
                  Plotter
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Geospatial Road Watch &bull; Offline-Ready
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar on Desktop */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-800">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Plotted:</span>
              <span className="font-bold text-white font-mono">{totalPotholes}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400">Critical:</span>
              <span className="font-bold text-rose-400 font-mono">{criticalCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-800">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">In Repair:</span>
              <span className="font-bold text-amber-300 font-mono">{inRepairCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Patched:</span>
              <span className="font-bold text-emerald-400 font-mono">{patchedCount}</span>
            </div>
          </div>

          {/* Action CTAs & View Tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switchers */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="nav-tab-map"
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'map'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Interactive Kampala Map"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>

              <button
                id="nav-tab-list"
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'list'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Pothole Register"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register</span>
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="City Analytics & Division Breakdown"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Analytics</span>
              </button>

              <button
                id="nav-tab-route-planner"
                onClick={() => setActiveTab('route_planner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'route_planner'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Safe Route Navigator"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Avoid Traps</span>
              </button>

              <button
                id="nav-tab-kcca"
                onClick={() => setActiveTab('kcca_dispatch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'kcca_dispatch'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="KCCA Public Works Dispatch"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">KCCA Dispatch</span>
              </button>

              {/* Offline Outbox Hub Button */}
              <button
                id="nav-tab-offline-outbox"
                onClick={onOpenOfflineDrawer}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pendingCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Offline Outbox & Device Storage"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Outbox</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Primary Action Button: Plot / Report Pothole */}
            <button
              id="btn-report-pothole"
              onClick={onOpenReportModal}
              className="relative group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 border border-amber-300/30 transition-all transform active:scale-95"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="whitespace-nowrap">Plot Pothole</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
