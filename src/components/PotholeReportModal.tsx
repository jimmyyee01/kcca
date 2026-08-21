import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  Sparkles, 
  UploadCloud, 
  Image as ImageIcon, 
  AlertTriangle, 
  Check, 
  ShieldAlert, 
  DollarSign, 
  Coins, 
  Wrench,
  Loader2,
  Camera,
  Layers,
  Bike,
  Wifi,
  WifiOff,
  Save,
  FileText,
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { DivisionName, Pothole, PotholeSeverity, AIAnalysisResult, OfflineDraft } from '../types';
import { ROAD_POPULAR_OPTIONS, SAMPLE_POTHOLE_IMAGES, KAMPALA_LANDMARKS } from '../data/kampalaData';
import { useOffline } from '../context/OfflineContext';
import { generateOfflineHeuristicAnalysis } from '../services/offlineStorage';

interface PotholeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPothole: (pothole: Pothole) => void;
  initialCoords?: { lat: number; lng: number; division: DivisionName } | null;
  activeDraftId?: string | null;
}

export const PotholeReportModal: React.FC<PotholeReportModalProps> = ({
  isOpen,
  onClose,
  onAddPothole,
  initialCoords,
  activeDraftId
}) => {
  const { 
    isEffectiveOnline, 
    queuePotholeReport, 
    saveReportDraft, 
    drafts, 
    deleteReportDraft 
  } = useOffline();

  const [draftId, setDraftId] = useState<string | null>(activeDraftId || null);
  const [title, setTitle] = useState('');
  const [roadName, setRoadName] = useState(ROAD_POPULAR_OPTIONS[0]);
  const [customRoadName, setCustomRoadName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [division, setDivision] = useState<DivisionName>(initialCoords?.division || 'Central');
  const [lat, setLat] = useState<number>(initialCoords?.lat || 0.3152);
  const [lng, setLng] = useState<number>(initialCoords?.lng || 32.5816);
  const [severity, setSeverity] = useState<PotholeSeverity>('critical');
  const [depthCm, setDepthCm] = useState<number>(14);
  const [diameterCm, setDiameterCm] = useState<number>(75);
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [bodaHazardWarning, setBodaHazardWarning] = useState<boolean>(true);

  // Image & AI Analysis state
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_POTHOLE_IMAGES[0].url);
  const [imageFileBase64, setImageFileBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');

  // Load draft if specified or selected
  useEffect(() => {
    if (activeDraftId && drafts.length > 0) {
      const targetDraft = drafts.find(d => d.id === activeDraftId);
      if (targetDraft) {
        setDraftId(targetDraft.id);
        setTitle(targetDraft.title || '');
        setRoadName(targetDraft.roadName || ROAD_POPULAR_OPTIONS[0]);
        setCustomRoadName(targetDraft.customRoadName || '');
        setLandmark(targetDraft.landmark || '');
        setDivision(targetDraft.division || 'Central');
        setLat(targetDraft.lat || 0.3152);
        setLng(targetDraft.lng || 32.5816);
        setSeverity(targetDraft.severity || 'critical');
        setDepthCm(targetDraft.depthCm || 14);
        setDiameterCm(targetDraft.diameterCm || 75);
        setDescription(targetDraft.description || '');
        setReportedBy(targetDraft.reportedBy || '');
        setBodaHazardWarning(targetDraft.bodaHazardWarning ?? true);
        if (targetDraft.selectedImage) setSelectedImage(targetDraft.selectedImage);
        if (targetDraft.imageFileBase64) setImageFileBase64(targetDraft.imageFileBase64);
        if (targetDraft.aiAnalysis) setAiAnalysis(targetDraft.aiAnalysis);
      }
    }
  }, [activeDraftId, drafts]);

  if (!isOpen) return null;

  // Handle File Upload with local base64 caching
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setImageFileBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Inspection (Server Gemini if online, local heuristic if offline)
  const handleRunAiInspection = async () => {
    setIsAnalyzing(true);
    const actualRoad = roadName === 'Other' ? customRoadName : roadName;

    if (!isEffectiveOnline) {
      // Local Offline Civil Engineering Heuristic Engine
      setAiStatusMessage('Generating offline engineering heuristic calculation...');
      setTimeout(() => {
        const offlineAssessment = generateOfflineHeuristicAnalysis(
          severity,
          depthCm,
          diameterCm,
          actualRoad || 'Kampala Road',
          division
        );
        setAiAnalysis(offlineAssessment);
        if (!description) {
          setDescription(offlineAssessment.aiSummary);
        }
        setIsAnalyzing(false);
        setAiStatusMessage('');
      }, 500);
      return;
    }

    // Online Gemini API Analysis
    setAiStatusMessage('Connecting to Gemini 3.7 Flash Civil Engineering Inspection Engine...');
    try {
      const response = await fetch('/api/analyze-pothole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageFileBase64 || null,
          imageUrl: selectedImage,
          roadName: actualRoad || 'Kampala Road Corridor',
          division: division,
          description: description || `Pothole observed on ${actualRoad} in ${division} Division, Kampala.`
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        setSeverity(data.analysis.severity);
        setDepthCm(data.analysis.depthCm);
        setDiameterCm(data.analysis.diameterCm);
        if (!description) {
          setDescription(data.analysis.aiSummary);
        }
      } else {
        // Local Fallback
        const fallback = generateOfflineHeuristicAnalysis(severity, depthCm, diameterCm, actualRoad || 'Kampala Road', division);
        setAiAnalysis(fallback);
      }
    } catch (err) {
      console.warn('AI Analysis online connection failed, using local engineering heuristic:', err);
      const fallback = generateOfflineHeuristicAnalysis(severity, depthCm, diameterCm, actualRoad || 'Kampala Road', division);
      setAiAnalysis(fallback);
    } finally {
      setIsAnalyzing(false);
      setAiStatusMessage('');
    }
  };

  // Handle Save Current Form as Draft in IndexedDB
  const handleSaveDraft = async () => {
    const actualRoad = roadName === 'Other' ? customRoadName : roadName;
    const currentDraftId = draftId || `draft-${Date.now()}`;
    const draft: OfflineDraft = {
      id: currentDraftId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: title.trim() || `Draft: Hazard on ${actualRoad}`,
      roadName: actualRoad,
      customRoadName,
      landmark,
      division,
      lat,
      lng,
      severity,
      depthCm,
      diameterCm,
      description,
      reportedBy,
      bodaHazardWarning,
      selectedImage,
      imageFileBase64,
      aiAnalysis
    };

    await saveReportDraft(draft);
    setDraftId(currentDraftId);
  };

  // Handle Loading a Draft from Picker
  const handleSelectDraft = (selectedId: string) => {
    const targetDraft = drafts.find(d => d.id === selectedId);
    if (targetDraft) {
      setDraftId(targetDraft.id);
      setTitle(targetDraft.title || '');
      setRoadName(targetDraft.roadName || ROAD_POPULAR_OPTIONS[0]);
      setCustomRoadName(targetDraft.customRoadName || '');
      setLandmark(targetDraft.landmark || '');
      setDivision(targetDraft.division || 'Central');
      setLat(targetDraft.lat || 0.3152);
      setLng(targetDraft.lng || 32.5816);
      setSeverity(targetDraft.severity || 'critical');
      setDepthCm(targetDraft.depthCm || 14);
      setDiameterCm(targetDraft.diameterCm || 75);
      setDescription(targetDraft.description || '');
      setReportedBy(targetDraft.reportedBy || '');
      setBodaHazardWarning(targetDraft.bodaHazardWarning ?? true);
      if (targetDraft.selectedImage) setSelectedImage(targetDraft.selectedImage);
      if (targetDraft.imageFileBase64) setImageFileBase64(targetDraft.imageFileBase64);
      if (targetDraft.aiAnalysis) setAiAnalysis(targetDraft.aiAnalysis);
    }
  };

  // Handle Submit Form (Supports Online Instant + Offline Queueing)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actualRoad = roadName === 'Other' ? customRoadName : roadName;
    const finalTitle = title.trim() || `Hazard on ${actualRoad}`;

    // Auto compute analysis if missing
    const finalAnalysis = aiAnalysis || generateOfflineHeuristicAnalysis(
      severity,
      depthCm,
      diameterCm,
      actualRoad || 'Kampala Road',
      division
    );

    const isOfflineSubmission = !isEffectiveOnline;

    const newPothole: Pothole = {
      id: `KLA-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: finalTitle,
      roadName: actualRoad || 'Kampala Road',
      landmark: landmark.trim() || undefined,
      division: division,
      lat: Number(lat),
      lng: Number(lng),
      severity: severity,
      depthCm: Number(depthCm),
      diameterCm: Number(diameterCm),
      status: 'reported',
      upvotes: 1,
      userUpvoted: true,
      reportedBy: reportedBy.trim() || 'Anonymous Kampala Citizen',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: description.trim() || `Road pavement defect reported on ${actualRoad}.`,
      imageUrl: selectedImage,
      bodaHazardWarning: bodaHazardWarning,
      aiAnalysis: finalAnalysis,
      comments: [],
      syncStatus: isOfflineSubmission ? 'pending_sync' : 'synced',
      offlineQueuedAt: isOfflineSubmission ? new Date().toISOString() : undefined
    };

    if (isOfflineSubmission) {
      // Queue locally in LocalForage IndexedDB
      await queuePotholeReport(newPothole);
    }

    // Call parent handler to update view immediately
    onAddPothole(newPothole);

    // If this was from a draft, delete the draft
    if (draftId) {
      await deleteReportDraft(draftId);
    }

    // Fire celebration confetti
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#f43f5e']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="modal-report-pothole"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-950/40 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  Plot New Pothole / Road Hazard
                </h3>
                {!isEffectiveOnline && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <WifiOff className="w-3 h-3" /> Offline Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Plot exact coordinates in Kampala with offline persistence & AI diagnosis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Status & Draft Notice Banner */}
        <div className={`px-6 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          !isEffectiveOnline 
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' 
            : 'bg-slate-950/40 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {!isEffectiveOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Offline Mode:</strong> Report will be stored locally in IndexedDB and uploaded automatically when network reconnects.
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Connected to Kampala live database feed.</span>
              </>
            )}
          </div>

          {/* Draft Management Quick Action */}
          {drafts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Drafts ({drafts.length}):</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleSelectDraft(e.target.value);
                }}
                value={draftId || ''}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-cyan-300 focus:outline-none"
              >
                <option value="">Load saved draft...</option>
                {drafts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.title || d.roadName} ({new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Location & GPS Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 1. Kampala Location & Division
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Road Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Road / Highway</label>
                <select
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  {ROAD_POPULAR_OPTIONS.map((road) => (
                    <option key={road} value={road}>{road}</option>
                  ))}
                  <option value="Other">Other (Custom Road Name)</option>
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">KCCA Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as DivisionName)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  <option value="Central">Central Division (CBD)</option>
                  <option value="Nakawa">Nakawa Division</option>
                  <option value="Kawempe">Kawempe Division</option>
                  <option value="Makindye">Makindye Division</option>
                  <option value="Rubaga">Rubaga Division</option>
                </select>
              </div>
            </div>

            {roadName === 'Other' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Enter Road Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bukoto-Kisaasi link near Kisasi stage"
                  value={customRoadName}
                  onChange={(e) => setCustomRoadName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            )}

            {/* Landmark and Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Nearest Landmark / Stage</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Shell Petrol Station, 50m from junction"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quick Landmark Coordinate</label>
                <select
                  onChange={(e) => {
                    const lm = KAMPALA_LANDMARKS.find(l => l.name === e.target.value);
                    if (lm) {
                      setLat(lm.lat);
                      setLng(lm.lng);
                      setDivision(lm.division as DivisionName);
                      setLandmark(lm.name);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="">Choose preset...</option>
                  {KAMPALA_LANDMARKS.map(l => (
                    <option key={l.name} value={l.name}>{l.name.split('/')[0]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photo & AI Damage Inspection */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> 2. Pothole Photo & AI Inspection {isEffectiveOnline ? '(Gemini 3.7 Flash)' : '(Offline Heuristic)'}
              </label>
              <button
                type="button"
                onClick={handleRunAiInspection}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEffectiveOnline ? 'Run AI Damage Scan' : 'Calculate Offline AI Metrics'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Photo Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_POTHOLE_IMAGES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(sample.url)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border transition ${
                    selectedImage === sample.url ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-16 object-cover" />
                  <div className="p-1 text-[10px] bg-slate-900 text-slate-300 truncate">
                    {sample.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Image Upload */}
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer border border-slate-700 transition">
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Custom Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-[11px] text-slate-500">Stored safely in IndexedDB even while offline</span>
            </div>

            {/* AI Diagnostics Card if Available */}
            {aiAnalysis && (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/30 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 
                    {aiAnalysis.isOfflineAssessment ? 'Civil Engineering Assessment (Offline Mode)' : 'AI Civil Engineering Report (Gemini 3.7)'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Priority: {aiAnalysis.kccaPriorityRank}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Hazard Danger:</span>
                    <strong className="text-rose-400 font-mono font-bold text-sm">{aiAnalysis.hazardScore}/10</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Estimated Depth:</span>
                    <strong className="text-amber-400 font-mono font-bold text-sm">{aiAnalysis.depthCm} cm</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Asphalt Required:</span>
                    <strong className="text-sky-400 font-mono font-bold text-sm">{aiAnalysis.estimatedAsphaltTons} Tons</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">KCCA Repair Cost:</span>
                    <strong className="text-emerald-400 font-mono font-bold text-xs">{aiAnalysis.estimatedRepairCostUGX.toLocaleString()} UGX</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 italic bg-slate-950/50 p-2 rounded border border-slate-800/80">
                  &ldquo;{aiAnalysis.aiSummary}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Severity & Dimensions Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as PotholeSeverity)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                <option value="critical">Critical (Depth &gt; 15cm)</option>
                <option value="severe">Severe (Depth 10-15cm)</option>
                <option value="moderate">Moderate (Depth 5-10cm)</option>
                <option value="minor">Minor (&lt; 5cm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Depth ({depthCm} cm)
              </label>
              <input
                type="range"
                min={3}
                max={30}
                value={depthCm}
                onChange={(e) => setDepthCm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Diameter ({diameterCm} cm)
              </label>
              <input
                type="range"
                min={15}
                max={200}
                value={diameterCm}
                onChange={(e) => setDiameterCm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Boda Hazard Warning Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <input
              type="checkbox"
              id="chk-boda-hazard"
              checked={bodaHazardWarning}
              onChange={(e) => setBodaHazardWarning(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <label htmlFor="chk-boda-hazard" className="text-xs text-slate-200 cursor-pointer select-none">
              <strong className="text-amber-400 flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 inline" /> High Hazard for Boda-Boda Motorcyclists & Cyclists
              </strong>
              <span className="text-[11px] text-slate-400 block">
                Flag this hazard to notify two-wheeler riders of lethal rim bend / crash risks at night.
              </span>
            </label>
          </div>

          {/* Reporter & Description Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name / Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ssemwogerere Paul (Resident / Driver)"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Custom Title</label>
              <input
                type="text"
                placeholder="e.g. Broken pavement near Nakawa stage"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Pavement Damage Description</label>
            <textarea
              rows={2}
              placeholder="Describe road conditions, water stagnation, or specific traffic lane affected..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Submit & Draft Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save as Draft</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                id="btn-submit-plot"
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-xl shadow-amber-500/25 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {!isEffectiveOnline ? 'Queue Report Offline' : 'Plot Pothole to City Map'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
