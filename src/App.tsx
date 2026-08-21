import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KampalaMap } from './components/KampalaMap';
import { PotholeList } from './components/PotholeList';
import { AnalyticsView } from './components/AnalyticsView';
import { RouteHazardPlanner } from './components/RouteHazardPlanner';
import { KccaDispatchPortal } from './components/KccaDispatchPortal';
import { PotholeReportModal } from './components/PotholeReportModal';
import { PotholeDetailDrawer } from './components/PotholeDetailDrawer';
import { OfflineSyncDrawer } from './components/OfflineSyncDrawer';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { DivisionName, Pothole, PotholeSeverity, PotholeStatus, ActiveTab } from './types';
import { INITIAL_POTHOLES } from './data/kampalaData';
import { cachePotholes, getCachedPotholes } from './services/offlineStorage';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const { isEffectiveOnline, pendingCount } = useOffline();

  // Persistent Potholes State with dual IndexedDB + LocalStorage backing
  const [potholes, setPotholes] = useState<Pothole[]>(() => {
    const saved = localStorage.getItem('kampala_potholes_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved potholes:', e);
      }
    }
    return INITIAL_POTHOLES;
  });

  // Attempt to hydrate freshest from IndexedDB on initial mount
  useEffect(() => {
    async function loadFromIndexedDB() {
      try {
        const cached = await getCachedPotholes();
        if (cached && cached.length > 0) {
          setPotholes(cached);
        }
      } catch (e) {
        console.warn('Could not read from IndexedDB cache:', e);
      }
    }
    loadFromIndexedDB();
  }, []);

  // Save to both LocalStorage & IndexedDB whenever potholes update
  useEffect(() => {
    localStorage.setItem('kampala_potholes_v1', JSON.stringify(potholes));
    cachePotholes(potholes).catch(err => {
      console.warn('Failed to cache potholes in IndexedDB:', err);
    });
  }, [potholes]);

  // Active filters and modals
  const [selectedDivision, setSelectedDivision] = useState<DivisionName | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<PotholeSeverity | 'All'>('All');
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isOfflineDrawerOpen, setIsOfflineDrawerOpen] = useState<boolean>(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [plotCoordinates, setPlotCoordinates] = useState<{ lat: number; lng: number; division: DivisionName } | null>(null);

  // Upvote Handler
  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPotholes(prev => prev.map(p => {
      if (p.id === id) {
        const isUpvoted = p.userUpvoted;
        return {
          ...p,
          upvotes: isUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          userUpvoted: !isUpvoted
        };
      }
      return p;
    }));

    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => prev ? {
        ...prev,
        upvotes: prev.userUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
        userUpvoted: !prev.userUpvoted
      } : null);
    }
  };

  // Status Change Handler
  const handleStatusChange = (id: string, newStatus: PotholeStatus) => {
    setPotholes(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : null);
    }
  };

  // Add Comment Handler
  const handleAddComment = (id: string, text: string, author: string, role: any) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      time: 'Just now',
      role
    };

    setPotholes(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          comments: [newComment, ...(p.comments || [])]
        };
      }
      return p;
    }));

    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => prev ? {
        ...prev,
        comments: [newComment, ...(prev.comments || [])]
      } : null);
    }
  };

  // Add New Plotted Pothole (Online or Offline Queued)
  const handleAddPothole = (newPothole: Pothole) => {
    setPotholes(prev => [newPothole, ...prev]);
    setSelectedPothole(newPothole);
    setActiveTab('map');
  };

  // Plot Location Picked from Map Click
  const handlePlotLocationPicked = (lat: number, lng: number, detectedDivision: DivisionName) => {
    setPlotCoordinates({ lat, lng, division: detectedDivision });
    setActiveDraftId(null);
    setIsReportModalOpen(true);
  };

  // Open Map and Jump to Pothole
  const handleOpenMapToPothole = (pothole: Pothole) => {
    setSelectedPothole(pothole);
    setActiveTab('map');
  };

  // Handle Switch to Work Order from Drawer
  const handleGenerateWorkOrder = (pothole: Pothole) => {
    setSelectedPothole(null);
    setActiveTab('kcca_dispatch');
  };

  // Resume Draft from Drawer
  const handleSelectDraft = (draftId: string) => {
    setActiveDraftId(draftId);
    setIsOfflineDrawerOpen(false);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Universal Top Navigation with Live Offline Indicators */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'offline_outbox') {
            setIsOfflineDrawerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        potholes={potholes}
        onOpenReportModal={() => {
          setPlotCoordinates(null);
          setActiveDraftId(null);
          setIsReportModalOpen(true);
        }}
        onOpenOfflineDrawer={() => setIsOfflineDrawerOpen(true)}
      />

      {/* Main Content Area based on Selected Tab */}
      <main className="flex-1 w-full flex flex-col">
        {activeTab === 'map' && (
          <KampalaMap
            potholes={potholes}
            selectedPothole={selectedPothole}
            onSelectPothole={(p) => setSelectedPothole(p)}
            onPlotLocationPicked={handlePlotLocationPicked}
            selectedDivision={selectedDivision}
            setSelectedDivision={setSelectedDivision}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'list' && (
          <PotholeList
            potholes={potholes}
            onSelectPothole={(p) => setSelectedPothole(p)}
            onUpvote={handleUpvote}
            onOpenMapToPothole={handleOpenMapToPothole}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            potholes={potholes}
            onSelectDivision={(div) => {
              setSelectedDivision(div);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'route_planner' && (
          <RouteHazardPlanner
            potholes={potholes}
            onSelectPothole={(p) => setSelectedPothole(p)}
            onOpenMapToPothole={handleOpenMapToPothole}
          />
        )}

        {activeTab === 'kcca_dispatch' && (
          <KccaDispatchPortal
            potholes={potholes}
            onSelectPothole={(p) => setSelectedPothole(p)}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Report / Plot Pothole Modal with Offline Storage */}
      <PotholeReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setPlotCoordinates(null);
          setActiveDraftId(null);
        }}
        onAddPothole={handleAddPothole}
        initialCoords={plotCoordinates}
        activeDraftId={activeDraftId}
      />

      {/* Pothole Deep Inspection Drawer */}
      <PotholeDetailDrawer
        pothole={selectedPothole}
        onClose={() => setSelectedPothole(null)}
        onUpvote={handleUpvote}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
        onGenerateWorkOrder={handleGenerateWorkOrder}
      />

      {/* Offline Outbox & Sync Manager Drawer */}
      <OfflineSyncDrawer
        isOpen={isOfflineDrawerOpen}
        onClose={() => setIsOfflineDrawerOpen(false)}
        onSelectDraft={handleSelectDraft}
      />

    </div>
  );
}

export function App() {
  return (
    <OfflineProvider>
      <MainAppContent />
    </OfflineProvider>
  );
}

export default App;
