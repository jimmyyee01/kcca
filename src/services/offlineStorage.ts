import localforage from 'localforage';
import { Pothole, OfflineQueueItem, OfflineDraft, AIAnalysisResult, DivisionName, PotholeSeverity } from '../types';
import { INITIAL_POTHOLES } from '../data/kampalaData';

// Configure distinct LocalForage IndexedDB stores for high reliability & storage capacity
const potholesStore = localforage.createInstance({
  name: 'KampalaPotholeTracker',
  storeName: 'potholes_cache',
  description: 'IndexedDB cache for all reported and synced Kampala potholes'
});

const queueStore = localforage.createInstance({
  name: 'KampalaPotholeTracker',
  storeName: 'offline_sync_queue',
  description: 'Offline queue for reports, upvotes, and status changes recorded with low connectivity'
});

const draftsStore = localforage.createInstance({
  name: 'KampalaPotholeTracker',
  storeName: 'pothole_drafts',
  description: 'Saved in-progress drafts for citizen road hazard reports'
});

const settingsStore = localforage.createInstance({
  name: 'KampalaPotholeTracker',
  storeName: 'offline_settings',
  description: 'Offline metadata, sync history, and simulation flags'
});

// Helper for local offline AI civil engineering assessment calculation
export function generateOfflineHeuristicAnalysis(
  severity: PotholeSeverity,
  depthCm: number,
  diameterCm: number,
  roadName: string,
  division: DivisionName
): AIAnalysisResult {
  const isCrit = severity === 'critical' || depthCm >= 15 || diameterCm >= 80;
  const isSev = severity === 'severe' || depthCm >= 10;
  
  const hazardScore = isCrit ? 9.2 : isSev ? 7.6 : 5.1;
  const asphaltTons = Math.max(0.2, Math.round(depthCm * diameterCm * 0.0016 * 10) / 10);
  const costUGX = Math.round(depthCm * 240000 + diameterCm * 18000 + 450000);
  const costUSD = Math.round(costUGX / 3700);

  return {
    hazardScore,
    depthCm,
    diameterCm,
    severity,
    vehicleDamageRisk: isCrit
      ? 'CRITICAL RISK: High probability of tire blowout, rim deformation, tie-rod fracture, and severe Boda-Boda destabilization.'
      : isSev
      ? 'HIGH RISK: Suspension bushing fatigue, steering misalignment, and low-visibility night hazards.'
      : 'MODERATE RISK: Tire tread wear, alignment jitter, and vehicle speed dampening.',
    estimatedAsphaltTons: asphaltTons,
    estimatedRepairCostUGX: costUGX,
    estimatedRepairCostUSD: costUSD,
    kccaPriorityRank: isCrit ? 'Emergency (24h)' : isSev ? 'Urgent (72h)' : 'Scheduled',
    repairRecommendations: [
      'Square excavation 50mm beyond defective boundary',
      'Excavate loose subgrade and apply crushed rock compaction',
      'Apply K1-60 Cationic Bitumen Emulsion Tack Coat',
      'Compact Hot Mix Asphalt (HMA) wearing course to level'
    ],
    aiSummary: `[OFFLINE HEURISTIC DIAGNOSIS] Road pavement void detected on ${roadName} (${division} Division). Saved offline on local device. Will re-verify with Gemini 3.7 Flash upon reconnection.`,
    isOfflineAssessment: true
  };
}

// -------------------------------------------------------------
// Pothole Cache Operations
// -------------------------------------------------------------

export async function getOfflinePotholes(): Promise<Pothole[]> {
  try {
    const cached = await potholesStore.getItem<Pothole[]>('all_potholes');
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    // Check fallback in localStorage if migration needed
    const localSaved = localStorage.getItem('kampala_potholes_v1');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await potholesStore.setItem('all_potholes', parsed);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing local storage fallback:', e);
      }
    }
    // Seed initial Kampala potholes into IndexedDB
    await potholesStore.setItem('all_potholes', INITIAL_POTHOLES);
    return INITIAL_POTHOLES;
  } catch (error) {
    console.error('Failed to load potholes from localforage:', error);
    return INITIAL_POTHOLES;
  }
}

export async function saveOfflinePotholes(potholes: Pothole[]): Promise<void> {
  try {
    await potholesStore.setItem('all_potholes', potholes);
    // Keep lightweight localStorage backup as redundant safety
    try {
      localStorage.setItem('kampala_potholes_v1', JSON.stringify(potholes));
    } catch (e) {
      // Ignore if localStorage quota exceeded due to large images (IndexedDB handles it)
    }
  } catch (error) {
    console.error('Failed to save potholes to localforage:', error);
  }
}

export const getCachedPotholes = getOfflinePotholes;
export const cachePotholes = saveOfflinePotholes;

