import { useState } from 'react';
import { TrendingUp, Users, Activity, FlaskConical, ShoppingCart, Calendar, BarChart3, Clock } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ReportExport } from '@/components/shared/ReportExport';

type DatePreset = 'today' | 'week' | 'month' | 'custom';

const revenueByDepartment = [
  { name: 'General OPD', value: 245000, color: 'from-blue-500 to-blue-400' },
  { name: 'Cardiology', value: 198000, color: 'from-red-500 to-red-400' },
  { name: 'Gynecology', value: 175000, color: 'from-pink-500 to-pink-400' },
  { name: 'Orthopedics', value: 142000, color: 'from-amber-500 to-amber-400' },
  { name: 'Neurology', value: 128000, color: 'from-purple-500 to-purple-400' },
  { name: 'Pediatrics', value: 95000, color: 'from-green-500 to-green-400' },
  { name: 'ENT', value: 78000, color: 'from-teal-500 to-teal-400' },
  { name: 'Dermatology', value: 65000, color: 'from-orange-500 to-orange-400' },
];

const maxDeptRevenue = Math.max(...revenueByDepartment.map((d) => d.value));

const revenueByType = [
  { type: 'Consultation Fees', value: 485000, pct: 42, color: '#3b82f6' },
  { type: 'Lab & Diagnostics', value: 328000, pct: 28, color: '#8b5cf6' },
  { type: 'Pharmacy Sales', value: 352000, pct: 30, color: '#10b981' },
];

const dailyPatientCounts = [
  { day: 'Mar 16', count: 38 }, { day: 'Mar 17', count: 42 }, { day: 'Mar 18', count: 55 },
  { day: 'Mar 19', count: 48 }, { day: 'Mar 20', count: 62 }, { day: 'Mar 21', count: 51 },
  { day: 'Mar 22', count: 35 }, { day: 'Mar 23', count: 44 }, { day: 'Mar 24', count: 58 },
  { day: 'Mar 25', count: 52 }, { day: 'Mar 26', count: 67 }, { day: 'Mar 27', count: 61 },
  { day: 'Mar 28', count: 53 }, { day: 'Mar 29', count: 47 },
];

const maxPatientCount = Math.max(...dailyPatientCounts.map((d) => d.count));

const topDeptsByPatient = [
  { name: 'General OPD', count: 312 },
  { name: 'Pediatrics', count: 185 },
  { name: 'Gynecology', count: 148 },
  { name: 'Cardiology', count: 124 },
  { name: 'Orthopedics', count: 98 },
];

const maxPatientDept = topDeptsByPatient[0].count;

const doctorPerformance = [
  { name: 'Dr. Tariq Ahmed', department: 'General OPD', patients: 128, revenue: 256000, avgTime: '12 min' },
  { name: 'Dr. Saira Khan', department: 'Gynecology', patients: 95, revenue: 285000, avgTime: '18 min' },
  { name: 'Dr. Rizwan Malik', department: 'Cardiology', patients: 82, revenue: 287000, avgTime: '20 min' },
  { name: 'Dr. Amna Farooq', department: 'Pediatrics', patients: 110, revenue: 165000, avgTime: '14 min' },
  { name: 'Dr. Khalid Hussain', department: 'Orthopedics', patients: 72, revenue: 180000, avgTime: '16 min' },
  { name: 'Dr. Faisal Raza', department: 'Neurology', patients: 48, revenue: 192000, avgTime: '25 min' },
  { name: 'Dr. Nadia Ashraf', department: 'Dermatology', patients: 88, revenue: 220000, avgTime: '10 min' },
  { name: 'Dr. Imran Qureshi', department: 'ENT', patients: 65, revenue: 130000, avgTime: '15 min' },
];

