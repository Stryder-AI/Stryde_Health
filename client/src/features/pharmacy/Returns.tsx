import { useState, useMemo } from 'react';
import {
  Search, RotateCcw, X, CheckCircle, Package, ArrowLeftRight,
  Calendar, Receipt, AlertTriangle, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SaleItem {
  id: string;
  name: string;
  code: string;
  qty: number;
  price: number;
  unit: string;
}

interface PastSale {
  id: string;
  saleNumber: string;
  date: string;
  time: string;
  patient: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
}

interface ReturnItem {
  saleItemId: string;
  returnQty: number;
  reason: ReturnReason;
  exchangeProduct: string | null;
}

type ReturnReason = 'Damaged' | 'Wrong Product' | 'Expired' | 'Customer Request' | 'Allergic Reaction' | 'Other';

interface ReturnRecord {
  id: string;
  returnNumber: string;
  originalSale: string;
  date: string;
  patient: string;
  items: { name: string; qty: number; reason: string; refund: number }[];
  totalRefund: number;
  type: 'refund' | 'exchange';
  status: 'completed' | 'pending';
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const pastSales: PastSale[] = [
  {
    id: 'ps1', saleNumber: 'SL-00001048', date: '2026-03-29', time: '10:45 AM', patient: 'Ahmed Raza',
    items: [
      { id: 'si1', name: 'Amlodipine 5mg', code: 'TAB-001', qty: 30, price: 12.50, unit: 'Tab' },
      { id: 'si2', name: 'Atorvastatin 20mg', code: 'TAB-006', qty: 30, price: 18.00, unit: 'Tab' },
      { id: 'si3', name: 'Omeprazole 20mg', code: 'TAB-005', qty: 14, price: 10.00, unit: 'Cap' },
      { id: 'si4', name: 'Cetirizine 10mg', code: 'TAB-010', qty: 10, price: 4.00, unit: 'Tab' },
    ],
    total: 1055.00, paymentMethod: 'Cash',
  },
  {
    id: 'ps2', saleNumber: 'SL-00001047', date: '2026-03-29', time: '10:22 AM', patient: 'Fatima Bibi',
    items: [
      { id: 'si5', name: 'Amoxicillin 500mg', code: 'TAB-003', qty: 21, price: 15.00, unit: 'Cap' },
      { id: 'si6', name: 'Calpol Syrup 120ml', code: 'SYR-001', qty: 2, price: 85.00, unit: 'Btl' },
    ],
    total: 485.00, paymentMethod: 'EasyPaisa',
  },
  {
    id: 'ps3', saleNumber: 'SL-00001046', date: '2026-03-29', time: '09:58 AM', patient: 'Walk-in',
    items: [
      { id: 'si7', name: 'Paracetamol 500mg', code: 'TAB-004', qty: 20, price: 3.50, unit: 'Tab' },
    ],
    total: 70.00, paymentMethod: 'Cash',
  },
  {
    id: 'ps4', saleNumber: 'SL-00001045', date: '2026-03-28', time: '04:35 PM', patient: 'Usman Tariq',
    items: [
      { id: 'si8', name: 'Diclofenac 50mg', code: 'TAB-009', qty: 14, price: 5.00, unit: 'Tab' },
      { id: 'si9', name: 'Crepe Bandage 6inch', code: 'BND-001', qty: 2, price: 45.00, unit: 'Pc' },
      { id: 'si10', name: 'Betnovate Cream 20g', code: 'CRM-001', qty: 1, price: 95.00, unit: 'Tube' },
      { id: 'si11', name: 'Ciprofloxacin 500mg', code: 'TAB-007', qty: 10, price: 12.00, unit: 'Tab' },
      { id: 'si12', name: 'Omeprazole 20mg', code: 'TAB-005', qty: 7, price: 10.00, unit: 'Cap' },
    ],
    total: 425.00, paymentMethod: 'Card',
  },
  {
    id: 'ps5', saleNumber: 'SL-00001044', date: '2026-03-28', time: '02:12 PM', patient: 'Ayesha Noor',
    items: [
      { id: 'si13', name: 'Metformin 500mg', code: 'TAB-002', qty: 60, price: 8.00, unit: 'Tab' },
      { id: 'si14', name: 'Losartan 50mg', code: 'TAB-008', qty: 30, price: 14.00, unit: 'Tab' },
      { id: 'si15', name: 'Cetirizine 10mg', code: 'TAB-010', qty: 10, price: 4.00, unit: 'Tab' },
    ],
    total: 940.00, paymentMethod: 'Cash',
  },
];

const demoReturnHistory: ReturnRecord[] = [
  {
    id: 'ret1', returnNumber: 'RT-00000012', originalSale: 'SL-00001040', date: '2026-03-27', patient: 'Kamran Ali',
    items: [{ name: 'Calpol Syrup 120ml', qty: 1, reason: 'Damaged', refund: 85.00 }],
    totalRefund: 85.00, type: 'refund', status: 'completed',
  },
  {
    id: 'ret2', returnNumber: 'RT-00000011', originalSale: 'SL-00001038', date: '2026-03-26', patient: 'Sadia Bibi',
    items: [
      { name: 'Amoxicillin 500mg', qty: 7, reason: 'Allergic Reaction', refund: 105.00 },
    ],
    totalRefund: 105.00, type: 'refund', status: 'completed',
  },
  {
    id: 'ret3', returnNumber: 'RT-00000010', originalSale: 'SL-00001035', date: '2026-03-25', patient: 'Imran Khan',
    items: [{ name: 'Betnovate Cream 20g', qty: 1, reason: 'Wrong Product', refund: 95.00 }],
    totalRefund: 95.00, type: 'exchange', status: 'completed',
  },
];

const returnReasons: ReturnReason[] = ['Damaged', 'Wrong Product', 'Expired', 'Customer Request', 'Allergic Reaction', 'Other'];

const exchangeProducts = [
  'Amlodipine 5mg', 'Metformin 500mg', 'Omeprazole 20mg', 'Cetirizine 10mg',
  'Paracetamol 500mg', 'Losartan 50mg', 'Diclofenac 50mg', 'Calpol Syrup 120ml',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<PastSale | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnHistory, setReturnHistory] = useState(demoReturnHistory);
  const [confirmModal, setConfirmModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Search sales
  const filteredSales = useMemo(() => {
    if (!searchTerm) return pastSales;
    const q = searchTerm.toLowerCase();
    return pastSales.filter(
      (s) =>
        s.saleNumber.toLowerCase().includes(q) ||
        s.patient.toLowerCase().includes(q) ||
        s.date.includes(q)
    );
  }, [searchTerm]);

  const selectSale = (sale: PastSale) => {
    setSelectedSale(sale);
    setReturnItems([]);
  };

  const toggleReturnItem = (saleItemId: string) => {
    setReturnItems((prev) => {
      const existing = prev.find((r) => r.saleItemId === saleItemId);
      if (existing) return prev.filter((r) => r.saleItemId !== saleItemId);
      const saleItem = selectedSale?.items.find((i) => i.id === saleItemId);
      return [
        ...prev,
        {
          saleItemId,
          returnQty: saleItem?.qty || 1,
          reason: 'Customer Request' as ReturnReason,
          exchangeProduct: null,
        },
      ];
    });
  };

  const updateReturnItem = (saleItemId: string, updates: Partial<ReturnItem>) => {
    setReturnItems((prev) =>
      prev.map((r) => (r.saleItemId === saleItemId ? { ...r, ...updates } : r))
    );
  };

  const refundTotal = useMemo(() => {
    if (!selectedSale) return 0;
    return returnItems.reduce((sum, ri) => {
      const saleItem = selectedSale.items.find((i) => i.id === ri.saleItemId);
      if (!saleItem) return sum;
      return sum + saleItem.price * ri.returnQty;
    }, 0);
  }, [returnItems, selectedSale]);

  const processReturn = () => {
    if (!selectedSale || returnItems.length === 0) return;
    const newReturn: ReturnRecord = {
      id: `ret-${Date.now()}`,
      returnNumber: `RT-${Date.now().toString().slice(-8)}`,
      originalSale: selectedSale.saleNumber,
      date: '2026-03-29',
      patient: selectedSale.patient,
      items: returnItems.map((ri) => {
        const saleItem = selectedSale.items.find((i) => i.id === ri.saleItemId)!;
        return {
          name: saleItem.name,
          qty: ri.returnQty,
          reason: ri.reason,
          refund: saleItem.price * ri.returnQty,
        };
      }),
      totalRefund: refundTotal,
      type: returnItems.some((ri) => ri.exchangeProduct) ? 'exchange' : 'refund',
      status: 'completed',
    };
    setReturnHistory((prev) => [newReturn, ...prev]);
    setConfirmModal(false);
    setSelectedSale(null);
    setReturnItems([]);
    showToast(`Return processed: ${newReturn.returnNumber} - Refund: ${formatRs(refundTotal)}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--pos-text)] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[var(--pos-accent)]" />
            Returns & Exchanges
          </h1>
          <p className="text-sm text-gray-500 mt-1">Process product returns and exchanges</p>
        </div>
      </div>

      {/* Lookup Section */}
      <div className="pos-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pos-text)] mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-[var(--pos-accent)]" />
          Look Up Original Sale
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by sale number, patient name, or date..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm placeholder:text-gray-500 focus:outline-none focus:border-[var(--pos-accent)]"
          />
        </div>

        {/* Sales Results */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredSales.map((sale) => (
            <button
              key={sale.id}
              onClick={() => selectSale(sale)}
              className={cn(
                'w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-all',
                selectedSale?.id === sale.id
                  ? 'border-[var(--pos-accent)]/40 bg-[var(--pos-accent)]/10'
                  : 'border-[var(--pos-border)] hover:bg-white/[0.02]'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-[var(--pos-accent)]">{sale.saleNumber}</span>
                  <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-white/5">{sale.paymentMethod}</span>
                </div>
                <p className="text-sm text-[var(--pos-text)]">{sale.patient}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <Calendar className="w-3 h-3 inline mr-1" />{sale.date} {sale.time} &middot; {sale.items.length} items
                </p>
              </div>
              <span className="text-sm font-semibold text-[var(--pos-text)] shrink-0">{formatRs(sale.total)}</span>
              <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Return Processing */}
      {selectedSale && (
        <div className="pos-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--pos-text)] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--pos-accent)]" />
                Return Items from {selectedSale.saleNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{selectedSale.patient} &middot; {selectedSale.date}</p>
            </div>
            <button
              onClick={() => { setSelectedSale(null); setReturnItems([]); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items to return */}
          <div className="space-y-3">
            {selectedSale.items.map((item) => {
              const ri = returnItems.find((r) => r.saleItemId === item.id);
              const isSelected = !!ri;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-xl border p-4 transition-all',
                    isSelected ? 'border-[var(--pos-accent)]/30 bg-[var(--pos-accent)]/[0.03]' : 'border-[var(--pos-border)]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleReturnItem(item.id)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all',
                        isSelected
                          ? 'bg-[var(--pos-accent)] border-[var(--pos-accent)] text-white'
                          : 'border-gray-600 hover:border-gray-400'
                      )}
                    >
                      {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--pos-text)]">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.code} &middot; Sold: {item.qty} {item.unit} @ {formatRs(item.price)}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-300 tabular-nums">{formatRs(item.price * item.qty)}</span>
                      </div>

                      {/* Return details when selected */}
                      {isSelected && ri && (
                        <div className="grid grid-cols-3 gap-3 mt-3 animate-fade-in" style={{ animationDuration: '0.15s' }}>
                          {/* Return Qty */}
                          <div>
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Return Qty</label>
                            <input
                              type="number"
                              min={1}
                              max={item.qty}
                              value={ri.returnQty}
                              onChange={(e) => updateReturnItem(item.id, { returnQty: Math.min(item.qty, Math.max(1, parseInt(e.target.value) || 1)) })}
                              className="w-full h-9 px-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm text-center tabular-nums focus:outline-none focus:border-[var(--pos-accent)]"
                            />
                          </div>

                          {/* Reason */}
                          <div>
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Reason</label>
                            <select
                              value={ri.reason}
                              onChange={(e) => updateReturnItem(item.id, { reason: e.target.value as ReturnReason })}
                              className="w-full h-9 px-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-xs focus:outline-none focus:border-[var(--pos-accent)] appearance-none cursor-pointer"
                            >
                              {returnReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>

                          {/* Exchange Product */}
                          <div>
                            <label className="block text-[10px] text-gray-600 uppercase tracking-wider mb-1">Exchange (optional)</label>
                            <select
                              value={ri.exchangeProduct || ''}
                              onChange={(e) => updateReturnItem(item.id, { exchangeProduct: e.target.value || null })}
                              className="w-full h-9 px-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-xs focus:outline-none focus:border-[var(--pos-accent)] appearance-none cursor-pointer"
                            >
                              <option value="">No exchange</option>
                              {exchangeProducts.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>

                          {/* Refund amount */}
                          <div className="col-span-3 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
                            <span className="text-xs text-gray-400">Refund for this item</span>
                            <span className="text-sm font-semibold text-[var(--pos-accent)] tabular-nums">
                              {formatRs(item.price * ri.returnQty)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refund Summary + Process */}
          {returnItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--pos-border)] flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{returnItems.length} item{returnItems.length !== 1 ? 's' : ''} to return</p>
                <p className="text-lg font-bold text-[var(--pos-accent)] tabular-nums mt-0.5">Refund: {formatRs(refundTotal)}</p>
              </div>
              <button
                onClick={() => setConfirmModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-bold hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Process Return
              </button>
            </div>
          )}
        </div>
      )}

      {/* Returns History */}
      <div className="pos-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pos-text)] mb-4 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-gray-400" />
          Returns History
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--pos-border)]">
              {['Return #', 'Original Sale', 'Date', 'Patient', 'Items', 'Refund', 'Type', 'Status'].map((h) => (
                <th key={h} className="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returnHistory.map((ret) => (
              <tr key={ret.id} className="border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 text-xs font-mono text-[var(--pos-accent)]">{ret.returnNumber}</td>
                <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{ret.originalSale}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{ret.date}</td>
                <td className="px-4 py-2.5 text-sm text-[var(--pos-text)]">{ret.patient}</td>
                <td className="px-4 py-2.5">
                  {ret.items.map((item, i) => (
                    <p key={i} className="text-xs text-gray-400">{item.name} x{item.qty} ({item.reason})</p>
                  ))}
                </td>
                <td className="px-4 py-2.5 text-sm font-semibold text-red-400 tabular-nums">{formatRs(ret.totalRefund)}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                    ret.type === 'exchange' ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {ret.type}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase">
                    {ret.status}
                  </span>
                </td>
              </tr>
            ))}
            {returnHistory.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Package className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No return history</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(false); }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--pos-border)]">
              <h2 className="text-base font-bold text-[var(--pos-text)]">Confirm Return</h2>
              <button onClick={() => setConfirmModal(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-400">This action will refund the customer and adjust stock accordingly.</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Items to Return</p>
                {returnItems.map((ri) => {
                  const saleItem = selectedSale.items.find((i) => i.id === ri.saleItemId)!;
                  return (
                    <div key={ri.saleItemId} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                      <div>
                        <p className="text-sm text-[var(--pos-text)]">{saleItem.name}</p>
                        <p className="text-xs text-gray-500">Qty: {ri.returnQty} &middot; {ri.reason}</p>
                        {ri.exchangeProduct && (
                          <p className="text-xs text-blue-400 mt-0.5 flex items-center gap-1">
                            <ArrowLeftRight className="w-3 h-3" /> Exchange: {ri.exchangeProduct}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-red-400 tabular-nums">{formatRs(saleItem.price * ri.returnQty)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-sm text-red-400 font-medium">Total Refund</span>
                <span className="text-xl font-bold text-red-400 tabular-nums">{formatRs(refundTotal)}</span>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processReturn}
                className="flex-1 py-3 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-bold hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Return
              </button>
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
