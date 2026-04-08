import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ShoppingCart,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types & Expiry Logic                                               */
/* ------------------------------------------------------------------ */

interface ExpiryItem {
  id: string;
  code: string;
  name: string;
  batch: string;
  group: string;
  qty: number;
  unit: string;
  expiryDate: string;
}

type ExpiryStatus = 'expired' | 'lt30' | 'lt60' | 'ok';

const TODAY = new Date();

function daysUntilExpiry(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(dateStr: string): ExpiryStatus {
  const d = daysUntilExpiry(dateStr);
  if (d <= 0) return 'expired';
  if (d <= 30) return 'lt30';
  if (d <= 60) return 'lt60';
  return 'ok';
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const demoItems: ExpiryItem[] = [
  { id: '1', code: 'TAB-003', name: 'Amoxicillin 500mg', batch: 'BT-2023-0412', group: 'Antibiotics', qty: 320, unit: 'Cap', expiryDate: '2025-12-31' },
  { id: '2', code: 'TAB-006', name: 'Atorvastatin 20mg', batch: 'BT-2023-0619', group: 'Cardiovascular', qty: 45, unit: 'Tab', expiryDate: '2026-02-28' },
  { id: '3', code: 'INJ-001', name: 'Normal Saline 1000ml', batch: 'BT-2024-0301', group: 'IV Fluids', qty: 200, unit: 'Bag', expiryDate: '2026-03-15' },
  { id: '4', code: 'DRP-001', name: 'Ciprofloxacin Eye Drops', batch: 'BT-2023-1102', group: 'Eye/Ear Drops', qty: 0, unit: 'Btl', expiryDate: '2026-02-10' },
  { id: '5', code: 'TAB-018', name: 'Gabapentin 300mg', batch: 'BT-2023-0808', group: 'Neurological', qty: 55, unit: 'Cap', expiryDate: '2025-11-30' },
  { id: '6', code: 'TAB-025', name: 'Ranitidine 150mg', batch: 'BT-2023-0701', group: 'GI / Antacids', qty: 0, unit: 'Tab', expiryDate: '2025-10-31' },
  { id: '7', code: 'SYR-001', name: 'Calpol Syrup 120ml', batch: 'BT-2025-1210', group: 'Pediatric', qty: 12, unit: 'Btl', expiryDate: '2026-04-25' },
  { id: '8', code: 'INJ-006', name: 'Enoxaparin 40mg', batch: 'BT-2025-1015', group: 'Injectables', qty: 3, unit: 'Syringe', expiryDate: '2026-04-15' },
  { id: '9', code: 'TAB-022', name: 'Tramadol 50mg', batch: 'BT-2025-1130', group: 'Analgesics', qty: 97, unit: 'Tab', expiryDate: '2026-04-30' },
  { id: '10', code: 'CRM-001', name: 'Betnovate Cream 20g', batch: 'BT-2025-0820', group: 'Topical', qty: 80, unit: 'Tube', expiryDate: '2026-05-31' },
  { id: '11', code: 'INJ-002', name: 'Ceftriaxone 1g Inj', batch: 'BT-2025-0910', group: 'Injectables', qty: 8, unit: 'Vial', expiryDate: '2026-06-10' },
  { id: '12', code: 'SYR-002', name: 'Ambroxol Syrup 100ml', batch: 'BT-2025-1105', group: 'Respiratory', qty: 110, unit: 'Btl', expiryDate: '2026-05-20' },
  { id: '13', code: 'TAB-001', name: 'Amlodipine 5mg', batch: 'BT-2025-0630', group: 'Cardiovascular', qty: 450, unit: 'Tab', expiryDate: '2027-06-15' },
  { id: '14', code: 'TAB-004', name: 'Paracetamol 500mg', batch: 'BT-2026-0101', group: 'Analgesics', qty: 1500, unit: 'Tab', expiryDate: '2028-03-31' },
];

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */

const statusConfig: Record<ExpiryStatus, { label: string; color: string; bg: string; border: string; rowBg: string }> = {
  expired: { label: 'EXPIRED', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', rowBg: 'bg-red-500/5' },
  lt30: { label: 'Expiring Soon', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', rowBg: 'bg-amber-500/5' },
  lt60: { label: 'Expiring in 60d', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', rowBg: 'bg-yellow-500/5' },
  ok: { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', rowBg: '' },
};

/* ------------------------------------------------------------------ */
/*  Confirmation Dialog                                                */
/* ------------------------------------------------------------------ */

function ConfirmWriteOff({
  item,
  onConfirm,
  onCancel,
}: {
  item: ExpiryItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--pos-text)]">Write Off Expired Stock</h3>
            <p className="text-sm text-gray-400 mt-1">
              Are you sure you want to write off <strong className="text-[var(--pos-text)]">{item.qty} {item.unit}</strong> of <strong className="text-[var(--pos-text)]">{item.name}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Write Off</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type FilterStatus = 'all' | ExpiryStatus;

export function ExpiryAlerts() {
  const [items, setItems] = useState(demoItems);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [writeOffItem, setWriteOffItem] = useState<ExpiryItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
    [items],
  );

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return sortedItems;
    return sortedItems.filter((i) => getStatus(i.expiryDate) === filterStatus);
  }, [sortedItems, filterStatus]);

  const expiredCount = items.filter((i) => getStatus(i.expiryDate) === 'expired').length;
  const lt30Count = items.filter((i) => getStatus(i.expiryDate) === 'lt30').length;
  const lt60Count = items.filter((i) => getStatus(i.expiryDate) === 'lt60').length;
  const okCount = items.filter((i) => getStatus(i.expiryDate) === 'ok').length;

  const handleWriteOff = (item: ExpiryItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setWriteOffItem(null);
    showNotification(`${item.name} (${item.batch}) has been written off.`);
  };

  const handleOrderReplacement = (item: ExpiryItem) => {
    showNotification(`Order created for replacement of ${item.name}.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--pos-bg)]">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium shadow-lg max-w-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {notification}
          <button onClick={() => setNotification(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <h1 className="text-xl font-bold text-[var(--pos-text)]">Expiry Alerts</h1>
        </div>
        <p className="text-sm text-gray-500">Monitor and manage product expiry dates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-4">
        {([
          { key: 'expired' as const, label: 'Expired', count: expiredCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
          { key: 'lt30' as const, label: 'Expiring < 30 days', count: lt30Count, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
          { key: 'lt60' as const, label: 'Expiring < 60 days', count: lt60Count, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock },
          { key: 'ok' as const, label: 'Normal', count: okCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
        ]).map(({ key, label, count, color, bg, border, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={cn(
              'pos-card rounded-xl px-4 py-3 text-left transition-all border',
              filterStatus === key ? border : 'border-transparent',
              filterStatus === key ? bg : '',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('w-4 h-4', color)} />
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
            <p className={cn('text-2xl font-bold tabular-nums', color)}>{count}</p>
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 px-5 pb-3">
        <span className="text-xs text-gray-500">Filter:</span>
        {(['all', 'expired', 'lt30', 'lt60', 'ok'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              filterStatus === key
                ? 'bg-[var(--pos-accent)]/20 text-[var(--pos-accent)]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300',
            )}
          >
            {key === 'all' ? 'All' : key === 'lt30' ? '< 30 days' : key === 'lt60' ? '< 60 days' : key === 'ok' ? 'Normal' : 'Expired'}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-5 pb-5">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--pos-surface)] border-b border-[var(--pos-border)]">
              {['Product', 'Batch #', 'Stock Qty', 'Expiry Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = getStatus(item.expiryDate);
              const cfg = statusConfig[status];
              const days = daysUntilExpiry(item.expiryDate);
              const formattedDate = new Date(item.expiryDate).toLocaleDateString('en-PK', {
                day: '2-digit', month: 'short', year: 'numeric',
              });
              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors',
                    cfg.rowBg,
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--pos-text)]">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.code} · {item.group}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-400">{item.batch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-bold tabular-nums', item.qty <= 0 ? 'text-gray-600' : 'text-[var(--pos-text)]')}>
                      {item.qty} {item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className={cn('text-sm font-semibold', cfg.color)}>{formattedDate}</p>
                    {days <= 0
                      ? <p className="text-xs text-red-400/70">Expired {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} ago</p>
                      : <p className="text-xs text-gray-600">In {days} day{days !== 1 ? 's' : ''}</p>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border',
                      cfg.color, cfg.bg, cfg.border,
                    )}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {status === 'expired' && item.qty > 0 && (
                        <button
                          onClick={() => setWriteOffItem(item)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Write Off
                        </button>
                      )}
                      <button
                        onClick={() => handleOrderReplacement(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--pos-accent)]/10 text-[var(--pos-accent)] text-xs font-semibold hover:bg-[var(--pos-accent)]/20 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Order Replacement
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No items match the selected filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Write Off Confirm Dialog */}
      {writeOffItem && (
        <ConfirmWriteOff
          item={writeOffItem}
          onConfirm={() => handleWriteOff(writeOffItem)}
          onCancel={() => setWriteOffItem(null)}
        />
      )}
    </div>
  );
}
