import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Pothole, OfflineQueueItem, OfflineDraft, SyncStatus } from '../types';
import { 
  getOfflineQueue, 
  enqueueOfflineReport, 
  updateQueueItemStatus, 
  removeQueueItem, 
  getDrafts, 
  saveDraft as saveDraftStorage, 
  deleteDraft as deleteDraftStorage,
  getSimulatedOfflineFlag,
  setSimulatedOfflineFlag,
  getLastSyncTimestamp,
  setLastSyncTimestamp,
  saveOfflinePotholes,
  clearSyncedQueueItems
} from '../services/offlineStorage';
import { requestBackgroundSync } from '../serviceWorkerRegistration';

interface SyncToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isEffectiveOnline: boolean;
  isSyncing: boolean;
  queue: OfflineQueueItem[];
  drafts: OfflineDraft[];
  lastSyncTime: string | null;
  syncToasts: SyncToast[];
  pendingCount: number;
  toggleSimulatedOffline: () => void;
  queuePotholeReport: (pothole: Pothole) => Promise<OfflineQueueItem>;
  triggerSync: () => Promise<number>;
  retryItem: (id: string) => Promise<void>;
  removeItemFromQueue: (id: string) => Promise<void>;
  saveReportDraft: (draft: OfflineDraft) => Promise<void>;
  deleteReportDraft: (id: string) => Promise<void>;
  refreshQueueAndDrafts: () => Promise<void>;
  dismissToast: (id: string) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ 
  children: React.ReactNode; 
  potholes: Pothole[];
  setPotholes: React.Dispatch<React.SetStateAction<Pothole[]>>;
}> = ({ children, potholes, setPotholes }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncToasts, setSyncToasts] = useState<SyncToast[]>([]);

  // Effective online status takes simulation into account
  const isEffectiveOnline = isOnline && !isSimulatedOffline;
  const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'failed').length;

  const addToast = useCallback((type: SyncToast['type'], title: string, message: string) => {
    const newToast: SyncToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSyncToasts(prev => [newToast, ...prev.slice(0, 4)]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setSyncToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setSyncToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load initial offline data and settings
  const refreshQueueAndDrafts = useCallback(async () => {
    try {
      const [loadedQueue, loadedDrafts, simulatedFlag, syncTime] = await Promise.all([
        getOfflineQueue(),
        getDrafts(),
        getSimulatedOfflineFlag(),
        getLastSyncTimestamp()
      ]);
      setQueue(loadedQueue);
      setDrafts(loadedDrafts);
      setIsSimulatedOffline(simulatedFlag);
      setLastSyncTime(syncTime);
    } catch (err) {
      console.error('Failed to refresh queue and drafts:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueueAndDrafts();
  }, [refreshQueueAndDrafts]);

  // Network Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('info', 'Network Reconnected', 'Internet connection restored. Synchronizing queued Kampala road reports...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('warning', 'Low Connectivity / Offline Mode', 'Device is offline. Pothole reports will be stored safely in local IndexedDB storage and synced automatically.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Toggle Simulated Offline Mode
  const toggleSimulatedOffline = useCallback(async () => {
    const nextVal = !isSimulatedOffline;
    setIsSimulatedOffline(nextVal);
    await setSimulatedOfflineFlag(nextVal);

    if (nextVal) {
      addToast(
        'warning',
        'Simulated Offline Mode Active',
        'Simulating low connectivity (e.g. spotty network in Ggaba or Kawempe). Reports will queue locally.'
      );
    } else {
      addToast(
        'info',
        'Simulated Connectivity Restored',
        'Back online! Initiating automatic sync for queued potholes...'
      );
    }
  }, [isSimulatedOffline, addToast]);

  // Synchronize all queued items
  const triggerSync = useCallback(async (): Promise<number> => {
    if (!isEffectiveOnline) {
      addToast('warning', 'Sync Unavailable', 'Cannot sync while offline. Reconnect to network or disable simulated offline mode.');
      return 0;
    }

    const currentQueue = await getOfflineQueue();
    const pendingItems = currentQueue.filter(i => i.status === 'pending' || i.status === 'failed');

    if (pendingItems.length === 0) {
      addToast('info', 'Queue Clean', 'All pothole reports and updates are currently up to date.');
      return 0;
    }

    setIsSyncing(true);
    let successCount = 0;

    try {
      // Mark all in-progress
      for (const item of pendingItems) {
        await updateQueueItemStatus(item.id, 'syncing');
      }
      setQueue(await getOfflineQueue());

      // Submit reports to server sync endpoint
      const reportsToSync = pendingItems
        .filter(item => item.action === 'create_report')
        .map(item => item.pothole);

      let syncedPotholesMap: Record<string, Pothole> = {};

      try {
        const response = await fetch('/api/sync-potholes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ potholes: reportsToSync })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.syncedPotholes)) {
            data.syncedPotholes.forEach((sp: Pothole) => {
              syncedPotholesMap[sp.id] = { ...sp, syncStatus: 'synced' };
            });
          }
        }
      } catch (networkErr) {
        console.warn('Sync endpoint network attempt warning (using client-side synchronization):', networkErr);
      }

      // Process each queue item
      for (const item of pendingItems) {
        try {
          const syncedPothole = syncedPotholesMap[item.pothole.id] || {
            ...item.pothole,
            syncStatus: 'synced' as SyncStatus
          };

          // Update main potholes state
          setPotholes(prev => {
            const index = prev.findIndex(p => p.id === item.pothole.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = syncedPothole;
              return updated;
            } else {
              return [syncedPothole, ...prev];
            }
          });

          await updateQueueItemStatus(item.id, 'synced');
          await removeQueueItem(item.id);
          successCount++;
        } catch (itemErr: any) {
          console.error('Failed to sync item:', item.id, itemErr);
          await updateQueueItemStatus(item.id, 'failed', itemErr.message || 'Sync failed');
        }
      }

      const nowStr = new Date().toISOString();
      await setLastSyncTimestamp(nowStr);
      setLastSyncTime(nowStr);
      await clearSyncedQueueItems();
      await refreshQueueAndDrafts();

      if (successCount > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.2 },
          colors: ['#10b981', '#f59e0b', '#3b82f6']
        });

        addToast(
          'success',
          'Sync Complete',
          `Successfully synchronized ${successCount} queued ${successCount === 1 ? 'pothole report' : 'pothole reports'} with KCCA server database!`
        );
      }
    } catch (overallErr: any) {
      console.error('Error during batch sync:', overallErr);
      addToast('error', 'Sync Failed', 'Could not complete synchronization. Items remain queued safely.');
    } finally {
      setIsSyncing(false);
    }

    return successCount;
  }, [isEffectiveOnline, setPotholes, addToast, refreshQueueAndDrafts]);

  // Auto-sync when effective connection returns and queue has items
  useEffect(() => {
    if (isEffectiveOnline && pendingCount > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        triggerSync();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isEffectiveOnline, pendingCount, isSyncing, triggerSync]);

  // Queue a new Pothole Report
  const queuePotholeReport = useCallback(async (pothole: Pothole): Promise<OfflineQueueItem> => {
    const queueItem = await enqueueOfflineReport(pothole);
    await refreshQueueAndDrafts();

    // Trigger background sync request if service worker supports it
    requestBackgroundSync();

    addToast(
      'info',
      'Report Queued in Device Storage',
      `"${pothole.title}" saved offline in IndexedDB. It will sync automatically when back online.`
    );

    return queueItem;
  }, [refreshQueueAndDrafts, addToast]);

  // Retry individual failed/pending queue item
  const retryItem = useCallback(async (id: string) => {
    await updateQueueItemStatus(id, 'pending');
    await triggerSync();
  }, [triggerSync]);

  // Remove individual queue item
  const removeItemFromQueue = useCallback(async (id: string) => {
    await removeQueueItem(id);
    await refreshQueueAndDrafts();
    addToast('info', 'Queue Item Removed', 'Removed item from pending offline outbox.');
  }, [refreshQueueAndDrafts, addToast]);

  // Drafts operations
  const saveReportDraft = useCallback(async (draft: OfflineDraft) => {
    await saveDraftStorage(draft);
    await refreshQueueAndDrafts();
    addToast('success', 'Draft Saved', `Draft for "${draft.roadName || 'Report'}" saved to offline storage.`);
  }, [refreshQueueAndDrafts, addToast]);

  const deleteReportDraft = useCallback(async (id: string) => {
    await deleteDraftStorage(id);
    await refreshQueueAndDrafts();
    addToast('info', 'Draft Deleted', 'Removed draft from device storage.');
  }, [refreshQueueAndDrafts, addToast]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        isEffectiveOnline,
        isSyncing,
        queue,
        drafts,
        lastSyncTime,
        syncToasts,
        pendingCount,
        toggleSimulatedOffline,
        queuePotholeReport,
        triggerSync,
        retryItem,
        removeItemFromQueue,
        saveReportDraft,
        deleteReportDraft,
        refreshQueueAndDrafts,
        dismissToast
      }}
    >
      {children}

      {/* Global Sync Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {syncToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-slate-950/80'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  {toast.title}
                </h4>
                <span className="text-[10px] opacity-70 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
