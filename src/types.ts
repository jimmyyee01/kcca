export type DivisionName = 'Central' | 'Nakawa' | 'Makindye' | 'Kawempe' | 'Rubaga';

export type PotholeSeverity = 'critical' | 'severe' | 'moderate' | 'minor';

export type PotholeStatus = 'reported' | 'verified' | 'in_repair' | 'patched';

export type SyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'failed';

export interface AIAnalysisResult {
  hazardScore: number; // 1-10
  depthCm: number;
  diameterCm: number;
  severity: PotholeSeverity;
  vehicleDamageRisk: string;
  estimatedAsphaltTons: number;
  estimatedRepairCostUGX: number;
  estimatedRepairCostUSD: number;
  kccaPriorityRank: 'Emergency (24h)' | 'Urgent (72h)' | 'Scheduled' | 'Low Priority';
  repairRecommendations: string[];
  aiSummary: string;
  isOfflineAssessment?: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
  role?: 'citizen' | 'kcca_engineer' | 'boda_rider';
}

export interface Pothole {
  id: string;
  title: string;
  roadName: string;
  landmark?: string;
  division: DivisionName;
  lat: number;
  lng: number;
  severity: PotholeSeverity;
  depthCm: number;
  diameterCm: number;
  status: PotholeStatus;
  upvotes: number;
  userUpvoted?: boolean;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  description: string;
  imageUrl?: string;
  aiAnalysis?: AIAnalysisResult;
  comments: CommentItem[];
  workOrderNumber?: string;
  assignedCrew?: string;
  bodaHazardWarning?: boolean;
  // Offline & Synchronization Attributes
  syncStatus?: SyncStatus;
  isOfflineDraft?: boolean;
  offlineQueuedAt?: string;
  syncError?: string;
}

export interface OfflineQueueItem {
  id: string;
  pothole: Pothole;
  action: 'create_report' | 'upvote' | 'status_change' | 'comment';
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
  payload?: any;
}

export interface OfflineDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  roadName: string;
  customRoadName?: string;
  landmark?: string;
  division: DivisionName;
  lat: number;
  lng: number;
  severity: PotholeSeverity;
  depthCm: number;
  diameterCm: number;
  description: string;
  reportedBy: string;
  bodaHazardWarning: boolean;
  selectedImage: string;
  imageFileBase64?: string | null;
  aiAnalysis?: AIAnalysisResult | null;
}

export interface DivisionInfo {
  name: DivisionName;
  fullName: string;
  hqLocation: string;
  engineerInCharge: string;
  emergencyHotline: string;
  color: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}

export interface FilterState {
  search: string;
  division: DivisionName | 'All';
  severity: PotholeSeverity | 'All';
  status: PotholeStatus | 'All';
  sortBy: 'newest' | 'severity' | 'upvotes' | 'danger';
}

export type ActiveTab = 'map' | 'list' | 'analytics' | 'route_planner' | 'kcca_dispatch' | 'offline_outbox';
export type ViewMode = ActiveTab;

export interface NetworkState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isEffectiveOnline: boolean;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}