const mostOrderedTests = [
  { name: 'CBC — Complete Blood Count', count: 342, color: 'from-blue-500 to-blue-400' },
  { name: 'Lipid Profile', count: 218, color: 'from-purple-500 to-purple-400' },
  { name: 'RFTs — Renal Function Tests', count: 195, color: 'from-teal-500 to-teal-400' },
  { name: 'LFTs — Liver Function Tests', count: 178, color: 'from-green-500 to-green-400' },
  { name: 'Thyroid Profile (T3, T4, TSH)', count: 156, color: 'from-amber-500 to-amber-400' },
  { name: 'HbA1c', count: 142, color: 'from-red-500 to-red-400' },
  { name: 'Urine Complete', count: 128, color: 'from-pink-500 to-pink-400' },
  { name: 'X-Ray Chest', count: 115, color: 'from-orange-500 to-orange-400' },
];

const maxTestCount = mostOrderedTests[0].count;

const topPharmacyProducts = [
  { name: 'Panadol Extra 500mg', sold: 342, revenue: 51300 },
  { name: 'Augmentin 625mg', sold: 198, revenue: 89100 },
  { name: 'Omeprazole 20mg', sold: 275, revenue: 27500 },
  { name: 'Amlodipine 5mg', sold: 189, revenue: 18900 },
  { name: 'Metformin 500mg', sold: 165, revenue: 16500 },
];