// -------------------------------------------------------------
// Offline Queue Operations (Outbox)
// -------------------------------------------------------------

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const queue = await queueStore.getItem<OfflineQueueItem[]>('queue_items');
    return queue || [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
}

export async function enqueueOfflineReport(pothole: Pothole): Promise<OfflineQueueItem> {
  try {
    const currentQueue = (await queueStore.getItem<OfflineQueueItem[]>('queue_items')) || [];
    
    // Tag pothole with pending sync metadata
    const queuedPothole: Pothole = {
      ...pothole,
      syncStatus: 'pending_sync',
      offlineQueuedAt: new Date().toISOString()
    };

    const queueItem: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pothole: queuedPothole,
      action: 'create_report',
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    const updatedQueue = [queueItem, ...currentQueue.filter(i => i.pothole.id !== pothole.id)];
    await queueStore.setItem('queue_items', updatedQueue);

    // Also update main offline cache so it shows up in map/list immediately with pending badge
    const allPotholes = await getOfflinePotholes();
    const existingIndex = allPotholes.findIndex(p => p.id === pothole.id);
    let updatedPotholes: Pothole[];
    if (existingIndex >= 0) {
      updatedPotholes = [...allPotholes];
      updatedPotholes[existingIndex] = queuedPothole;
    } else {
      updatedPotholes = [queuedPothole, ...allPotholes];
    }
    await saveOfflinePotholes(updatedPotholes);

    return queueItem;
  } catch (error) {
    console.error('Failed to enqueue offline report:', error);
    throw error;
  }
}

export async function updateQueueItemStatus(
  id: string, 
  status: 'pending' | 'syncing' | 'synced' | 'failed', 
  errorMsg?: string
): Promise<void> {
  try {
    const currentQueue = (await queueStore.getItem<OfflineQueueItem[]>('queue_items')) || [];
    const updated = currentQueue.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          retryCount: status === 'failed' ? item.retryCount + 1 : item.retryCount,
          lastError: errorMsg || item.lastError
        };
      }
      return item;
    });
    await queueStore.setItem('queue_items', updated);
  } catch (error) {
    console.error('Failed to update queue item status:', error);
  }
}

export async function removeQueueItem(id: string): Promise<void> {
  try {
    const currentQueue = (await queueStore.getItem<OfflineQueueItem[]>('queue_items')) || [];
    const filtered = currentQueue.filter(item => item.id !== id);
    await queueStore.setItem('queue_items', filtered);
  } catch (error) {
    console.error('Failed to remove queue item:', error);
  }
}

export async function clearSyncedQueueItems(): Promise<void> {
  try {
    const currentQueue = (await queueStore.getItem<OfflineQueueItem[]>('queue_items')) || [];
    const pendingOnly = currentQueue.filter(item => item.status !== 'synced');
    await queueStore.setItem('queue_items', pendingOnly);
  } catch (error) {
    console.error('Failed to clear synced queue:', error);
  }
}

// -------------------------------------------------------------
// Drafts Management (Local Saved In-Progress Reports)
// -------------------------------------------------------------

export async function getDrafts(): Promise<OfflineDraft[]> {
  try {
    const drafts = await draftsStore.getItem<OfflineDraft[]>('user_drafts');
    return drafts || [];
  } catch (error) {
    console.error('Failed to get drafts:', error);
    return [];
  }
}

export async function saveDraft(draft: OfflineDraft): Promise<void> {
  try {
    const current = (await draftsStore.getItem<OfflineDraft[]>('user_drafts')) || [];
    const filtered = current.filter(d => d.id !== draft.id);
    const updated = [{ ...draft, updatedAt: new Date().toISOString() }, ...filtered];
    await draftsStore.setItem('user_drafts', updated);
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export async function deleteDraft(id: string): Promise<void> {
  try {
    const current = (await draftsStore.getItem<OfflineDraft[]>('user_drafts')) || [];
    const updated = current.filter(d => d.id !== id);
    await draftsStore.setItem('user_drafts', updated);
  } catch (error) {
    console.error('Failed to delete draft:', error);
  }
}

// -------------------------------------------------------------
// Offline Settings & State
// -------------------------------------------------------------

export async function getSimulatedOfflineFlag(): Promise<boolean> {
  try {
    const flag = await settingsStore.getItem<boolean>('simulated_offline');
    return Boolean(flag);
  } catch {
    return false;
  }
}

export async function setSimulatedOfflineFlag(val: boolean): Promise<void> {
  try {
    await settingsStore.setItem('simulated_offline', val);
  } catch (e) {
    console.error('Failed to persist simulated offline flag:', e);
  }
}

export async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    return await settingsStore.getItem<string>('last_sync_timestamp');
  } catch {
    return null;
  }
}

export async function setLastSyncTimestamp(timestamp: string): Promise<void> {
  try {
    await settingsStore.setItem('last_sync_timestamp', timestamp);
  } catch (e) {
    console.error('Failed to set last sync timestamp:', e);
  }
}
