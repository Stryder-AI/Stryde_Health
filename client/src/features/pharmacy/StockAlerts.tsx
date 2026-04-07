import { useState, useMemo } from 'react';
import {
  AlertTriangle, Package, ShoppingCart, X, CheckCircle,
  Filter, Bell, TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AlertItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  group: string;
  currentQty: number;
  reorderLevel: number;
  unit: string;
  costPrice: number;
  salePrice: number;
  supplier: string;
}

type Severity = 'critical' | 'low' | 'warning';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const alertItems: AlertItem[] = [
  { id: '1', code: 'DRP-001', name: 'Ciprofloxacin Eye Drops', genericName: 'Ciprofloxacin 0.3%', group: 'Eye / Ear Drops', currentQty: 0, reorderLevel: 20, unit: 'Btl', costPrice: 38.00, salePrice: 65.00, supplier: 'Remington Pharma' },
  { id: '2', code: 'TAB-013', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', group: 'Respiratory', currentQty: 0, reorderLevel: 40, unit: 'Tab', costPrice: 14.00, salePrice: 22.00, supplier: 'Sami Pharma' },
  { id: '3', code: 'TAB-025', name: 'Ranitidine 150mg', genericName: 'Ranitidine HCl', group: 'GI / Antacids', currentQty: 0, reorderLevel: 100, unit: 'Tab', costPrice: 3.50, salePrice: 6.00, supplier: 'Pharmevo' },
  { id: '4', code: 'INJ-006', name: 'Enoxaparin 40mg', genericName: 'Enoxaparin Sodium', group: 'Injectables', currentQty: 3, reorderLevel: 8, unit: 'Syringe', costPrice: 350.00, salePrice: 500.00, supplier: 'Sanofi' },
  { id: '5', code: 'INJ-002', name: 'Ceftriaxone 1g Inj', genericName: 'Ceftriaxone Sodium', group: 'Injectables', currentQty: 8, reorderLevel: 20, unit: 'Vial', costPrice: 120.00, salePrice: 180.00, supplier: 'Getz Pharma' },
  { id: '6', code: 'SYR-001', name: 'Calpol Syrup 120ml', genericName: 'Paracetamol', group: 'Pediatric', currentQty: 12, reorderLevel: 20, unit: 'Btl', costPrice: 55.00, salePrice: 85.00, supplier: 'GSK Pakistan' },
  { id: '7', code: 'TAB-006', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', group: 'Cardiovascular', currentQty: 45, reorderLevel: 50, unit: 'Tab', costPrice: 11.00, salePrice: 18.00, supplier: 'Sami Pharma' },
  { id: '8', code: 'INJ-003', name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', group: 'Injectables', currentQty: 5, reorderLevel: 10, unit: 'Pen', costPrice: 850.00, salePrice: 1200.00, supplier: 'Sanofi' },
  { id: '9', code: 'TAB-012', name: 'Gabapentin 300mg', genericName: 'Gabapentin', group: 'Neurological', currentQty: 10, reorderLevel: 30, unit: 'Cap', costPrice: 10.00, salePrice: 16.00, supplier: 'Martin Dow' },
  { id: '10', code: 'CRM-001', name: 'Betnovate Cream 20g', genericName: 'Betamethasone', group: 'Topical', currentQty: 13, reorderLevel: 15, unit: 'Tube', costPrice: 62.00, salePrice: 95.00, supplier: 'GSK Pakistan' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverity(item: AlertItem): Severity {
  if (item.currentQty === 0) return 'critical';
  if (item.currentQty < item.reorderLevel / 2) return 'low';
  return 'warning';
}

function getSuggestedQty(item: AlertItem): number {
  return Math.max(0, item.reorderLevel * 2 - item.currentQty);
}

const severityConfig: Record<Severity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  low: { label: 'Low', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  warning: { label: 'Warning', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StockAlerts() {
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeAlerts = useMemo(() => {
    let items = alertItems.filter((i) => !dismissedIds.has(i.id));
    if (filterSeverity !== 'all') {
      items = items.filter((i) => getSeverity(i) === filterSeverity);
    }
    // Sort: critical first, then low, then warning
    const order: Record<Severity, number> = { critical: 0, low: 1, warning: 2 };
    return items.sort((a, b) => order[getSeverity(a)] - order[getSeverity(b)]);
  }, [filterSeverity, dismissedIds]);

  const criticalCount = alertItems.filter((i) => !dismissedIds.has(i.id) && getSeverity(i) === 'critical').length;
  const lowCount = alertItems.filter((i) => !dismissedIds.has(i.id) && getSeverity(i) === 'low').length;
  const warningCount = alertItems.filter((i) => !dismissedIds.has(i.id) && getSeverity(i) === 'warning').length;
  const totalActive = alertItems.filter((i) => !dismissedIds.has(i.id)).length;

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const orderNow = (item: AlertItem) => {
    showToast(`Purchase order created for ${getSuggestedQty(item)} x ${item.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--pos-text)] flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Low Stock Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalActive} item{totalActive !== 1 ? 's' : ''} need reordering
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
          className={cn(
            'pos-card rounded-xl px-5 py-4 text-left transition-all',
            filterSeverity === 'critical' && 'ring-1 ring-red-500/40'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{criticalCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">Out of stock</p>
        </button>
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'low' ? 'all' : 'low')}
          className={cn(
            'pos-card rounded-xl px-5 py-4 text-left transition-all',
            filterSeverity === 'low' && 'ring-1 ring-amber-500/40'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Low</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{lowCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">Below half reorder level</p>
        </button>
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
          className={cn(
            'pos-card rounded-xl px-5 py-4 text-left transition-all',
            filterSeverity === 'warning' && 'ring-1 ring-yellow-500/40'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Warning</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">{warningCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">Below reorder level</p>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        {(['all', 'critical', 'low', 'warning'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterSeverity(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterSeverity === f
                ? 'bg-[var(--pos-accent)]/20 text-[var(--pos-accent)]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            )}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {activeAlerts.map((item) => {
          const sev = getSeverity(item);
          const config = severityConfig[sev];
          const suggested = getSuggestedQty(item);
          const estCost = suggested * item.costPrice;

          return (
            <div
              key={item.id}
              className={cn(
                'pos-card rounded-xl p-5 border transition-all hover:shadow-lg',
                config.border
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                  {sev === 'critical' ? (
                    <AlertTriangle className={cn('w-5 h-5', config.text)} />
                  ) : (
                    <TrendingDown className={cn('w-5 h-5', config.text)} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--pos-text)]">{item.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', config.bg, config.text)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.code} &middot; {item.genericName} &middot; {item.group}</p>

                  {/* Stock Details */}
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Current</p>
                      <p className={cn('text-sm font-bold tabular-nums', config.text)}>{item.currentQty} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Reorder Level</p>
                      <p className="text-sm font-semibold text-gray-300 tabular-nums">{item.reorderLevel} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Suggested Order</p>
                      <p className="text-sm font-semibold text-[var(--pos-accent)] tabular-nums">{suggested} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Est. Cost</p>
                      <p className="text-sm font-semibold text-gray-300 tabular-nums">Rs. {estCost.toLocaleString('en-PK')}</p>
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="mt-3">
                    <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                      <div
                        className={cn('h-1.5 rounded-full transition-all', sev === 'critical' ? 'bg-red-500' : sev === 'low' ? 'bg-amber-500' : 'bg-yellow-500')}
                        style={{ width: `${Math.min((item.currentQty / item.reorderLevel) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {item.currentQty === 0 ? 'Out of stock' : `${Math.round((item.currentQty / item.reorderLevel) * 100)}% of reorder level`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => orderNow(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--pos-accent)] text-white text-xs font-medium hover:shadow-[0_2px_15px_rgba(13,148,136,0.3)] transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Order Now
                  </button>
                  <button
                    onClick={() => dismissAlert(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {activeAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-[var(--pos-text)]">All clear!</p>
            <p className="text-xs text-gray-500 mt-1">No low stock alerts at this time</p>
          </div>
        )}
      </div>

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
