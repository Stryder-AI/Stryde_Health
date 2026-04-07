import { DollarSign, Package, AlertTriangle, ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

const weeklyRevenue = [
  { day: 'Mon', value: 68000, max: 112000 },
  { day: 'Tue', value: 85000, max: 112000 },
  { day: 'Wed', value: 72000, max: 112000 },
  { day: 'Thu', value: 95000, max: 112000 },
  { day: 'Fri', value: 112000, max: 112000 },
  { day: 'Sat', value: 98000, max: 112000 },
  { day: 'Sun', value: 42000, max: 112000 },
];

const topSellingProducts = [
  { rank: 1, product: 'Panadol Extra 500mg', category: 'Analgesics', unitsSold: 342, revenue: 51300 },
  { rank: 2, product: 'Augmentin 625mg', category: 'Antibiotics', unitsSold: 198, revenue: 89100 },
  { rank: 3, product: 'Omeprazole 20mg', category: 'Gastrointestinal', unitsSold: 275, revenue: 27500 },
  { rank: 4, product: 'Amlodipine 5mg', category: 'Cardiovascular', unitsSold: 189, revenue: 18900 },
  { rank: 5, product: 'Metformin 500mg', category: 'Antidiabetics', unitsSold: 165, revenue: 16500 },
  { rank: 6, product: 'Ceftriaxone 1g Inj', category: 'Antibiotics', unitsSold: 87, revenue: 43500 },
  { rank: 7, product: 'Losartan 50mg', category: 'Cardiovascular', unitsSold: 142, revenue: 21300 },
  { rank: 8, product: 'Montelukast 10mg', category: 'Respiratory', unitsSold: 118, revenue: 17700 },
  { rank: 9, product: 'Cetirizine 10mg', category: 'Antihistamines', unitsSold: 205, revenue: 10250 },
  { rank: 10, product: 'Insulin Mixtard 70/30', category: 'Antidiabetics', unitsSold: 45, revenue: 67500 },
];

const lowStockItems = [
  { name: 'Paracetamol 500mg', current: 15, reorderLevel: 100, unit: 'tablets' },
  { name: 'Amoxicillin 250mg Syrup', current: 8, reorderLevel: 50, unit: 'bottles' },
  { name: 'Normal Saline 0.9% 1L', current: 12, reorderLevel: 60, unit: 'bags' },
  { name: 'Insulin Mixtard 70/30', current: 3, reorderLevel: 20, unit: 'vials' },
  { name: 'Diclofenac Sodium 50mg', current: 22, reorderLevel: 80, unit: 'tablets' },
  { name: 'Ciprofloxacin 500mg', current: 18, reorderLevel: 70, unit: 'tablets' },
];

const recentSales = [
  { id: '#PS-1052', patient: 'Ahmad Khan', total: 2450, time: '2 min ago' },
  { id: '#PS-1051', patient: 'Fatima Bibi', total: 850, time: '8 min ago' },
  { id: '#PS-1050', patient: 'Usman Ali', total: 5200, time: '15 min ago' },
  { id: '#PS-1049', patient: 'Saima Noor', total: 1350, time: '22 min ago' },
  { id: '#PS-1048', patient: 'Hassan Mahmood', total: 3780, time: '28 min ago' },
  { id: '#PS-1047', patient: 'Ayesha Siddiqui', total: 920, time: '35 min ago' },
  { id: '#PS-1046', patient: 'Bilal Ahmed', total: 4150, time: '42 min ago' },
  { id: '#PS-1045', patient: 'Nadia Parveen', total: 1680, time: '50 min ago' },
  { id: '#PS-1044', patient: 'Tariq Mehmood', total: 6300, time: '1 hr ago' },
  { id: '#PS-1043', patient: 'Sana Malik', total: 2100, time: '1 hr ago' },
];

export function PharmacyOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Pharmacy Overview</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Admin view of pharmacy operations and performance.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Today's Revenue" value="Rs. 87,450" icon={DollarSign} trend={{ value: 14, positive: true }} subtitle="Based on 34 sales" iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Products Count" value="1,248" icon={Package} subtitle="142 categories" iconColor="bg-blue-500/10 text-blue-500" />
        <MetricCard title="Low Stock Alerts" value="6" icon={AlertTriangle} subtitle="Requires immediate attention" iconColor="bg-amber-500/10 text-amber-500" />
        <MetricCard title="Active Sales" value="34" icon={ShoppingCart} trend={{ value: 8, positive: true }} subtitle="Today's completed sales" iconColor="bg-teal-500/10 text-teal-500" />
      </div>

      {/* Revenue Chart */}
      <Card hover={false} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle>Revenue — Last 7 Days</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Daily pharmacy revenue breakdown</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-emerald-600">+11% vs last week</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-48">
          {weeklyRevenue.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                {(d.value / 1000).toFixed(0)}k
              </span>
              <div className="w-full relative rounded-t-lg overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)]" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ease-out"
                  style={{
                    height: `${(d.value / d.max) * 100}%`,
                    background: 'linear-gradient(to top, #0d9488, #2dd4bf)',
                  }}
                />
              </div>
              <span className="text-xs font-medium text-[var(--text-tertiary)]">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Selling Products Table */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Top Selling Products</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Top 10 products by units sold this month</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue (Rs.)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSellingProducts.map((p) => (
              <TableRow key={p.rank}>
                <TableCell>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] text-xs font-bold text-[var(--text-primary)]">
                    {p.rank}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{p.product}</TableCell>
                <TableCell>
                  <Badge variant="default">{p.category}</Badge>
                </TableCell>
                <TableCell>{p.unitsSold.toLocaleString()}</TableCell>
                <TableCell className="font-semibold">{p.revenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card hover={false} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-5">Products below reorder level</p>
          <div className="space-y-4">
            {lowStockItems.map((item) => {
              const pct = Math.round((item.current / item.reorderLevel) * 100);
              const barColor = pct < 20 ? 'bg-red-500' : pct < 40 ? 'bg-amber-500' : 'bg-teal-500';
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {item.current} / {item.reorderLevel} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface)] rounded-full border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Sales Feed */}
        <Card hover={false} className="p-6">
          <CardTitle>Recent Sales</CardTitle>
          <p className="text-sm text-[var(--text-secondary)] mb-5">Last 10 pharmacy sales</p>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface)] transition-all duration-200 group">
                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{sale.id}</p>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Rs. {sale.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-[var(--text-secondary)]">{sale.patient}</p>
                    <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {sale.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
