import { Badge } from '@/components/ui/Badge';

const statusMap: Record<string, { variant: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'default'; label: string }> = {
  waiting: { variant: 'waiting', label: 'Waiting' },
  in_progress: { variant: 'in_progress', label: 'In Progress' },
  completed: { variant: 'completed', label: 'Completed' },
  cancelled: { variant: 'cancelled', label: 'Cancelled' },
  no_show: { variant: 'cancelled', label: 'No Show' },
  active: { variant: 'in_progress', label: 'Active' },
  dispensed: { variant: 'completed', label: 'Dispensed' },
  partially_dispensed: { variant: 'waiting', label: 'Partial' },
  paid: { variant: 'completed', label: 'Paid' },
  unpaid: { variant: 'cancelled', label: 'Unpaid' },
  partial: { variant: 'waiting', label: 'Partial' },
  pending: { variant: 'waiting', label: 'Pending' },
  referred: { variant: 'in_progress', label: 'Referred' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] || { variant: 'default' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
