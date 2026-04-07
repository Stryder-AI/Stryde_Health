import { useState, type ReactNode } from 'react';
import { GripVertical, ChevronDown, ChevronUp, X, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWidgetStore } from '@/stores/widgetStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/Checkbox';

interface WidgetConfig {
  id: string;
  title: string;
}

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function WidgetWrapper({ id, title, children, className }: WidgetWrapperProps) {
  const { user } = useAuthStore();
  const role = user?.role || 'unknown';
  const { isWidgetVisible, isWidgetCollapsed, toggleWidgetCollapse, toggleWidgetVisibility } = useWidgetStore();

  if (!isWidgetVisible(role, id)) return null;

  const collapsed = isWidgetCollapsed(role, id);

  return (
    <div className={cn('glass-card p-0 overflow-hidden transition-all duration-300', className)}>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--surface-border)]">
        <GripVertical className="w-4 h-4 text-[var(--text-tertiary)] cursor-grab" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex-1">{title}</h3>
        <button
          onClick={() => toggleWidgetCollapse(role, id)}
          className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
          )}
        </button>
        <button
          onClick={() => toggleWidgetVisibility(role, id)}
          className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--danger-bg)] transition-colors group"
          title="Hide widget"
        >
          <X className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--danger)]" />
        </button>
      </div>
      <div
        className={cn(
          'transition-all duration-300 overflow-hidden',
          collapsed ? 'max-h-0' : 'max-h-[2000px]'
        )}
      >
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface CustomizeDashboardProps {
  widgets: WidgetConfig[];
}

export function CustomizeDashboard({ widgets }: CustomizeDashboardProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role || 'unknown';
  const { isWidgetVisible, setWidgetVisibility } = useWidgetStore();

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Settings2 className="w-4 h-4" />
        Customize Dashboard
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Customize Dashboard"
        description="Choose which widgets to show on your dashboard."
        size="sm"
        footer={
          <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          {widgets.map((w) => (
            <Checkbox
              key={w.id}
              label={w.title}
              checked={isWidgetVisible(role, w.id)}
              onChange={() => {
                const current = isWidgetVisible(role, w.id);
                setWidgetVisibility(role, w.id, !current);
              }}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
