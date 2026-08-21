import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileText, 
  Database, 
  Layers, 
  ArrowUpRight, 
  ShieldAlert, 
  MapPin, 
  X,
  Sparkles,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { Pothole } from '../types';

interface OfflineSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPothole?: (pothole: Pothole) => void;
  onResumeDraft?: (draftId: string) => void;
}

export const OfflineSyncDrawer: React.FC<OfflineSyncDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPothole,
  onResumeDraft
}) => {
  const {
    isOnline,
    isSimulatedOffline,
    isEffectiveOnline,
    isSyncing,
    queue,
    drafts,
    lastSyncTime,
    pendingCount,
    toggleSimulatedOffline,
    triggerSync,
    retryItem,
    removeItemFromQueue,
    deleteReportDraft
  } = useOffline();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div 
        id="offline-sync-drawer"
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isEffectiveOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isEffectiveOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Offline Hub & Outbox Queue
              </h2>
              <p className="text-xs text-slate-400">
                IndexedDB persistence & Background Sync Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close offline hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Control Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isEffectiveOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <span className="text-xs font-semibold text-slate-200">
                {isEffectiveOnline 
                  ? 'Connected to Kampala City Network' 
                  : isSimulatedOffline 
                  ? 'Simulated Offline Mode Active' 
                  : 'Disconnected (Spotty/No Network)'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {lastSyncTime ? `Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Not synced yet'}
            </span>
          </div>

          {/* Offline Mode Switch & Sync Action Bar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="btn-toggle-offline-simulation"
              onClick={toggleSimulatedOffline}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              {isSimulatedOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isSimulatedOffline ? 'Disable Simulation' : 'Test Offline Mode'}</span>
            </button>

            <button
              id="btn-trigger-manual-sync"
              onClick={() => triggerSync()}
              disabled={isSyncing || !isEffectiveOnline || pendingCount === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                !isEffectiveOnline || pendingCount === 0
                  ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync Queue (${pendingCount})`}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Section 1: Queued Reports (Outbox) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Pending Outbox Queue ({queue.length})
              </h3>
              {queue.length > 0 && (
                <span className="text-[11px] text-amber-400/90 font-medium">
                  Auto-syncs on reconnect
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">Outbox is clear</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All citizen reports and updates have been successfully uploaded.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {queue.map((item) => {
                  const p = item.pothole;
                  const isFailed = item.status === 'failed';
                  const isItemSyncing = item.status === 'syncing';

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-14 h-14 rounded-lg object-cover border border-slate-800 bg-slate-900 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                            <MapPin className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {p.title}
                            </h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                              isItemSyncing 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                                : isFailed
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {isItemSyncing ? 'Syncing...' : isFailed ? 'Retry Required' : 'Pending Sync'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.roadName} &bull; <span className="text-amber-400">{p.division} Division</span>
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>&bull;</span>
                            <span>{p.severity.toUpperCase()}</span>
                            <span>&bull;</span>
                            <span>{p.depthCm}cm depth</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-900 text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {p.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isFailed && (
                            <button
                              onClick={() => retryItem(item.id)}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-semibold transition"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => removeItemFromQueue(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="Discard from outbox"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Saved Drafts */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Saved In-Progress Drafts ({drafts.length})
              </h3>
            </div>

            {drafts.length === 0 ? (
              <div className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-5 text-center text-slate-400">
                <p className="text-xs text-slate-400">No saved drafts</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  You can save unfinished reports in the report dialog anytime.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {draft.title || draft.roadName || 'Untitled Road Defect'}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {draft.roadName} &bull; {draft.division} &bull; {new Date(draft.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onResumeDraft && (
                        <button
                          onClick={() => onResumeDraft(draft.id)}
                          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Resume</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteReportDraft(draft.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Technical Resilience Info Box */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              Kampala Low-Bandwidth Architecture
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equipped with a progressive <strong>Service Worker</strong> for offline caching and <strong>LocalForage IndexedDB</strong> storage. Reports recorded in low-connectivity areas (e.g. Bwaise, Ggaba, Kalerwe, Luzira) are safely locked onto your local device and synchronized the moment a cell network or Wi-Fi connection is detected.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-400 font-mono">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="block text-slate-500">Storage Engine</span>
                <span className="text-slate-200 font-semibold">IndexedDB / LocalForage</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="block text-slate-500">Sync Mechanism</span>
                <span className="text-slate-200 font-semibold">Background Sync & Event Bus</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
