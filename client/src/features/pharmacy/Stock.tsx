import { useState, useMemo } from 'react';
import { Search, Plus, Minus, X, Package, AlertTriangle, Bell, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ProductGroupTree, defaultProductGroups } from './ProductGroupTree';

/* ------------------------------------------------------------------ */
/*  Expiry helpers                                                      */
/* ------------------------------------------------------------------ */

function daysUntilExpiry(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const today = new Date();
  const exp = new Date(dateStr);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ dateStr }: { dateStr: string | undefined }) {
  if (!dateStr) return <span className="text-xs text-gray-500">—</span>;
  const days = daysUntilExpiry(dateStr);
  if (days === null) return null;

  const formatted = new Date(dateStr).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  if (days <= 0) {
    return (
      <div>
        <span className="text-xs text-red-400 font-semibold block">{formatted}</span>
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase">EXPIRED</span>
      </div>
    );
  }
  if (days <= 30) {
    return (
      <div>
        <span className="text-xs text-amber-400 font-semibold block">{formatted}</span>
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">Exp. in {days}d</span>
      </div>
    );
  }
  if (days <= 60) {
    return (
      <div>
        <span className="text-xs text-yellow-400 font-semibold block">{formatted}</span>
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">Exp. in {days}d</span>
      </div>
    );
  }
  return <span className="text-xs text-gray-400">{formatted}</span>;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StockItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  group: string;
  groupId: string;
  qtyOnHand: number;
  unit: string;
  costPrice: number;
  salePrice: number;
  reorderLevel: number;
  lastUpdated: string;
  expiryDate?: string;
}

