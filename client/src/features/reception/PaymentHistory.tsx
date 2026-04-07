import { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
  TableFooter,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useSorting } from '@/hooks/useSorting';
import { MetricCard } from '@/components/shared/MetricCard';
import { Banknote, CreditCard, TrendingUp, Receipt } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

interface PaymentRecord {
  receipt: string;
  date: string;
  patient: string;
  mr: string;
  items: string;
  total: number;
  method: string;
  status: string;
}

const demoPayments: PaymentRecord[] = [
  { receipt: 'RCP-20260329-001', date: '2026-03-29', patient: 'Ahmed Raza', mr: 'MR-10234', items: 'Consultation, ECG, Medicines', total: 5150, method: 'Cash', status: 'paid' },
  { receipt: 'RCP-20260329-002', date: '2026-03-29', patient: 'Fatima Bibi', mr: 'MR-10235', items: 'Consultation, Ultrasound', total: 4500, method: 'EasyPaisa', status: 'paid' },
  { receipt: 'RCP-20260329-003', date: '2026-03-29', patient: 'Usman Tariq', mr: 'MR-10236', items: 'Consultation, X-Ray, Medicines', total: 5450, method: 'Cash', status: 'paid' },
  { receipt: 'RCP-20260329-004', date: '2026-03-29', patient: 'Ayesha Noor', mr: 'MR-10237', items: 'Consultation, CBC, Thyroid Panel', total: 6300, method: 'Credit Card', status: 'paid' },
  { receipt: 'RCP-20260329-005', date: '2026-03-29', patient: 'Bilal Hussain', mr: 'MR-10238', items: 'Consultation', total: 2500, method: 'Cash', status: 'partial' },
  { receipt: 'RCP-20260328-001', date: '2026-03-28', patient: 'Hassan Ali', mr: 'MR-10240', items: 'Consultation, ECG, Echo, Medicines', total: 9650, method: 'Cheque', status: 'paid' },
  { receipt: 'RCP-20260328-002', date: '2026-03-28', patient: 'Rabia Kanwal', mr: 'MR-10241', items: 'Consultation, Ultrasound', total: 3500, method: 'Cash', status: 'paid' },
  { receipt: 'RCP-20260328-003', date: '2026-03-28', patient: 'Naveed Iqbal', mr: 'MR-10242', items: 'Consultation, CBC', total: 3300, method: 'EasyPaisa', status: 'paid' },
  { receipt: 'RCP-20260327-001', date: '2026-03-27', patient: 'Sadia Parveen', mr: 'MR-10243', items: 'Consultation, Skin Biopsy', total: 7500, method: 'Credit Card', status: 'paid' },
  { receipt: 'RCP-20260327-002', date: '2026-03-27', patient: 'Kamran Yousaf', mr: 'MR-10244', items: 'Consultation, Blood Sugar', total: 2800, method: 'Cash', status: 'unpaid' },
  { receipt: 'RCP-20260327-003', date: '2026-03-27', patient: 'Amna Siddiqui', mr: 'MR-10245', items: 'Consultation, MRI Brain', total: 15000, method: 'Cash', status: 'paid' },
  { receipt: 'RCP-20260326-001', date: '2026-03-26', patient: 'Tariq Mehmood', mr: 'MR-10246', items: 'Consultation, Lipid Profile', total: 3200, method: 'EasyPaisa', status: 'paid' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function PaymentHistory() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);

  const filtered = useMemo(() => {
    return demoPayments.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.patient.toLowerCase().includes(q) ||
        p.mr.toLowerCase().includes(q) ||
        p.receipt.toLowerCase().includes(q);
      const matchesFrom = !dateFrom || p.date >= dateFrom;
      const matchesTo = !dateTo || p.date <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [search, dateFrom, dateTo]);

  const { sortedItems, sortKey, sortDir, handleSort } = useSorting(filtered);
  const { paginatedItems, currentPage, totalPages, itemsPerPage, goToPage, changePageSize } =
    usePagination(sortedItems, 10);

  const totalCollected = filtered
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.total, 0);

  const totalPending = filtered
    .filter((p) => p.status !== 'paid')
    .reduce((s, p) => s + p.total, 0);

  const methodBadge = (method: string) => {
    switch (method) {
      case 'Cash': return <Badge variant="success">{method}</Badge>;
      case 'EasyPaisa': return <Badge variant="info">{method}</Badge>;
      case 'Credit Card': return <Badge variant="accent">{method}</Badge>;
      case 'Cheque': return <Badge variant="warning">{method}</Badge>;
      default: return <Badge>{method}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--primary)]" />
          Payment History
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          View and search all payment transactions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        <MetricCard
          title="Total Collected"
          value={`Rs. ${totalCollected.toLocaleString()}`}
          subtitle={`${filtered.filter((p) => p.status === 'paid').length} payments`}
          icon={Banknote}
          iconColor="bg-[rgba(16,185,129,0.12)] text-emerald-500"
        />
        <MetricCard
          title="Pending / Partial"
          value={`Rs. ${totalPending.toLocaleString()}`}
          subtitle={`${filtered.filter((p) => p.status !== 'paid').length} invoices`}
          icon={Receipt}
          iconColor="bg-[rgba(245,158,11,0.12)] text-amber-500"
        />
        <MetricCard
          title="Total Transactions"
          value={filtered.length}
          subtitle="Matching current filters"
          icon={CreditCard}
          iconColor="bg-[rgba(59,130,246,0.12)] text-blue-500"
        />
        <MetricCard
          title="Avg. Transaction"
          value={`Rs. ${filtered.length ? Math.round(filtered.reduce((s, p) => s + p.total, 0) / filtered.length).toLocaleString() : 0}`}
          subtitle="Per patient"
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <Card hover={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search patient, MR#, receipt..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              loading={filterLoading}
              loadingText="Filtering..."
              onClick={() => {
                setFilterLoading(true);
                setTimeout(() => setFilterLoading(false), 600);
              }}
              className="shrink-0"
            >
              <Download className="w-4 h-4" />
              Apply
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          type="no-data"
          title="No payment records found"
          description="No transactions match your current search or date filters. Try adjusting your filters or clearing the search."
        />
      )}

      {/* Table */}
      {filtered.length > 0 && (
      <div className="glass-card-static p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <SortableTableHead
                  sortKey="date"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof PaymentRecord)}
                >
                  Date
                </SortableTableHead>
                <SortableTableHead
                  sortKey="patient"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof PaymentRecord)}
                >
                  Patient
                </SortableTableHead>
                <TableHead>Items</TableHead>
                <SortableTableHead
                  sortKey="total"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof PaymentRecord)}
                  className="text-right"
                >
                  Total (Rs.)
                </SortableTableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="stagger-children">
              {paginatedItems.map((p) => (
                <TableRow key={p.receipt}>
                  <TableCell className="font-mono text-xs font-semibold text-[var(--primary)]">
                    {p.receipt}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {new Date(p.date).toLocaleDateString('en-PK', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.patient}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{p.mr}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)] max-w-[200px] truncate">
                    {p.items}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {p.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{methodBadge(p.method)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[var(--text-tertiary)]">
                    No payment records match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
        <TableFooter>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </TableFooter>
      </div>
      )}
    </div>
  );
}
