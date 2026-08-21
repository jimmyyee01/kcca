import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  ThumbsUp, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  ShieldAlert, 
  Coins, 
  DollarSign, 
  Bike, 
  Send, 
  FileText, 
  Share2, 
  Calendar, 
  User, 
  ChevronRight,
  Printer,
  Building,
  WifiOff
} from 'lucide-react';
import { Pothole, PotholeStatus } from '../types';
import { KAMPALA_DIVISIONS } from '../data/kampalaData';

interface PotholeDetailDrawerProps {
  pothole: Pothole | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onStatusChange: (id: string, newStatus: PotholeStatus) => void;
  onAddComment: (id: string, text: string, author: string, role: any) => void;
  onGenerateWorkOrder: (pothole: Pothole) => void;
}

export const PotholeDetailDrawer: React.FC<PotholeDetailDrawerProps> = ({
  pothole,
  onClose,
  onUpvote,
  onStatusChange,
  onAddComment,
  onGenerateWorkOrder
}) => {
  if (!pothole) return null;

  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentRole, setCommentRole] = useState<'citizen' | 'boda_rider' | 'kcca_engineer'>('citizen');
  const [copiedLink, setCopiedLink] = useState(false);

  const divisionInfo = KAMPALA_DIVISIONS[pothole.division];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(
      pothole.id,
      commentText.trim(),
      commentAuthor.trim() || 'Kampala Road User',
      commentRole
    );
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `🚨 Kampala Pothole Alert: ${pothole.title} on ${pothole.roadName} (${pothole.division} Division). Hazard Depth: ${pothole.depthCm}cm.`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getSeverityBadge = () => {
    switch (pothole.severity) {
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

  const getStatusBadge = () => {
    switch (pothole.status) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div 
        id="pothole-detail-drawer"
        className="w-full sm:max-w-xl h-full sm:h-[94vh] bg-slate-900 border-l sm:border border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {pothole.id}
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getSeverityBadge()}`}>
              {pothole.severity} HAZARD
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge()}`}>
              {pothole.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
              title="Share / Copy Alert"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[10px] text-emerald-400">Copied!</span>}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Main Title & Image Header */}
          <div>
            <h2 className="text-xl font-extrabold text-white mb-1 leading-tight">
              {pothole.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {pothole.roadName} {pothole.landmark ? `(${pothole.landmark})` : ''}
              </span>
              <span>&bull;</span>
              <span className="text-amber-400 font-semibold">{pothole.division} Division</span>
            </div>

            {/* Offline Device Storage Banner if Pending Sync */}
            {pothole.syncStatus === 'pending_sync' && (
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-amber-300 block">Report Stored in Local Device Memory</strong>
                  <span>This hazard was created while offline. It will be submitted to the KCCA live server automatically when back online.</span>
                </div>
              </div>
            )}

            {/* Photo with Overlay stats */}
            {pothole.imageUrl && (
              <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-800 shadow-xl group">
                <img
                  src={pothole.imageUrl}
                  alt={pothole.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                
                {/* Floating Metric Badges */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 font-mono font-bold text-white">
                      Depth: <strong className="text-amber-400">{pothole.depthCm} cm</strong>
                    </span>
                    <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 font-mono font-bold text-white">
                      Diameter: <strong className="text-amber-400">{pothole.diameterCm} cm</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onUpvote(pothole.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote ({pothole.upvotes})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Boda-Boda Warning Banner if Flagged */}
          {pothole.bodaHazardWarning && (
            <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-300">Severe Hazard for Boda-Boda Motorcyclists</h4>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Deep rim-bending depression. High risk of two-wheeler crashes during rainy hours when the crater is obscured by muddy stormwater.
                </p>
              </div>
            </div>
          )}

          {/* AI Inspection Diagnostics (Gemini 3.7 Flash) */}
          {pothole.aiAnalysis && (
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Pavement Diagnostic Report
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  Score: <strong className="text-rose-400 text-xs">{pothole.aiAnalysis.hazardScore}/10</strong>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {pothole.aiAnalysis.aiSummary}
              </p>

              {/* Engineering Quantities & Estimates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Asphalt Volume:</span>
                  <strong className="text-sky-400 font-mono text-sm font-bold">
                    {pothole.aiAnalysis.estimatedAsphaltTons} Metric Tons
                  </strong>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Est. Repair Budget:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-bold">
                    {pothole.aiAnalysis.estimatedRepairCostUGX.toLocaleString()} UGX
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    (~${pothole.aiAnalysis.estimatedRepairCostUSD} USD)
                  </span>
                </div>
              </div>

              {/* Repair Recommendations */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Recommended Engineering Repair Steps:
                </span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {pothole.aiAnalysis.repairRecommendations.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* KCCA Public Works Management */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" /> KCCA Public Works & Dispatch
              </span>
              <span className="text-[11px] text-slate-400">
                Divisional Engineer: {divisionInfo?.engineerInCharge}
              </span>
            </div>

            {/* Quick Status Setter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['reported', 'verified', 'in_repair', 'patched'] as PotholeStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(pothole.id, st)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition border ${
                    pothole.status === st
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Generate Official Work Order Button */}
            <button
              onClick={() => onGenerateWorkOrder(pothole)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Generate KCCA Engineering Work Order (BOQ)</span>
            </button>
          </div>

          {/* Citizen & Boda Comments Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Community Live Updates & Reports ({pothole.comments?.length || 0})
            </h4>

            {/* Comment List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {pothole.comments && pothole.comments.length > 0 ? (
                pothole.comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {c.author}
                        {c.role === 'kcca_engineer' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                            KCCA ENGINEER
                          </span>
                        )}
                        {c.role === 'boda_rider' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            BODA RIDER
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No community comments yet. Be the first to verify road condition.</p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ssalongo John)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <select
                  value={commentRole}
                  onChange={(e) => setCommentRole(e.target.value as any)}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="citizen">Citizen Driver</option>
                  <option value="boda_rider">Boda-Boda Rider</option>
                  <option value="kcca_engineer">KCCA Public Works</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add traffic warning or road status update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                  title="Post comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer Meta */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Reported: {new Date(pothole.reportedAt).toLocaleDateString()}</span>
          <span>KCCA Hotline: {divisionInfo?.emergencyHotline}</span>
        </div>

      </div>
    </div>
  );
};