export function Reports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('month');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Comprehensive hospital performance analytics.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <ReportExport
            data={doctorPerformance.map((d) => ({ ...d, revenue: `Rs. ${d.revenue.toLocaleString()}` }))}
            columns={[
              { key: 'name', label: 'Doctor' },
              { key: 'department', label: 'Department' },
              { key: 'patients', label: 'Patients' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'avgTime', label: 'Avg Time' },
            ]}
            title="Hospital Performance Report"
            filename="stryde-health-report"
          />
          <div className="flex items-center gap-2">
          {(['today', 'week', 'month', 'custom'] as DatePreset[]).map((preset) => (
            <Button
              key={preset}
              variant={datePreset === preset ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setDatePreset(preset)}
            >
              <Calendar className="w-3.5 h-3.5" />
              {preset === 'today' ? 'Today' : preset === 'week' ? 'This Week' : preset === 'month' ? 'This Month' : 'Custom'}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {/* ── Revenue Overview ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Revenue Overview</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Revenue Big Number */}
          <Card hover={false} className="p-6 flex flex-col justify-center">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Total Revenue</p>
            <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-2">Rs. 1,165,000</p>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--success-bg)] text-emerald-600 mt-3 w-fit">
              <TrendingUp className="w-3 h-3" /> +15% vs last month
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-4">
              Across all departments and revenue streams for the selected period.
            </p>
          </Card>

          {/* Revenue by Department */}
          <Card hover={false} className="p-6">
            <CardTitle>Revenue by Department</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">Horizontal breakdown</p>
            <div className="space-y-3">
              {revenueByDepartment.map((dept) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)]">{dept.name}</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Rs. {(dept.value / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface)] rounded-full border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dept.color} transition-all duration-700`}
                      style={{ width: `${(dept.value / maxDeptRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue by Type — CSS Donut */}
          <Card hover={false} className="p-6">
            <CardTitle>Revenue by Type</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">Fee category breakdown</p>
            <div className="flex justify-center mb-5">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return revenueByType.map((item) => {
                      const dash = item.pct;
                      const gap = 100 - dash;
                      const currentOffset = offset;
                      offset += dash;
                      return (
                        <circle
                          key={item.type}
                          cx="18" cy="18" r="15.9155"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="3.5"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[var(--text-primary)]">Rs. 1.16M</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Total</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {revenueByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[var(--text-primary)]">{item.type}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{item.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Patient Volume ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Patient Volume</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Patient Count Chart */}
          <Card hover={false} className="lg:col-span-2 p-6">
            <CardTitle>Daily Patient Count — Last 14 Days</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">Total patients seen each day</p>
            <div className="flex items-end gap-2 h-44">
              {dailyPatientCounts.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">{d.count}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)]" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-700 ease-out"
                      style={{ height: `${(d.count / maxPatientCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-[var(--text-tertiary)]">{d.day.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Departments by Patient Count */}
          <Card hover={false} className="p-6">
            <CardTitle>Top Departments</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">By patient count this month</p>
            <div className="space-y-4">
              {topDeptsByPatient.map((dept, idx) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] text-[10px] font-bold text-[var(--text-secondary)]">{idx + 1}</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{dept.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{dept.count}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface)] rounded-full border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                      style={{ width: `${(dept.count / maxPatientDept) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Doctor Performance ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Doctor Performance</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Patients This Month</TableHead>
              <TableHead>Revenue Generated</TableHead>
              <TableHead>Avg Consultation Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctorPerformance.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell className="font-semibold">{doc.name}</TableCell>
                <TableCell><Badge variant="default">{doc.department}</Badge></TableCell>
                <TableCell>{doc.patients}</TableCell>
                <TableCell className="font-semibold">Rs. {doc.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                    <Clock className="w-3.5 h-3.5" /> {doc.avgTime}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Lab Statistics ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Lab Statistics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Ordered Tests */}
          <Card hover={false} className="lg:col-span-2 p-6">
            <CardTitle>Most Ordered Tests</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">By order count this month</p>
            <div className="space-y-3">
              {mostOrderedTests.map((test) => (
                <div key={test.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)]">{test.name}</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{test.count} orders</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface)] rounded-full border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${test.color} transition-all duration-700`}
                      style={{ width: `${(test.count / maxTestCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Avg Turnaround */}
          <Card hover={false} className="p-6">
            <CardTitle>Turnaround Time</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">Average result delivery</p>
            <div className="space-y-4">
              {[
                { name: 'CBC', time: '45 min', pct: 30 },
                { name: 'Lipid Profile', time: '2 hrs', pct: 50 },
                { name: 'RFTs', time: '3 hrs', pct: 63 },
                { name: 'LFTs', time: '3 hrs', pct: 63 },
                { name: 'Thyroid Profile', time: '6 hrs', pct: 75 },
                { name: 'HbA1c', time: '4 hrs', pct: 67 },
                { name: 'X-Ray', time: '30 min', pct: 25 },
                { name: 'Ultrasound', time: '1 hr', pct: 42 },
              ].map((test) => (
                <div key={test.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[var(--text-primary)] w-28 shrink-0">{test.name}</span>
                  <div className="flex-1 h-2 bg-[var(--surface)] rounded-full border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${test.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] w-14 text-right shrink-0">{test.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Pharmacy Section ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Pharmacy</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card hover={false} className="p-6">
            <CardTitle>Top Products</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">By units sold this month</p>
            <div className="space-y-3">
              {topPharmacyProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{product.sold} units</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Rs. {product.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stock Value */}
          <Card hover={false} className="p-6">
            <CardTitle>Stock Summary</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">Current inventory valuation</p>
            <div className="space-y-5">
              <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Total Stock Value</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">Rs. 4.2M</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Products</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] mt-1">1,248</p>
                </div>
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Categories</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] mt-1">142</p>
                </div>
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Low Stock</p>
                  <p className="text-lg font-bold text-amber-600 mt-1">6</p>
                </div>
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Expiring Soon</p>
                  <p className="text-lg font-bold text-red-600 mt-1">3</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Margin Analysis */}
          <Card hover={false} className="p-6">
            <CardTitle>Margin Analysis</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-5">Profitability summary</p>
            <div className="space-y-5">
              <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Gross Margin</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">32.5%</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Total Sales', value: 'Rs. 352,000' },
                  { label: 'Cost of Goods', value: 'Rs. 237,600' },
                  { label: 'Gross Profit', value: 'Rs. 114,400' },
                  { label: 'Avg Markup', value: '48%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
                    <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer note */}
      <Card hover={false} className="p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--text-tertiary)]" />
          <p className="text-xs text-[var(--text-tertiary)]">
            All reports are generated from demo data. In production, data refreshes every 5 minutes.
          </p>
        </div>
      </Card>
    </div>
  );
}