type StockFilter = 'all' | 'negative' | 'zero' | 'non-zero' | 'below-reorder';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const demoStock: StockItem[] = [
  { id: '1', code: 'TAB-001', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', group: 'Cardiovascular', groupId: 'cardio', qtyOnHand: 450, unit: 'Tab', costPrice: 7.80, salePrice: 12.50, reorderLevel: 50, lastUpdated: '2026-03-28', expiryDate: '2027-06-15' },
  { id: '2', code: 'TAB-002', name: 'Metformin 500mg', genericName: 'Metformin HCl', group: 'Anti-Diabetic', groupId: 'antidiabetic', qtyOnHand: 800, unit: 'Tab', costPrice: 4.50, salePrice: 8.00, reorderLevel: 100, lastUpdated: '2026-03-27', expiryDate: '2027-09-30' },
  { id: '3', code: 'TAB-003', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', group: 'Antibiotics', groupId: 'antibiotics', qtyOnHand: 320, unit: 'Cap', costPrice: 9.20, salePrice: 15.00, reorderLevel: 50, lastUpdated: '2026-03-28', expiryDate: '2025-12-31' },
  { id: '4', code: 'TAB-004', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', group: 'Analgesics', groupId: 'analgesics', qtyOnHand: 1500, unit: 'Tab', costPrice: 1.80, salePrice: 3.50, reorderLevel: 200, lastUpdated: '2026-03-29', expiryDate: '2028-03-31' },
  { id: '5', code: 'TAB-005', name: 'Omeprazole 20mg', genericName: 'Omeprazole', group: 'GI / Antacids', groupId: 'gi', qtyOnHand: 600, unit: 'Cap', costPrice: 5.60, salePrice: 10.00, reorderLevel: 80, lastUpdated: '2026-03-28', expiryDate: '2027-12-31' },
  { id: '6', code: 'TAB-006', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', group: 'Cardiovascular', groupId: 'cardio', qtyOnHand: 45, unit: 'Tab', costPrice: 11.00, salePrice: 18.00, reorderLevel: 50, lastUpdated: '2026-03-27', expiryDate: '2026-02-28' },
  { id: '7', code: 'SYR-001', name: 'Calpol Syrup 120ml', genericName: 'Paracetamol', group: 'Pediatric', groupId: 'pediatric-syrups', qtyOnHand: 12, unit: 'Btl', costPrice: 55.00, salePrice: 85.00, reorderLevel: 20, lastUpdated: '2026-03-29', expiryDate: '2026-04-25' },
  { id: '8', code: 'TAB-007', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin HCl', group: 'Antibiotics', groupId: 'antibiotics', qtyOnHand: 400, unit: 'Tab', costPrice: 6.80, salePrice: 12.00, reorderLevel: 50, lastUpdated: '2026-03-26', expiryDate: '2027-08-15' },
  { id: '9', code: 'INJ-001', name: 'Normal Saline 1000ml', genericName: 'Sodium Chloride 0.9%', group: 'IV Fluids', groupId: 'iv-fluids', qtyOnHand: 200, unit: 'Bag', costPrice: 75.00, salePrice: 120.00, reorderLevel: 30, lastUpdated: '2026-03-28', expiryDate: '2026-03-15' },
  { id: '10', code: 'TAB-008', name: 'Losartan 50mg', genericName: 'Losartan Potassium', group: 'Cardiovascular', groupId: 'cardio', qtyOnHand: 350, unit: 'Tab', costPrice: 8.50, salePrice: 14.00, reorderLevel: 50, lastUpdated: '2026-03-27', expiryDate: '2027-11-30' },
  { id: '11', code: 'CRM-001', name: 'Betnovate Cream 20g', genericName: 'Betamethasone', group: 'Topical', groupId: 'creams', qtyOnHand: 80, unit: 'Tube', costPrice: 62.00, salePrice: 95.00, reorderLevel: 15, lastUpdated: '2026-03-25', expiryDate: '2026-05-31' },
  { id: '12', code: 'DRP-001', name: 'Ciprofloxacin Eye Drops', genericName: 'Ciprofloxacin 0.3%', group: 'Eye / Ear Drops', groupId: 'drops', qtyOnHand: 0, unit: 'Btl', costPrice: 38.00, salePrice: 65.00, reorderLevel: 20, lastUpdated: '2026-03-29', expiryDate: '2026-02-10' },
  { id: '13', code: 'TAB-009', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', group: 'Analgesics', groupId: 'analgesics', qtyOnHand: 900, unit: 'Tab', costPrice: 2.80, salePrice: 5.00, reorderLevel: 100, lastUpdated: '2026-03-28', expiryDate: '2028-01-31' },
  { id: '14', code: 'SYR-002', name: 'Ambroxol Syrup 100ml', genericName: 'Ambroxol HCl', group: 'Respiratory', groupId: 'respiratory', qtyOnHand: 110, unit: 'Btl', costPrice: 45.00, salePrice: 75.00, reorderLevel: 20, lastUpdated: '2026-03-27', expiryDate: '2026-05-20' },
  { id: '15', code: 'TAB-010', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', group: 'OTC / General', groupId: 'otc', qtyOnHand: 700, unit: 'Tab', costPrice: 2.00, salePrice: 4.00, reorderLevel: 100, lastUpdated: '2026-03-28', expiryDate: '2027-07-31' },
  { id: '16', code: 'INJ-002', name: 'Ceftriaxone 1g Inj', genericName: 'Ceftriaxone Sodium', group: 'Injectables', groupId: 'injections', qtyOnHand: 8, unit: 'Vial', costPrice: 120.00, salePrice: 180.00, reorderLevel: 20, lastUpdated: '2026-03-29', expiryDate: '2026-06-10' },
  { id: '17', code: 'TAB-011', name: 'Metoprolol 50mg', genericName: 'Metoprolol Tartrate', group: 'Cardiovascular', groupId: 'cardio', qtyOnHand: 420, unit: 'Tab', costPrice: 5.00, salePrice: 9.00, reorderLevel: 50, lastUpdated: '2026-03-26', expiryDate: '2027-04-30' },
  { id: '18', code: 'TAB-012', name: 'Gabapentin 300mg', genericName: 'Gabapentin', group: 'Neurological', groupId: 'neuro', qtyOnHand: -5, unit: 'Cap', costPrice: 10.00, salePrice: 16.00, reorderLevel: 30, lastUpdated: '2026-03-29', expiryDate: '2025-11-30' },
  { id: '19', code: 'BND-001', name: 'Crepe Bandage 6inch', genericName: 'N/A', group: 'Surgical', groupId: 'bandages', qtyOnHand: 150, unit: 'Pc', costPrice: 28.00, salePrice: 45.00, reorderLevel: 25, lastUpdated: '2026-03-28', expiryDate: '2028-12-31' },
  { id: '20', code: 'TAB-013', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', group: 'Respiratory', groupId: 'respiratory', qtyOnHand: 0, unit: 'Tab', costPrice: 14.00, salePrice: 22.00, reorderLevel: 40, lastUpdated: '2026-03-27', expiryDate: '2027-03-31' },
  { id: '21', code: 'TAB-025', name: 'Ranitidine 150mg', genericName: 'Ranitidine HCl', group: 'GI / Antacids', groupId: 'gi', qtyOnHand: 0, unit: 'Tab', costPrice: 3.50, salePrice: 6.00, reorderLevel: 100, lastUpdated: '2026-03-20', expiryDate: '2025-10-31' },
  { id: '22', code: 'INJ-006', name: 'Enoxaparin 40mg', genericName: 'Enoxaparin Sodium', group: 'Injectables', groupId: 'injections', qtyOnHand: 3, unit: 'Syringe', costPrice: 350.00, salePrice: 500.00, reorderLevel: 8, lastUpdated: '2026-03-29', expiryDate: '2026-04-15' },
  { id: '23', code: 'INJ-003', name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', group: 'Injectables', groupId: 'injections', qtyOnHand: 25, unit: 'Pen', costPrice: 850.00, salePrice: 1200.00, reorderLevel: 10, lastUpdated: '2026-03-28', expiryDate: '2027-01-31' },
  { id: '24', code: 'TAB-022', name: 'Tramadol 50mg', genericName: 'Tramadol HCl', group: 'Analgesics', groupId: 'analgesics', qtyOnHand: -3, unit: 'Tab', costPrice: 4.00, salePrice: 7.50, reorderLevel: 50, lastUpdated: '2026-03-29', expiryDate: '2026-04-30' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Stock() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [stockItems, setStockItems] = useState(demoStock);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const filteredItems = useMemo(() => {
    let result = stockItems;
    if (selectedGroup) {
      result = result.filter((s) => s.groupId === selectedGroup);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.genericName.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
      );
    }
    switch (stockFilter) {
      case 'negative': result = result.filter((s) => s.qtyOnHand < 0); break;
      case 'zero': result = result.filter((s) => s.qtyOnHand === 0); break;
      case 'non-zero': result = result.filter((s) => s.qtyOnHand > 0); break;
      case 'below-reorder': result = result.filter((s) => s.qtyOnHand <= s.reorderLevel && s.qtyOnHand >= 0); break;
    }
    return result;
  }, [stockItems, selectedGroup, searchTerm, stockFilter]);

  const totalStockValue = filteredItems.reduce((s, i) => s + Math.max(0, i.qtyOnHand) * i.costPrice, 0);
  const totalSaleValue = filteredItems.reduce((s, i) => s + Math.max(0, i.qtyOnHand) * i.salePrice, 0);
  const negativeCount = stockItems.filter((s) => s.qtyOnHand < 0).length;
  const zeroCount = stockItems.filter((s) => s.qtyOnHand === 0).length;
  const belowReorderCount = stockItems.filter((s) => s.qtyOnHand > 0 && s.qtyOnHand <= s.reorderLevel).length;
  const expiredCount = stockItems.filter((s) => (daysUntilExpiry(s.expiryDate) ?? 1) <= 0).length;
  const nearExpiryCount = stockItems.filter((s) => { const d = daysUntilExpiry(s.expiryDate); return d !== null && d > 0 && d <= 30; }).length;

  const openAdjustment = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustmentModal(true);
  };

  const applyAdjustment = (itemId: string, qty: number) => {
    setStockItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, qtyOnHand: s.qtyOnHand + qty, lastUpdated: '2026-03-29' } : s))
    );
    setAdjustmentModal(false);
    setSelectedItem(null);
  };

  const getStockColor = (item: StockItem) => {
    if (item.qtyOnHand < 0) return 'text-red-400';
    if (item.qtyOnHand === 0) return 'text-red-400';
    if (item.qtyOnHand <= item.reorderLevel) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStockBg = (item: StockItem) => {
    if (item.qtyOnHand < 0) return 'bg-red-500/5';
    if (item.qtyOnHand === 0) return 'bg-red-500/5';
    if (item.qtyOnHand <= item.reorderLevel) return 'bg-amber-500/5';
    return '';
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[var(--pos-border)] flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--pos-border)]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Groups</h3>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ProductGroupTree
            groups={defaultProductGroups}
            selectedId={selectedGroup}
            onSelect={setSelectedGroup}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Low Stock Alert Banner */}
        {(zeroCount + belowReorderCount) > 0 && (
          <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-400">
                {zeroCount + belowReorderCount} item{(zeroCount + belowReorderCount) !== 1 ? 's' : ''} below reorder level
              </p>
              <p className="text-xs text-amber-400/60 mt-0.5">
                {zeroCount > 0 && `${zeroCount} out of stock`}{zeroCount > 0 && belowReorderCount > 0 && ' \u00b7 '}{belowReorderCount > 0 && `${belowReorderCount} running low`}
              </p>
            </div>
            <button
              onClick={() => navigate('/pharmacy/stock-alerts')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors whitespace-nowrap"
            >
              View Alerts
            </button>
          </div>
        )}

        {/* Expiry Alert Banner */}
        {(expiredCount + nearExpiryCount) > 0 && (
          <div className="mx-5 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">
                Expiry Alert: {expiredCount > 0 ? `${expiredCount} expired` : ''}{expiredCount > 0 && nearExpiryCount > 0 ? ' · ' : ''}{nearExpiryCount > 0 ? `${nearExpiryCount} expiring within 30 days` : ''}
              </p>
              <p className="text-xs text-red-400/60 mt-0.5">Please review and write off expired items</p>
            </div>
            <button
              onClick={() => navigate('/pharmacy/expiry')}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors whitespace-nowrap"
            >
              View Expiry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-3 px-5 pt-4 pb-2">
          <div className="pos-card rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Total Stock Value</p>
            <p className="text-lg font-bold text-[var(--pos-text)] tabular-nums mt-0.5">Rs. {totalStockValue.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="pos-card rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Total Sale Value</p>
            <p className="text-lg font-bold text-[var(--pos-accent)] tabular-nums mt-0.5">Rs. {totalSaleValue.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
          </div>
          <button onClick={() => setStockFilter(stockFilter === 'negative' ? 'all' : 'negative')} className={cn('pos-card rounded-xl px-4 py-3 text-left transition-all', stockFilter === 'negative' && 'ring-1 ring-red-500/40')}>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Negative Qty</p>
            <p className="text-lg font-bold text-red-400 tabular-nums mt-0.5">{negativeCount}</p>
          </button>
          <button onClick={() => setStockFilter(stockFilter === 'zero' ? 'all' : 'zero')} className={cn('pos-card rounded-xl px-4 py-3 text-left transition-all', stockFilter === 'zero' && 'ring-1 ring-red-500/40')}>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Zero Stock</p>
            <p className="text-lg font-bold text-red-400 tabular-nums mt-0.5">{zeroCount}</p>
          </button>
          <button onClick={() => setStockFilter(stockFilter === 'below-reorder' ? 'all' : 'below-reorder')} className={cn('pos-card rounded-xl px-4 py-3 text-left transition-all', stockFilter === 'below-reorder' && 'ring-1 ring-amber-500/40')}>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Below Reorder</p>
            <p className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">{belowReorderCount}</p>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-2">
          <h2 className="text-lg font-bold text-[var(--pos-text)]">Stock Management</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full tabular-nums">{filteredItems.length} items</span>
          <div className="flex-1" />

          {/* Filter pills */}
          <div className="flex gap-1.5">
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'non-zero' as const, label: 'In Stock' },
              { key: 'below-reorder' as const, label: 'Low Stock' },
              { key: 'zero' as const, label: 'Out of Stock' },
              { key: 'negative' as const, label: 'Negative' },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setStockFilter(f.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  stockFilter === f.key
                    ? 'bg-[var(--pos-accent)]/20 text-[var(--pos-accent)]'
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm placeholder:text-gray-500 focus:outline-none focus:border-[var(--pos-accent)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-5 pb-4">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[var(--pos-surface)] border-b border-[var(--pos-border)]">
                {['Code', 'Product Name', 'Qty on Hand', 'Unit', 'Cost Price', 'Stock Value', 'Sale Value', 'Reorder Lvl', 'Expiry Date', 'Last Updated', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors',
                    getStockBg(item)
                  )}
                >
                  <td className="px-4 py-2.5 text-sm text-gray-400 font-mono">{item.code}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-[var(--pos-text)]">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.genericName}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn('text-sm font-bold tabular-nums', getStockColor(item))}>
                      {item.qtyOnHand}
                    </span>
                    {item.qtyOnHand < 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-400 inline ml-1.5" />}
                    {item.qtyOnHand === 0 && <span className="ml-1.5 text-[10px] text-red-400 font-semibold">OUT</span>}
                    {item.qtyOnHand > 0 && item.qtyOnHand <= item.reorderLevel && <span className="ml-1.5 text-[10px] text-amber-400 font-semibold">LOW</span>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{item.unit}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-400 tabular-nums text-right">{item.costPrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-300 tabular-nums text-right font-medium">
                    {(Math.max(0, item.qtyOnHand) * item.costPrice).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-[var(--pos-accent)] tabular-nums text-right font-medium">
                    {(Math.max(0, item.qtyOnHand) * item.salePrice).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums text-right">{item.reorderLevel}</td>
                  <td className="px-4 py-2.5"><ExpiryBadge dateStr={item.expiryDate} /></td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{item.lastUpdated}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => openAdjustment(item)}
                      className="px-2.5 py-1 rounded-md bg-[var(--pos-accent)]/10 text-[var(--pos-accent)] text-xs font-medium hover:bg-[var(--pos-accent)]/20 transition-colors"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No stock items match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ ADJUSTMENT MODAL ============ */}
      {adjustmentModal && selectedItem && (
        <AdjustmentModal
          item={selectedItem}
          onClose={() => { setAdjustmentModal(false); setSelectedItem(null); }}
          onApply={applyAdjustment}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Adjustment Modal                                                   */
/* ------------------------------------------------------------------ */

function AdjustmentModal({
  item,
  onClose,
  onApply,
}: {
  item: StockItem;
  onClose: () => void;
  onApply: (itemId: string, qty: number) => void;
}) {
  const [qty, setQty] = useState('');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const [reason, setReason] = useState('Purchase');
  const [notes, setNotes] = useState('');

  const adjustedQty = direction === 'add' ? parseInt(qty) || 0 : -(parseInt(qty) || 0);
  const newTotal = item.qtyOnHand + adjustedQty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden" style={{ animationDuration: '0.2s' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--pos-border)]">
          <h2 className="text-lg font-bold text-[var(--pos-text)]">Stock Adjustment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product Info */}
          <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-sm font-medium text-[var(--pos-text)]">{item.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.code} &middot; Current: <span className="font-semibold text-gray-300">{item.qtyOnHand} {item.unit}</span></p>
          </div>

          {/* Direction */}
          <div className="flex gap-2">
            <button
              onClick={() => setDirection('add')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                direction === 'add' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400'
              )}
            >
              <Plus className="w-4 h-4" /> Add Stock
            </button>
            <button
              onClick={() => setDirection('subtract')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                direction === 'subtract' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400'
              )}
            >
              <Minus className="w-4 h-4" /> Remove Stock
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Quantity</label>
            <input
              type="number"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-xl font-bold text-[var(--pos-text)] text-center tabular-nums focus:outline-none focus:border-[var(--pos-accent)]"
              autoFocus
              placeholder="0"
            />
          </div>

          {/* New total preview */}
          <div className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-white/[0.03]">
            <span className="text-sm text-gray-400">New Total</span>
            <span className={cn('text-lg font-bold tabular-nums', newTotal < 0 ? 'text-red-400' : 'text-emerald-400')}>
              {newTotal} {item.unit}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm focus:outline-none focus:border-[var(--pos-accent)]"
            >
              {direction === 'add'
                ? ['Purchase', 'Return from Customer', 'Transfer In', 'Manual Adjustment'].map((r) => <option key={r}>{r}</option>)
                : ['Damaged', 'Expired', 'Return to Supplier', 'Manual Adjustment', 'Theft / Loss'].map((r) => <option key={r}>{r}</option>)
              }
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm focus:outline-none focus:border-[var(--pos-accent)] resize-none"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={() => onApply(item.id, adjustedQty)}
            disabled={!qty || parseInt(qty) <= 0}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
              qty && parseInt(qty) > 0
                ? 'bg-[var(--pos-accent)] text-white hover:shadow-[0_2px_15px_rgba(13,148,136,0.3)]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}
