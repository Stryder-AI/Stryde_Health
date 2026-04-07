import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  User,
  Hash,
  FlaskConical,
  Search,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Filter,
  LayoutList,
  ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { ALL_TEMPLATES, type TemplateConfig, type TemplateParameter } from './templates/GenericTemplate';
import { AbnormalFlag, classifyValue } from './AbnormalFlag';

// ─── Types ─────────────────────────────────────────────────────────────────

interface BatchOrder {
  id: string;
  patient: string;
  mrn: string;
  doctor: string;
  testId: string;
  testName: string;
  selected: boolean;
}

type RowStatus = 'empty' | 'partial' | 'complete';

// ─── Demo Data ─────────────────────────────────────────────────────────────

const demoBatchOrders: BatchOrder[] = [
  { id: 'ORD-3045', patient: 'Mohammad Irfan', mrn: 'MR-10412', doctor: 'Dr. Sarah Ali', testId: 'cbc', testName: 'CBC', selected: true },
  { id: 'ORD-3042', patient: 'Amina Khatoon', mrn: 'MR-10389', doctor: 'Dr. Kamran Javed', testId: 'lft', testName: 'LFT', selected: true },
  { id: 'ORD-3044', patient: 'Khalid Mahmood', mrn: 'MR-10405', doctor: 'Dr. Bilal Ahmed', testId: 'lipid', testName: 'Lipid Profile', selected: true },
  { id: 'ORD-3043', patient: 'Sadia Parveen', mrn: 'MR-10398', doctor: 'Dr. Sarah Ali', testId: 'thyroid', testName: 'Thyroid Panel', selected: true },
  { id: 'ORD-3039', patient: 'Rabia Aslam', mrn: 'MR-10385', doctor: 'Dr. Ayesha Malik', testId: 'cbc', testName: 'CBC', selected: true },
  { id: 'ORD-3040', patient: 'Rashid Mehmood', mrn: 'MR-10401', doctor: 'Dr. Ayesha Malik', testId: 'rft', testName: 'RFT', selected: true },
  { id: 'ORD-3038', patient: 'Bushra Naz', mrn: 'MR-10378', doctor: 'Dr. Imran Shah', testId: 'cbc', testName: 'CBC', selected: false },
  { id: 'ORD-3036', patient: 'Nusrat Jahan', mrn: 'MR-10365', doctor: 'Dr. Imran Shah', testId: 'rft', testName: 'RFT', selected: false },
  { id: 'ORD-3035', patient: 'Waqar Younis', mrn: 'MR-10359', doctor: 'Dr. Sarah Ali', testId: 'urinalysis', testName: 'Urinalysis', selected: false },
  { id: 'ORD-3037', patient: 'Naveed Akhtar', mrn: 'MR-10372', doctor: 'Dr. Bilal Ahmed', testId: 'lipid', testName: 'Lipid Profile', selected: false },
  { id: 'ORD-3041', patient: 'Farhan Ali', mrn: 'MR-10392', doctor: 'Dr. Kamran Javed', testId: 'thyroid', testName: 'Thyroid Panel', selected: false },
  { id: 'ORD-3034', patient: 'Tahira Begum', mrn: 'MR-10350', doctor: 'Dr. Sarah Ali', testId: 'lft', testName: 'LFT', selected: false },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getTemplate(testId: string): TemplateConfig | undefined {
  return ALL_TEMPLATES.find((t) => t.id === testId);
}

function getRowStatus(
  values: Record<string, string>,
  params: TemplateParameter[]
): RowStatus {
  const filled = params.filter((p) => values[p.id]?.trim()).length;
  if (filled === 0) return 'empty';
  if (filled === params.length) return 'complete';
  return 'partial';
}

const statusColors: Record<RowStatus, string> = {
  empty: 'border-l-gray-300 dark:border-l-gray-600',
  partial: 'border-l-amber-400 dark:border-l-amber-500',
  complete: 'border-l-emerald-400 dark:border-l-emerald-500',
};

const statusBg: Record<RowStatus, string> = {
  empty: '',
  partial: 'bg-amber-50/20 dark:bg-amber-950/10',
  complete: 'bg-emerald-50/20 dark:bg-emerald-950/10',
};

// ─── Component ─────────────────────────────────────────────────────────────

export function BatchResultEntry() {
  const [visible, setVisible] = useState(false);
  const [orders, setOrders] = useState<BatchOrder[]>(demoBatchOrders);
  const [allValues, setAllValues] = useState<Record<string, Record<string, string>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Available test types for filtering
  const testTypes = useMemo(() => {
    const types = [...new Set(orders.map((o) => o.testName))].sort();
    return types.map((t) => ({ value: t, label: t }));
  }, [orders]);

  // Selected + filtered orders
  const selectedOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.selected) return false;
      const matchSearch =
        !searchQuery ||
        o.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.mrn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTest = !testFilter || o.testName === testFilter;
      return matchSearch && matchTest;
    });
  }, [orders, searchQuery, testFilter]);

  const unselectedOrders = useMemo(() => {
    return orders.filter((o) => !o.selected);
  }, [orders]);

  // Progress stats
  const stats = useMemo(() => {
    let completed = 0;
    let totalAbnormal = 0;
    selectedOrders.forEach((order) => {
      const tpl = getTemplate(order.testId);
      if (!tpl) return;
      const vals = allValues[order.id] || {};
      const status = getRowStatus(vals, tpl.parameters);
      if (status === 'complete') completed++;
      tpl.parameters.forEach((p) => {
        const v = vals[p.id];
        if (v && p.min !== undefined && p.max !== undefined) {
          const { level } = classifyValue(v, p.min, p.max);
          if (level !== 'normal') totalAbnormal++;
        }
      });
    });
    return { completed, total: selectedOrders.length, abnormal: totalAbnormal };
  }, [selectedOrders, allValues]);

  const handleToggleSelect = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, selected: !o.selected } : o))
    );
  };

  const handleValueChange = useCallback(
    (orderId: string, paramId: string, value: string) => {
      setAllValues((prev) => ({
        ...prev,
        [orderId]: {
          ...(prev[orderId] || {}),
          [paramId]: value,
        },
      }));
    },
    []
  );

  const handleBlurSave = useCallback(
    (orderId: string, paramId: string) => {
      const val = allValues[orderId]?.[paramId];
      if (val?.trim()) {
        // Auto-save silently (in production, would call API)
      }
    },
    [allValues]
  );

  const handleSubmitAll = () => {
    if (stats.completed === 0) {
      toast.warning(
        'Please complete at least one test before submitting.',
        'No Complete Tests'
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        `${stats.completed} of ${stats.total} reports submitted and generated!`,
        'Batch Submit Complete'
      );
    }, 1500);
  };

  const handleSaveDrafts = () => {
    const partial = selectedOrders.filter((o) => {
      const tpl = getTemplate(o.testId);
      if (!tpl) return false;
      const vals = allValues[o.id] || {};
      return getRowStatus(vals, tpl.parameters) !== 'empty';
    }).length;
    toast.success(`${partial} draft(s) saved successfully.`, 'Drafts Saved');
  };

  // Keyboard nav: tab through fields in order
  const handleKeyDown = (
    e: React.KeyboardEvent,
    orderId: string,
    paramId: string,
    orderIdx: number,
    paramIdx: number
  ) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      const tpl = getTemplate(
        selectedOrders.find((o) => o.id === orderId)?.testId || ''
      );
      if (!tpl) return;

      // If expanded mode, let natural tab work
      if (expandedOrder) return;

      // In compact mode, move to next order's first param or same param
      const nextOrderIdx = orderIdx + 1;
      if (nextOrderIdx < selectedOrders.length) {
        const nextOrder = selectedOrders[nextOrderIdx];
        const nextTpl = getTemplate(nextOrder.testId);
        if (nextTpl && nextTpl.parameters[0]) {
          const ref = inputRefs.current[`${nextOrder.id}-${nextTpl.parameters[0].id}`];
          if (ref) {
            e.preventDefault();
            ref.focus();
          }
        }
      }
    }
  };

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div
      className={cn(
        'space-y-6 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Batch Result Entry
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Enter results for multiple orders at once — efficient and fast
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleSaveDrafts}>
            <Save className="w-4 h-4" />
            Save Drafts
          </Button>
          <Button variant="glow" size="sm" onClick={handleSubmitAll} loading={submitting}>
            <Send className="w-4 h-4" />
            Submit All ({stats.completed})
          </Button>
        </div>
      </div>

      {/* Progress Bar + Stats */}
      <Card hover={false} className="p-5">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Progress */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[var(--text-secondary)] font-medium">
                Progress: {stats.completed} of {stats.total} tests completed
              </span>
              <span className="font-semibold text-[var(--text-primary)]">{completionPct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  completionPct === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-[var(--primary)] to-teal-400'
                )}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            {stats.abnormal > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {stats.abnormal} abnormal
                </span>
              </div>
            )}
            {stats.completed === stats.total && stats.total > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  All Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Color legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--surface-border)]">
          <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            Status:
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-600" />
            Empty
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-500" />
            Partial
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-500" />
            Complete
          </span>
        </div>
      </Card>

      {/* Filters + Selection */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search patient or MR#..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-56">
          <Select
            label="Filter by Test"
            placeholder="All tests"
            options={testTypes}
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchQuery('');
            setTestFilter('');
          }}
        >
          Clear
        </Button>
      </div>

      {/* Add more orders from unselected pool */}
      {unselectedOrders.length > 0 && (
        <Card hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Available Orders ({unselectedOrders.length})
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              — Click to add to batch
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unselectedOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleToggleSelect(order.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs',
                  'bg-[var(--surface)] border border-[var(--surface-border)]',
                  'hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all duration-200',
                  'text-[var(--text-secondary)]'
                )}
              >
                <User className="w-3 h-3" />
                <span className="font-semibold">{order.patient}</span>
                <span className="text-[var(--text-tertiary)]">{order.mrn}</span>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {order.testName}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Batch Entry Grid */}
      <div className="space-y-3">
        {selectedOrders.map((order, orderIdx) => {
          const tpl = getTemplate(order.testId);
          if (!tpl) return null;
          const vals = allValues[order.id] || {};
          const rowStatus = getRowStatus(vals, tpl.parameters);
          const filledCount = tpl.parameters.filter((p) => vals[p.id]?.trim()).length;
          const isExpanded = expandedOrder === order.id;

          // Count abnormals for this row
          let rowAbnormals = 0;
          tpl.parameters.forEach((p) => {
            const v = vals[p.id];
            if (v && p.min !== undefined && p.max !== undefined) {
              const { level } = classifyValue(v, p.min, p.max);
              if (level !== 'normal') rowAbnormals++;
            }
          });

          // Show first few key parameters in compact mode
          const compactParams = tpl.parameters.slice(0, 4);

          return (
            <div
              key={order.id}
              className={cn(
                'glass-card-static p-0 overflow-hidden border-l-4 transition-all duration-300',
                statusColors[rowStatus],
                statusBg[rowStatus]
              )}
              style={{
                animationDelay: `${orderIdx * 60}ms`,
                animation: 'fadeInUp 0.4s ease forwards',
                opacity: 0,
              }}
            >
              {/* Row Header */}
              <div
                className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                {/* Patient Info */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                      rowStatus === 'complete'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : rowStatus === 'partial'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-[var(--surface)]'
                    )}
                  >
                    {rowStatus === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {order.patient}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      <span className="font-mono">{order.mrn}</span> &middot;{' '}
                      <span>{order.id}</span>
                    </p>
                  </div>
                </div>

                {/* Test name */}
                <Badge
                  variant={rowStatus === 'complete' ? 'success' : rowStatus === 'partial' ? 'warning' : 'default'}
                  className="flex-shrink-0"
                >
                  <FlaskConical className="w-3 h-3" />
                  {order.testName}
                </Badge>

                {/* Compact parameter inputs (when not expanded) */}
                {!isExpanded && (
                  <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
                    {compactParams.map((param, paramIdx) => {
                      const val = vals[param.id] || '';
                      const hasVal = val.trim() !== '';
                      const outOfRange =
                        hasVal &&
                        param.min !== undefined &&
                        param.max !== undefined &&
                        classifyValue(val, param.min, param.max).level !== 'normal';
                      return (
                        <div key={param.id} className="flex items-center gap-1">
                          <span className="text-[10px] text-[var(--text-tertiary)] w-12 truncate">
                            {param.name.split(' ')[0]}
                          </span>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${order.id}-${param.id}`] = el;
                            }}
                            type="text"
                            value={val}
                            onChange={(e) =>
                              handleValueChange(order.id, param.id, e.target.value)
                            }
                            onBlur={() => handleBlurSave(order.id, param.id)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, order.id, param.id, orderIdx, paramIdx)
                            }
                            onClick={(e) => e.stopPropagation()}
                            placeholder="--"
                            className={cn(
                              'w-20 px-2 py-1 text-xs rounded-[var(--radius-sm)] border transition-all duration-200',
                              'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                              'focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_var(--primary-glow)]',
                              outOfRange
                                ? 'border-red-400 bg-red-50/30 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold'
                                : hasVal
                                  ? 'border-emerald-300 dark:border-emerald-700'
                                  : 'border-[var(--surface-border)]'
                            )}
                          />
                          {outOfRange && val && (
                            <AbnormalFlag
                              value={val}
                              min={param.min}
                              max={param.max}
                              compact
                              className="flex-shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                    {tpl.parameters.length > 4 && (
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        +{tpl.parameters.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Status info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {filledCount}/{tpl.parameters.length}
                  </span>
                  {rowAbnormals > 0 && (
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      {rowAbnormals} abn
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </div>

                {/* Remove from batch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(order.id);
                  }}
                  className="p-1 rounded hover:bg-[var(--surface)] text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                  title="Remove from batch"
                >
                  &times;
                </button>
              </div>

              {/* Expanded Parameter Grid */}
              {isExpanded && (
                <div className="px-5 pb-4 border-t border-[var(--surface-border)]">
                  <div className="mt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--surface)]">
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[28%]">
                            Parameter
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[22%]">
                            Result
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[12%]">
                            Flag
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[12%]">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[26%]">
                            Reference Range
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tpl.parameters.map((param, paramIdx) => {
                          const val = vals[param.id] || '';
                          const hasVal = val.trim() !== '';
                          const abnResult =
                            hasVal && param.min !== undefined && param.max !== undefined
                              ? classifyValue(val, param.min, param.max)
                              : null;
                          const outOfRange = abnResult && abnResult.level !== 'normal';

                          return (
                            <tr
                              key={param.id}
                              className={cn(
                                'border-b border-[var(--surface-border)]',
                                outOfRange && 'bg-red-50/40 dark:bg-red-950/15'
                              )}
                            >
                              <td className="px-3 py-2 text-[var(--text-primary)] font-medium text-xs">
                                {param.name}
                              </td>
                              <td className="px-3 py-1.5">
                                <input
                                  ref={(el) => {
                                    inputRefs.current[`${order.id}-${param.id}`] = el;
                                  }}
                                  type="text"
                                  value={val}
                                  onChange={(e) =>
                                    handleValueChange(order.id, param.id, e.target.value)
                                  }
                                  onBlur={() => handleBlurSave(order.id, param.id)}
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, order.id, param.id, orderIdx, paramIdx)
                                  }
                                  placeholder="--"
                                  className={cn(
                                    'w-full px-2.5 py-1.5 text-xs rounded-[var(--radius-sm)] border transition-all duration-200',
                                    'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                                    'focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_var(--primary-glow)]',
                                    outOfRange
                                      ? 'border-red-400 bg-red-50/30 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold'
                                      : hasVal
                                        ? 'border-emerald-300 dark:border-emerald-700'
                                        : 'border-[var(--surface-border)]'
                                  )}
                                />
                              </td>
                              <td className="px-3 py-2">
                                {hasVal && param.min !== undefined && param.max !== undefined && (
                                  <AbnormalFlag
                                    value={val}
                                    min={param.min}
                                    max={param.max}
                                    compact
                                  />
                                )}
                              </td>
                              <td className="px-3 py-2 text-[var(--text-secondary)] text-[11px]">
                                {param.unit}
                              </td>
                              <td className="px-3 py-2 text-[var(--text-secondary)] text-[11px] font-mono">
                                {param.referenceRange}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {selectedOrders.length === 0 && (
        <div className="text-center py-16">
          <LayoutList className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">
            {orders.filter((o) => o.selected).length === 0
              ? 'No orders selected for batch entry. Select orders from the list above.'
              : 'No orders match your filters.'}
          </p>
        </div>
      )}

      {/* Bottom Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="glass-card-static p-4 flex items-center justify-between sticky bottom-4 z-10">
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span>
              <span className="font-semibold text-[var(--text-primary)]">{stats.completed}</span> of{' '}
              {stats.total} tests completed
            </span>
            {stats.abnormal > 0 && (
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {stats.abnormal} abnormal values
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleSaveDrafts}>
              <Save className="w-4 h-4" />
              Save Drafts
            </Button>
            <Button variant="glow" onClick={handleSubmitAll} loading={submitting}>
              <Send className="w-4 h-4" />
              Submit All Complete ({stats.completed})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
