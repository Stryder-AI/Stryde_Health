import {
  TrendingUp, ShoppingCart, Receipt, Package,
  Clock, AlertTriangle, ArrowUp, Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

const weeklyRevenue = [
  { day: 'Mon', value: 32000 },
  { day: 'Tue', value: 45000 },
  { day: 'Wed', value: 38000 },
  { day: 'Thu', value: 52000 },
  { day: 'Fri', value: 61000 },
  { day: 'Sat', value: 48000 },
  { day: 'Sun', value: 22000 },
];
const maxRevenue = Math.max(...weeklyRevenue.map(d => d.value));

const topProducts = [
  { name: 'Paracetamol 500mg', sold: 142, revenue: 17040 },
  { name: 'Amoxicillin 500mg', sold: 89, revenue: 40050 },
  { name: 'Omeprazole 20mg', sold: 76, revenue: 28880 },
  { name: 'Cetirizine 10mg', sold: 68, revenue: 12240 },
  { name: 'Metformin 500mg', sold: 64, revenue: 17920 },
  { name: 'Amlodipine 5mg', sold: 58, revenue: 20300 },
  { name: 'Losartan 50mg', sold: 52, revenue: 33800 },
  { name: 'Atorvastatin 20mg', sold: 48, revenue: 27840 },
  { name: 'Ibuprofen 400mg', sold: 45, revenue: 9900 },
  { name: 'Pantoprazole 40mg', sold: 41, revenue: 15170 },
];

const recentSales = [
  { id: 'S-1048', patient: 'Ahmed Raza', items: 4, total: 2850, time: '10:45 AM', method: 'Cash' },
  { id: 'S-1047', patient: 'Fatima Bibi', items: 2, total: 1650, time: '10:22 AM', method: 'EasyPaisa' },
  { id: 'S-1046', patient: 'Walk-in', items: 1, total: 450, time: '09:58 AM', method: 'Cash' },
  { id: 'S-1045', patient: 'Usman Tariq', items: 5, total: 3920, time: '09:35 AM', method: 'Card' },
  { id: 'S-1044', patient: 'Ayesha Noor', items: 3, total: 1280, time: '09:12 AM', method: 'Cash' },
];

const lowStockAlerts = [
  { name: 'Paracetamol 500mg', stock: 15, reorder: 50 },
  { name: 'Insulin Mixtard 70/30', stock: 3, reorder: 10 },
  { name: 'Amoxicillin 250mg Syrup', stock: 8, reorder: 20 },
  { name: 'Omeprazole 20mg', stock: 12, reorder: 30 },
];

const criticalStockItems = [
  { name: 'Ciprofloxacin Eye Drops', qty: 0, reorderLevel: 20, severity: 'critical' as const },
  { name: 'Montelukast 10mg', qty: 0, reorderLevel: 40, severity: 'critical' as const },
  { name: 'Ranitidine 150mg', qty: 0, reorderLevel: 100, severity: 'critical' as const },
  { name: 'Enoxaparin 40mg', qty: 3, reorderLevel: 8, severity: 'low' as const },
  { name: 'Ceftriaxone 1g Inj', qty: 8, reorderLevel: 20, severity: 'low' as const },
  { name: 'Calpol Syrup 120ml', qty: 12, reorderLevel: 20, severity: 'low' as const },
  { name: 'Atorvastatin 20mg', qty: 45, reorderLevel: 50, severity: 'warning' as const },
  { name: 'Insulin Glargine 100IU', qty: 5, reorderLevel: 10, severity: 'low' as const },
  { name: 'Gabapentin 300mg', qty: 10, reorderLevel: 30, severity: 'low' as const },
  { name: 'Betnovate Cream 20g', qty: 13, reorderLevel: 15, severity: 'warning' as const },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function PharmacyDashboard() {
  const navigate = useNavigate();
  const totalAlerts = criticalStockItems.length;
  const criticalCount = criticalStockItems.filter((i) => i.severity === 'critical').length;
  const top3Critical = criticalStockItems.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--pos-text)]">Pharmacy Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Analytics and performance overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: 'Rs. 10,150', icon: TrendingUp, color: 'text-emerald-400', trend: '+12%' },
          { label: 'Sales Count', value: '5', icon: ShoppingCart, color: 'text-[var(--pos-accent)]', trend: '+8%' },
          { label: 'Avg Basket Size', value: 'Rs. 2,030', icon: Receipt, color: 'text-blue-400', trend: '+3%' },
          { label: 'Top Seller', value: 'Paracetamol', icon: Package, color: 'text-purple-400', trend: '142 sold' },
        ].map((card) => (
          <div key={card.label} className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-4 hover:border-[var(--pos-accent)]/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color} group-hover:scale-110 transition-transform`} />
            </div>
            <p className="text-2xl font-bold text-[var(--pos-text)]">{card.value}</p>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5 mt-1">
              <ArrowUp className="w-3 h-3" /> {card.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--pos-text)] mb-1">Weekly Revenue</h2>
          <p className="text-xs text-gray-500 mb-6">Last 7 days performance</p>
          <div className="flex items-end gap-3 h-48">
            {weeklyRevenue.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500">
                  {(d.value / 1000).toFixed(0)}k
                </span>
                <div className="w-full relative rounded-t-lg overflow-hidden bg-white/[0.03]" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--pos-accent)] to-teal-400 rounded-t-lg transition-all duration-700 ease-out"
                    style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[var(--pos-text)]">Low Stock Alerts</h2>
          </div>
          <div className="space-y-3">
            {lowStockAlerts.map((item) => (
              <div key={item.name} className="p-3 rounded-lg bg-white/[0.02] border border-[var(--pos-border)] hover:border-amber-500/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--pos-text)]">{item.name}</span>
                  <Badge variant={item.stock <= 5 ? 'danger' : 'warning'}>
                    {item.stock} left
                  </Badge>
                </div>
                <div className="w-full bg-white/[0.05] rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${item.stock <= 5 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((item.stock / item.reorder) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-600 mt-1">Reorder level: {item.reorder}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--pos-text)] mb-1">Top Selling Products</h2>
          <p className="text-xs text-gray-500 mb-4">This month's best performers</p>
          <div className="space-y-2">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-[var(--pos-accent)]/20 text-[var(--pos-accent)]' : 'bg-white/[0.05] text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--pos-text)] truncate">{product.name}</p>
                </div>
                <span className="text-xs text-gray-500">{product.sold} sold</span>
                <span className="text-sm font-semibold text-[var(--pos-text)] w-24 text-right">Rs. {product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--pos-text)] mb-1">Recent Sales</h2>
          <p className="text-xs text-gray-500 mb-4">Latest transactions today</p>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="p-3 rounded-lg bg-white/[0.02] border border-[var(--pos-border)] hover:border-[var(--pos-accent)]/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[var(--pos-accent)]">{sale.id}</span>
                  <span className="text-sm font-semibold text-[var(--pos-text)]">Rs. {sale.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{sale.patient} · {sale.items} items</span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{sale.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Widget */}
      <div className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[var(--pos-text)]">Low Stock Alerts</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold">
              {totalAlerts} items
            </span>
          </div>
          <button
            onClick={() => navigate('/pharmacy/stock-alerts')}
            className="text-xs text-[var(--pos-accent)] font-medium hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
            <p className="text-lg font-bold text-red-400 tabular-nums">{criticalCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Critical</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
            <p className="text-lg font-bold text-amber-400 tabular-nums">{criticalStockItems.filter((i) => i.severity === 'low').length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Low</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-center">
            <p className="text-lg font-bold text-yellow-400 tabular-nums">{criticalStockItems.filter((i) => i.severity === 'warning').length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Warning</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Top Critical Items</p>
          {top3Critical.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--pos-border)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-[var(--pos-text)]">{item.name}</span>
              </div>
              <Badge variant="danger">
                {item.qty === 0 ? 'Out of Stock' : `${item.qty} left`}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
