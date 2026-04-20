import React, { useState } from 'react';
import {
  Search, Calendar, Receipt, TrendingUp, ShoppingCart,
  ArrowUpDown, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

const salesData = [
  { id: 'S-1048', date: '2026-03-29', time: '10:45 AM', patient: 'Ahmed Raza', mr: 'MR-10234', items: 4, total: 2850, method: 'Cash', status: 'completed',
    details: [
      { name: 'Paracetamol 500mg', qty: 2, price: 120, total: 240 },
      { name: 'Amoxicillin 500mg', qty: 1, price: 450, total: 450 },
      { name: 'Omeprazole 20mg', qty: 1, price: 380, total: 380 },
      { name: 'Cetirizine 10mg', qty: 1, price: 180, total: 180 },
    ],
  },
  { id: 'S-1047', date: '2026-03-29', time: '10:22 AM', patient: 'Fatima Bibi', mr: 'MR-10235', items: 2, total: 1650, method: 'EasyPaisa', status: 'completed',
    details: [
      { name: 'Amlodipine 5mg', qty: 1, price: 350, total: 350 },
      { name: 'Losartan 50mg', qty: 2, price: 650, total: 1300 },
    ],
  },
  { id: 'S-1046', date: '2026-03-29', time: '09:58 AM', patient: 'Walk-in', mr: '—', items: 1, total: 450, method: 'Cash', status: 'completed',
    details: [
      { name: 'Vitamin D3 Drops', qty: 1, price: 450, total: 450 },
    ],
  },
  { id: 'S-1045', date: '2026-03-29', time: '09:35 AM', patient: 'Usman Tariq', mr: 'MR-10236', items: 5, total: 3920, method: 'Card', status: 'completed',
    details: [
      { name: 'Metformin 500mg', qty: 2, price: 280, total: 560 },
      { name: 'Glimepiride 2mg', qty: 1, price: 420, total: 420 },
      { name: 'Atorvastatin 20mg', qty: 1, price: 580, total: 580 },
      { name: 'Insulin Mixtard', qty: 1, price: 1200, total: 1200 },
      { name: 'Glucometer Strips', qty: 1, price: 1160, total: 1160 },
    ],
  },
  { id: 'S-1044', date: '2026-03-29', time: '09:12 AM', patient: 'Ayesha Noor', mr: 'MR-10237', items: 3, total: 1280, method: 'Cash', status: 'completed',
    details: [
      { name: 'Augmentin 625mg', qty: 1, price: 680, total: 680 },
      { name: 'Ibuprofen 400mg', qty: 1, price: 220, total: 220 },
      { name: 'Montelukast 10mg', qty: 1, price: 380, total: 380 },
    ],
  },
  { id: 'S-1043', date: '2026-03-29', time: '08:50 AM', patient: 'Bilal Hussain', mr: 'MR-10238', items: 2, total: 890, method: 'Cash', status: 'returned',
    details: [
      { name: 'Cefixime 400mg', qty: 1, price: 520, total: 520 },
      { name: 'Pantoprazole 40mg', qty: 1, price: 370, total: 370 },
    ],
  },
  { id: 'S-1042', date: '2026-03-28', time: '04:30 PM', patient: 'Zainab Akhtar', mr: 'MR-10239', items: 3, total: 2150, method: 'EasyPaisa', status: 'completed',
    details: [
      { name: 'Prednisolone 5mg', qty: 2, price: 350, total: 700 },
      { name: 'Azithromycin 500mg', qty: 1, price: 850, total: 850 },
      { name: 'Salbutamol Inhaler', qty: 1, price: 600, total: 600 },
    ],
  },
  { id: 'S-1041', date: '2026-03-28', time: '03:15 PM', patient: 'Hassan Ali', mr: 'MR-10240', items: 1, total: 750, method: 'Cash', status: 'completed',
    details: [
      { name: 'Diclofenac Gel 30g', qty: 1, price: 750, total: 750 },
    ],
  },
  { id: 'S-1040', date: '2026-03-28', time: '02:00 PM', patient: 'Walk-in', mr: '—', items: 4, total: 1540, method: 'Cash', status: 'completed',
    details: [
      { name: 'Paracetamol 500mg', qty: 2, price: 120, total: 240 },
      { name: 'Cetirizine 10mg', qty: 1, price: 180, total: 180 },
      { name: 'Dextromethorphan Syrup', qty: 1, price: 320, total: 320 },
      { name: 'Throat Lozenges', qty: 2, price: 400, total: 800 },
    ],
  },
  { id: 'S-1039', date: '2026-03-28', time: '12:45 PM', patient: 'Rabia Kanwal', mr: 'MR-10241', items: 2, total: 1850, method: 'Card', status: 'completed',
    details: [
      { name: 'Levothyroxine 50mcg', qty: 1, price: 450, total: 450 },
      { name: 'Calcium + Vit D', qty: 2, price: 700, total: 1400 },
    ],
  },
];

const methodBadge: Record<string, string> = {
  Cash: 'success',
  Card: 'info',
  EasyPaisa: 'accent',
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function SalesHistory() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const todaySales = salesData.filter(s => s.date === '2026-03-29');
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.status === 'completed' ? s.total : 0), 0);
  const todayCount = todaySales.filter(s => s.status === 'completed').length;
  const avgSale = todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0;

  const filtered = salesData.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.patient.toLowerCase().includes(search.toLowerCase()) ||
    s.mr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--pos-text)]">Sales History</h1>
        <p className="text-sm text-gray-500 mt-1">View and search past transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Sales", value: todayCount, icon: ShoppingCart, color: 'text-[var(--pos-accent)]' },
          { label: 'Total Revenue', value: `Rs. ${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Average Sale', value: `Rs. ${avgSale.toLocaleString()}`, icon: Receipt, color: 'text-blue-400' },
          { label: 'Returns', value: todaySales.filter(s => s.status === 'returned').length, icon: ArrowUpDown, color: 'text-amber-400' },
        ].map((card) => (
          <div key={card.label} className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-4 hover:border-[var(--pos-accent)]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--pos-text)]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by sale #, patient, MR#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--pos-surface)] border border-[var(--pos-border)] rounded-lg text-sm text-[var(--pos-text)] placeholder:text-gray-500 focus:outline-none focus:border-[var(--pos-accent)]/50 transition-colors"
          />
        </div>
        <button
          onClick={() => toast.info('Date range picker will be available in the next update.')}
          className="px-4 py-2.5 bg-[var(--pos-surface)] border border-[var(--pos-border)] rounded-lg text-sm text-gray-400 hover:border-[var(--pos-accent)]/30 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Date Range
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--pos-border)]">
              {['Sale #', 'Date / Time', 'Patient', 'Items', 'Total', 'Payment', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <React.Fragment key={sale.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  className="border-b border-[var(--pos-border)]/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-[var(--pos-accent)]">{sale.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--pos-text)]">{sale.date}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{sale.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--pos-text)]">{sale.patient}</p>
                    <p className="text-xs text-gray-500">{sale.mr}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{sale.items} items</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--pos-text)]">Rs. {sale.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={methodBadge[sale.method] as any}>{sale.method}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sale.status === 'completed' ? 'success' : 'warning'} dot>
                      {sale.status === 'completed' ? 'Completed' : 'Returned'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      {expandedId === sale.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                  </td>
                </tr>
                {expandedId === sale.id && (
                  <tr className="border-b border-[var(--pos-border)]/50">
                    <td colSpan={8} className="px-8 py-4 bg-white/[0.01]">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {['Item', 'Qty', 'Unit Price', 'Total'].map((h) => (
                              <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sale.details.map((item, i) => (
                            <tr key={i}>
                              <td className="py-1.5 text-sm text-[var(--pos-text)]">{item.name}</td>
                              <td className="py-1.5 text-sm text-gray-400">{item.qty}</td>
                              <td className="py-1.5 text-sm text-gray-400">Rs. {item.price}</td>
                              <td className="py-1.5 text-sm font-medium text-[var(--pos-text)]">Rs. {item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
