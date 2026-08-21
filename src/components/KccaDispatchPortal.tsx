import React, { useState } from 'react';
import { 
  Wrench, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  HardHat, 
  Building2, 
  ShieldCheck,
  Download,
  PhoneCall,
  Clock
} from 'lucide-react';
import { Pothole } from '../types';
import { KAMPALA_DIVISIONS } from '../data/kampalaData';

interface KccaDispatchPortalProps {
  potholes: Pothole[];
  onSelectPothole: (pothole: Pothole) => void;
  onStatusChange: (id: string, newStatus: any) => void;
}

export const KccaDispatchPortal: React.FC<KccaDispatchPortalProps> = ({
  potholes,
  onSelectPothole,
  onStatusChange
}) => {
  const [selectedPotholeForOrder, setSelectedPotholeForOrder] = useState<Pothole | null>(
    potholes.find(p => p.status === 'in_repair' || p.severity === 'critical') || potholes[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [workOrderData, setWorkOrderData] = useState<any>(null);

  // Fetch or generate work order
  const handleGenerateOfficialWorkOrder = async (pothole: Pothole) => {
    setSelectedPotholeForOrder(pothole);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-work-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pothole })
      });
      const data = await response.json();
      if (data.success && data.workOrder) {
        setWorkOrderData(data.workOrder);
      }
    } catch (err) {
      console.error('Work order generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeWorkOrders = potholes.filter(p => p.status === 'in_repair' || p.severity === 'critical');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
              KCCA WORKS & TECHNICAL SERVICES
            </span>
            <span className="text-xs text-slate-400 font-mono">Directorate of Engineering</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Kampala Public Works Crew Dispatch & Job Cards
          </h1>
          <p className="text-xs text-slate-300">
            Automated civil engineering work-order generation, asphalt batching & division crew dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Active Gangs</span>
            <strong className="text-amber-400 font-mono text-lg font-bold">5 Crews</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Emergency Hotspots</span>
            <strong className="text-rose-400 font-mono text-lg font-bold">
              {potholes.filter(p => p.severity === 'critical' && p.status !== 'patched').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Work Order Generator & Active Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pothole Queue */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" /> Pending Work Order Queue
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {activeWorkOrders.map(p => (
              <div
                key={p.id}
                onClick={() => handleGenerateOfficialWorkOrder(p)}
                className={`p-3 rounded-xl border cursor-pointer transition space-y-1.5 ${
                  selectedPotholeForOrder?.id === p.id 
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-amber-400">{p.id}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {p.severity}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white">{p.roadName}</h4>
                <p className="text-[11px] text-slate-400 truncate">{p.landmark || p.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>{p.division} Division</span>
                  <span className="text-emerald-400 font-mono">{(p.aiAnalysis?.estimatedRepairCostUGX || 0).toLocaleString()} UGX</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Formal KCCA Job Card Sheet */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          {selectedPotholeForOrder ? (
            <div id="kcca-official-work-order" className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-5 text-xs text-slate-300">
              
              {/* Header Letterhead */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-3 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span className="font-black text-sm text-white uppercase tracking-wider">
                      KAMPALA CAPITAL CITY AUTHORITY (KCCA)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Directorate of Engineering & Technical Services &bull; City Hall, Kimathi Ave
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Work Order</span>
                  </button>
                </div>
              </div>

              {/* Work Order Header Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Work Order Code:</span>
                  <strong className="text-amber-400 font-mono font-bold">
                    {workOrderData?.workOrderCode || selectedPotholeForOrder.workOrderNumber || 'KCCA-WO-2026-1104'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Division:</span>
                  <strong className="text-white font-bold">{selectedPotholeForOrder.division} Division</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date Issued:</span>
                  <strong className="text-white font-mono">{new Date().toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Completion:</span>
                  <strong className="text-emerald-400 font-bold">
                    {workOrderData?.targetCompletionDate || 'Within 48 Hours'}
                  </strong>
                </div>
              </div>

              {/* Location & Damage Particulars */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                  1. Location & Defect Particulars
                </h4>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <div><strong>Road Corridor:</strong> {selectedPotholeForOrder.roadName} ({selectedPotholeForOrder.landmark || 'N/A'})</div>
                  <div><strong>GPS Coordinates:</strong> {selectedPotholeForOrder.lat.toFixed(5)}, {selectedPotholeForOrder.lng.toFixed(5)}</div>
                  <div><strong>Damage Classification:</strong> {selectedPotholeForOrder.severity.toUpperCase()} ({selectedPotholeForOrder.depthCm}cm depth, {selectedPotholeForOrder.diameterCm}cm diameter)</div>
                  <div><strong>Site Notes:</strong> {selectedPotholeForOrder.description}</div>
                </div>
              </div>

              {/* Machinery & Gang Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    2. Required Machinery & Equipment
                  </h4>
                  <ul className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                    {(workOrderData?.requiredMachinery || [
                      'Asphalt Road Saw / Concrete Cutter',
                      'Mechanical Pneumatic Breaker',
                      'Vibratory Tandem Roller (3.5T - 8T)',
                      'Tack Coat Bituminous Hand Sprayer',
                      'Dump Tipper Truck for Debris'
                    ]).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-amber-400">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    3. Crew Allocation & Supervision
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Supervisor in Charge:</span>
                      <strong className="text-white">
                        {KAMPALA_DIVISIONS[selectedPotholeForOrder.division].engineerInCharge}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gang Size:</span>
                      <strong className="text-white">6 Civil Road Works Technicians</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Estimated Shift Hours:</span>
                      <strong className="text-amber-400 font-mono">5 Hours (Night Shift)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill of Quantities (BOQ) */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                  4. Bill of Quantities (BOQ Estimate)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Rate (UGX)</th>
                        <th className="p-2 text-right">Amount (UGX)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {(workOrderData?.billOfQuantities || [
                        { item: 'Diamond Saw cutting & excavation of damaged asphalt', qty: '3.5 m²', rateUGX: 65000, amountUGX: 227500 },
                        { item: 'Graded Crushed Rock (CRR) Sub-base material', qty: '1.2 m³', rateUGX: 180000, amountUGX: 216000 },
                        { item: 'Cationic Bitumen Emulsion Tack Coat (K1-60)', qty: '15 Litres', rateUGX: 14000, amountUGX: 210000 },
                        { item: 'Hot Mix Asphalt Concrete (0/14mm wearing course)', qty: '1.8 Tons', rateUGX: 850000, amountUGX: 1530000 },
                        { item: 'Traffic Marshals & Reflective Cones Deployment', qty: '1 Shift', rateUGX: 350000, amountUGX: 350000 }
                      ]).map((boq: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2 text-slate-200">{boq.item}</td>
                          <td className="p-2 font-mono text-slate-400">{boq.qty}</td>
                          <td className="p-2 font-mono text-slate-400">{boq.rateUGX?.toLocaleString()}</td>
                          <td className="p-2 font-mono font-bold text-amber-400 text-right">{boq.amountUGX?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Update CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-slate-400 text-[11px]">
                  Current Status: <strong className="text-white uppercase">{selectedPotholeForOrder.status}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStatusChange(selectedPotholeForOrder.id, 'in_repair')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                  >
                    Dispatch Crew
                  </button>
                  <button
                    onClick={() => onStatusChange(selectedPotholeForOrder.id, 'patched')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                  >
                    Mark Patched
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select a pothole from the queue to generate an official job card.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
