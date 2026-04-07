import { useState, useMemo } from 'react';
import {
  ClipboardList, AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  User, Stethoscope, Pill, ArrowRight, RefreshCw, Shield, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PrescribedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

interface Prescription {
  id: string;
  rxNumber: string;
  patient: {
    name: string;
    mrn: string;
    age: number;
    gender: string;
    allergies: string[];
  };
  doctor: string;
  department: string;
  date: string;
  diagnosis: string;
  medicines: PrescribedMedicine[];
  status: 'pending' | 'verified' | 'dispensed';
}

interface InventoryProduct {
  id: string;
  name: string;
  genericName: string;
  code: string;
  price: number;
  stock: number;
  unit: string;
}

interface DispenseItem {
  prescribedId: string;
  selectedProduct: InventoryProduct | null;
  dispensedQty: number;
  isSubstitution: boolean;
  substitutionReason: string;
  verified: boolean;
}

type VerifyStatus = 'pending' | 'verified' | 'dispensed';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const inventoryProducts: InventoryProduct[] = [
  { id: 'inv1', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', code: 'TAB-001', price: 12.50, stock: 450, unit: 'Tab' },
  { id: 'inv2', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', code: 'TAB-006', price: 18.00, stock: 280, unit: 'Tab' },
  { id: 'inv3', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', code: 'TAB-003', price: 15.00, stock: 320, unit: 'Cap' },
  { id: 'inv4', name: 'Omeprazole 20mg', genericName: 'Omeprazole', code: 'TAB-005', price: 10.00, stock: 600, unit: 'Cap' },
  { id: 'inv5', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', code: 'TAB-009', price: 5.00, stock: 900, unit: 'Tab' },
  { id: 'inv6', name: 'Crepe Bandage 6inch', genericName: 'N/A', code: 'BND-001', price: 45.00, stock: 150, unit: 'Pc' },
  { id: 'inv7', name: 'Metformin 500mg', genericName: 'Metformin HCl', code: 'TAB-002', price: 8.00, stock: 800, unit: 'Tab' },
  { id: 'inv8', name: 'Losartan 50mg', genericName: 'Losartan Potassium', code: 'TAB-008', price: 14.00, stock: 350, unit: 'Tab' },
  { id: 'inv9', name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin Calcium', code: 'TAB-026', price: 22.00, stock: 270, unit: 'Tab' },
  { id: 'inv10', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', code: 'TAB-020', price: 14.00, stock: 520, unit: 'Tab' },
  { id: 'inv11', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', code: 'TAB-030', price: 4.00, stock: 600, unit: 'Tab' },
  { id: 'inv12', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', code: 'TAB-010', price: 4.00, stock: 700, unit: 'Tab' },
  { id: 'inv13', name: 'Azithromycin 500mg', genericName: 'Azithromycin', code: 'TAB-015', price: 40.00, stock: 180, unit: 'Tab' },
];

const demoPrescriptions: Prescription[] = [
  {
    id: 'rx-v1',
    rxNumber: 'RX-20260329-001',
    patient: { name: 'Ahmed Raza', mrn: 'MR-10234', age: 55, gender: 'Male', allergies: ['Penicillin', 'Sulfa drugs'] },
    doctor: 'Dr. Farhan Sheikh',
    department: 'Cardiology',
    date: '2026-03-29 09:15',
    diagnosis: 'Hypertension with Hyperlipidemia',
    medicines: [
      { id: 'pm1', name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days', quantity: 30 },
      { id: 'pm2', name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once at night', duration: '30 days', quantity: 30 },
    ],
    status: 'pending',
  },
  {
    id: 'rx-v2',
    rxNumber: 'RX-20260329-002',
    patient: { name: 'Fatima Bibi', mrn: 'MR-10235', age: 38, gender: 'Female', allergies: [] },
    doctor: 'Dr. Sana Malik',
    department: 'General Medicine',
    date: '2026-03-29 09:30',
    diagnosis: 'Upper Respiratory Tract Infection',
    medicines: [
      { id: 'pm3', name: 'Amoxicillin 500mg', dosage: '500mg', frequency: '3 times daily', duration: '7 days', quantity: 21 },
      { id: 'pm4', name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once before breakfast', duration: '14 days', quantity: 14 },
      { id: 'pm5', name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once at night', duration: '5 days', quantity: 5 },
    ],
    status: 'pending',
  },
  {
    id: 'rx-v3',
    rxNumber: 'RX-20260329-003',
    patient: { name: 'Usman Tariq', mrn: 'MR-10236', age: 42, gender: 'Male', allergies: ['NSAIDs'] },
    doctor: 'Dr. Asif Javed',
    department: 'Orthopedics',
    date: '2026-03-29 10:00',
    diagnosis: 'Acute Lower Back Pain',
    medicines: [
      { id: 'pm6', name: 'Diclofenac 50mg', dosage: '50mg', frequency: 'Twice daily after meals', duration: '7 days', quantity: 14 },
      { id: 'pm7', name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once before breakfast', duration: '7 days', quantity: 7 },
    ],
    status: 'pending',
  },
  {
    id: 'rx-v4',
    rxNumber: 'RX-20260329-004',
    patient: { name: 'Bilal Hussain', mrn: 'MR-10237', age: 60, gender: 'Male', allergies: ['Aspirin'] },
    doctor: 'Dr. Nadia Qureshi',
    department: 'Endocrinology',
    date: '2026-03-29 10:20',
    diagnosis: 'Type 2 Diabetes with Hypertension',
    medicines: [
      { id: 'pm8', name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', quantity: 60 },
      { id: 'pm9', name: 'Losartan 50mg', dosage: '50mg', frequency: 'Once in morning', duration: '30 days', quantity: 30 },
    ],
    status: 'pending',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function autoMatchProduct(medicineName: string): InventoryProduct | null {
  const lower = medicineName.toLowerCase();
  return inventoryProducts.find((p) => p.name.toLowerCase() === lower) || null;
}

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusConfig: Record<VerifyStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  verified: { label: 'Verified', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  dispensed: { label: 'Dispensed', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrescriptionVerify() {
  const [prescriptions, setPrescriptions] = useState(demoPrescriptions);
  const [selectedRxId, setSelectedRxId] = useState<string | null>(demoPrescriptions[0]?.id || null);
  const [dispenseMap, setDispenseMap] = useState<Record<string, DispenseItem[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [substituteModalFor, setSubstituteModalFor] = useState<{ rxId: string; prescribedId: string } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedRx = prescriptions.find((rx) => rx.id === selectedRxId) || null;

  // Initialize dispense items for a prescription
  const getDispenseItems = (rx: Prescription): DispenseItem[] => {
    if (dispenseMap[rx.id]) return dispenseMap[rx.id];
    const items: DispenseItem[] = rx.medicines.map((med) => {
      const matched = autoMatchProduct(med.name);
      return {
        prescribedId: med.id,
        selectedProduct: matched,
        dispensedQty: med.quantity,
        isSubstitution: false,
        substitutionReason: '',
        verified: false,
      };
    });
    return items;
  };

  const updateDispenseItem = (rxId: string, prescribedId: string, updates: Partial<DispenseItem>) => {
    setDispenseMap((prev) => {
      const rx = prescriptions.find((r) => r.id === rxId);
      if (!rx) return prev;
      const items = prev[rxId] || getDispenseItems(rx);
      return {
        ...prev,
        [rxId]: items.map((item) =>
          item.prescribedId === prescribedId ? { ...item, ...updates } : item
        ),
      };
    });
  };

  const toggleVerified = (rxId: string, prescribedId: string) => {
    const rx = prescriptions.find((r) => r.id === rxId);
    if (!rx) return;
    const items = dispenseMap[rxId] || getDispenseItems(rx);
    const item = items.find((i) => i.prescribedId === prescribedId);
    if (item) {
      updateDispenseItem(rxId, prescribedId, { verified: !item.verified });
    }
  };

  const selectSubstitute = (rxId: string, prescribedId: string, product: InventoryProduct) => {
    updateDispenseItem(rxId, prescribedId, {
      selectedProduct: product,
      isSubstitution: true,
    });
    setSubstituteModalFor(null);
  };

  const allVerified = (rxId: string) => {
    const rx = prescriptions.find((r) => r.id === rxId);
    if (!rx) return false;
    const items = dispenseMap[rxId] || getDispenseItems(rx);
    return items.every((i) => i.verified && i.selectedProduct);
  };

  const verifyAndDispense = (rxId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === rxId ? { ...rx, status: 'dispensed' as const } : rx))
    );
    showToast('Prescription verified and dispensed successfully');
    // Move to next pending
    const nextPending = prescriptions.find((rx) => rx.id !== rxId && rx.status === 'pending');
    if (nextPending) setSelectedRxId(nextPending.id);
  };

  const pendingCount = prescriptions.filter((rx) => rx.status === 'pending').length;
  const verifiedCount = prescriptions.filter((rx) => rx.status === 'verified').length;
  const dispensedCount = prescriptions.filter((rx) => rx.status === 'dispensed').length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ===== LEFT: Prescription List ===== */}
      <aside className="w-80 shrink-0 border-r border-[var(--pos-border)] flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--pos-border)]">
          <h2 className="text-base font-bold text-[var(--pos-text)] flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-[var(--pos-accent)]" />
            Prescription Queue
          </h2>
          <div className="flex gap-2 mt-3">
            <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold">{pendingCount} Pending</span>
            <span className="px-2 py-1 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-bold">{verifiedCount} Verified</span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">{dispensedCount} Dispensed</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {prescriptions.map((rx) => {
            const sConfig = statusConfig[rx.status];
            return (
              <button
                key={rx.id}
                onClick={() => setSelectedRxId(rx.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-[var(--pos-border)] transition-colors',
                  selectedRxId === rx.id ? 'bg-[var(--pos-accent)]/10' : 'hover:bg-white/[0.02]'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[var(--pos-accent)]">{rx.rxNumber}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold uppercase', sConfig.bg, sConfig.text)}>
                    {sConfig.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--pos-text)]">{rx.patient.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rx.doctor} &middot; {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ===== RIGHT: Verification Panel ===== */}
      {selectedRx ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Patient Allergies Banner */}
          {selectedRx.patient.allergies.length > 0 && (
            <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <Shield className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">Patient Allergies</p>
                <p className="text-xs text-red-400/80 mt-0.5">{selectedRx.patient.allergies.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Patient + Doctor Info */}
          <div className="grid grid-cols-2 gap-4 px-5 pt-4 pb-2">
            <div className="pos-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[var(--pos-accent)]" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Patient</span>
              </div>
              <p className="text-sm font-semibold text-[var(--pos-text)]">{selectedRx.patient.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedRx.patient.mrn} &middot; {selectedRx.patient.age}y &middot; {selectedRx.patient.gender}</p>
              <p className="text-xs text-gray-500 mt-0.5">Dx: {selectedRx.diagnosis}</p>
            </div>
            <div className="pos-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-[var(--pos-accent)]" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Prescriber</span>
              </div>
              <p className="text-sm font-semibold text-[var(--pos-text)]">{selectedRx.doctor}</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedRx.department}</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedRx.date}</p>
            </div>
          </div>

          {/* Split View: Prescribed vs Dispensed */}
          <div className="flex-1 overflow-auto px-5 pb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* LEFT COLUMN: Original Prescription */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5" />
                  Prescribed Medicines
                </h3>
                <div className="space-y-3">
                  {selectedRx.medicines.map((med, idx) => (
                    <div key={med.id} className="pos-card rounded-xl p-4 border border-[var(--pos-border)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--pos-text)]">
                            {idx + 1}. {med.name}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-400">
                              <span className="text-gray-600">Dosage:</span> {med.dosage}
                            </p>
                            <p className="text-xs text-gray-400">
                              <span className="text-gray-600">Frequency:</span> {med.frequency}
                            </p>
                            <p className="text-xs text-gray-400">
                              <span className="text-gray-600">Duration:</span> {med.duration}
                            </p>
                            <p className="text-xs text-gray-400">
                              <span className="text-gray-600">Quantity:</span> <span className="font-semibold text-[var(--pos-text)]">{med.quantity}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Dispensing Panel */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Dispensing
                </h3>
                <div className="space-y-3">
                  {selectedRx.medicines.map((med, idx) => {
                    const items = dispenseMap[selectedRx.id] || getDispenseItems(selectedRx);
                    const dispItem = items.find((d) => d.prescribedId === med.id) || {
                      prescribedId: med.id,
                      selectedProduct: autoMatchProduct(med.name),
                      dispensedQty: med.quantity,
                      isSubstitution: false,
                      substitutionReason: '',
                      verified: false,
                    };

                    return (
                      <div
                        key={med.id}
                        className={cn(
                          'pos-card rounded-xl p-4 border transition-all',
                          dispItem.verified
                            ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                            : dispItem.isSubstitution
                            ? 'border-amber-500/30 bg-amber-500/[0.03]'
                            : 'border-[var(--pos-border)]'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-[var(--pos-text)]">{idx + 1}. Dispense for: {med.name}</p>
                          <button
                            onClick={() => toggleVerified(selectedRx.id, med.id)}
                            className={cn(
                              'w-6 h-6 rounded-md flex items-center justify-center transition-all',
                              dispItem.verified
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 text-gray-600 hover:bg-white/10'
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Matched Product */}
                        {dispItem.selectedProduct ? (
                          <div className="bg-white/[0.03] rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-[var(--pos-text)]">{dispItem.selectedProduct.name}</p>
                                <p className="text-xs text-gray-500">{dispItem.selectedProduct.code} &middot; Stock: {dispItem.selectedProduct.stock} {dispItem.selectedProduct.unit}</p>
                              </div>
                              <span className="text-sm font-semibold text-[var(--pos-accent)]">{formatRs(dispItem.selectedProduct.price)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-2">
                            <p className="text-xs text-red-400">No matching product in inventory</p>
                          </div>
                        )}

                        {/* Substitution Warning */}
                        {dispItem.isSubstitution && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-xs text-amber-400">Substitution selected</span>
                          </div>
                        )}

                        {/* Quantity + Substitution Reason */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Dispense Qty</label>
                            <input
                              type="number"
                              min={0}
                              value={dispItem.dispensedQty}
                              onChange={(e) => updateDispenseItem(selectedRx.id, med.id, { dispensedQty: parseInt(e.target.value) || 0 })}
                              className={cn(
                                'w-full h-9 px-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm text-center tabular-nums focus:outline-none focus:border-[var(--pos-accent)]',
                                dispItem.dispensedQty !== med.quantity && 'border-amber-500/30'
                              )}
                            />
                            {dispItem.dispensedQty !== med.quantity && (
                              <p className="text-[10px] text-amber-400 mt-0.5">Prescribed: {med.quantity}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Actions</label>
                            <button
                              onClick={() => setSubstituteModalFor({ rxId: selectedRx.id, prescribedId: med.id })}
                              className="w-full h-9 px-3 rounded-lg bg-white/5 border border-[var(--pos-border)] text-gray-400 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Substitute
                            </button>
                          </div>
                        </div>

                        {/* Substitution Reason */}
                        {dispItem.isSubstitution && (
                          <div className="mt-2">
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Substitution Reason</label>
                            <input
                              type="text"
                              value={dispItem.substitutionReason}
                              onChange={(e) => updateDispenseItem(selectedRx.id, med.id, { substitutionReason: e.target.value })}
                              placeholder="Reason for substitution..."
                              className="w-full h-8 px-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-xs focus:outline-none focus:border-[var(--pos-accent)]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Verify & Dispense */}
          {selectedRx.status === 'pending' && (
            <div className="px-5 py-4 border-t border-[var(--pos-border)] flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {(() => {
                  const items = dispenseMap[selectedRx.id] || getDispenseItems(selectedRx);
                  const vCount = items.filter((i) => i.verified).length;
                  return `${vCount} / ${selectedRx.medicines.length} items verified`;
                })()}
              </div>
              <button
                onClick={() => verifyAndDispense(selectedRx.id)}
                disabled={!allVerified(selectedRx.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all',
                  allVerified(selectedRx.id)
                    ? 'bg-[var(--pos-accent)] text-white hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                Verify & Dispense
              </button>
            </div>
          )}

          {selectedRx.status === 'dispensed' && (
            <div className="px-5 py-4 border-t border-[var(--pos-border)] flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">This prescription has been dispensed</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-sm text-gray-500">Select a prescription from the queue</p>
        </div>
      )}

      {/* ===== Substitute Modal ===== */}
      {substituteModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSubstituteModalFor(null); }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#141c2e] border border-[var(--pos-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col" style={{ animationDuration: '0.2s' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--pos-border)]">
              <h2 className="text-base font-bold text-[var(--pos-text)]">Select Substitute Product</h2>
              <button onClick={() => setSubstituteModalFor(null)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {inventoryProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => selectSubstitute(substituteModalFor.rxId, substituteModalFor.prescribedId, product)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--pos-border)] hover:bg-[var(--pos-accent)]/10 hover:border-[var(--pos-accent)]/30 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--pos-text)]">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.code} &middot; {product.genericName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--pos-accent)]">{formatRs(product.price)}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500/90 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 animate-[slideUp_0.3s_ease-out]">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
