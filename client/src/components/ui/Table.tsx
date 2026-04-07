import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortDirection } from '@/hooks/useSorting';

export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="glass-card-static p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className={cn('w-full text-sm', className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-[var(--surface)]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('', className)} {...props}>{children}</tbody>;
}

export function TableRow({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--surface-border)] transition-all duration-200',
        'hover:bg-[var(--surface-hover)]',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3.5 text-[var(--text-primary)]', className)} {...props}>
      {children}
    </td>
  );
}

/* ------------------------------------------------------------------ */
/*  SortableTableHead                                                  */
/* ------------------------------------------------------------------ */

interface SortableTableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortKey: string;
  currentSortKey: string | null;
  sortDir: SortDirection;
  onSort: (key: string) => void;
}

export function SortableTableHead({
  children,
  sortKey,
  currentSortKey,
  sortDir,
  onSort,
  className,
  ...props
}: SortableTableHeadProps) {
  const isActive = currentSortKey === sortKey;

  const Icon = isActive
    ? sortDir === 'asc'
      ? ChevronUp
      : sortDir === 'desc'
        ? ChevronDown
        : ChevronsUpDown
    : ChevronsUpDown;

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cn(
        'px-4 py-3.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider',
        'cursor-pointer select-none whitespace-nowrap',
        'hover:text-[var(--primary)] transition-colors',
        isActive && 'text-[var(--primary)]',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <Icon
          className={cn(
            'w-3.5 h-3.5 shrink-0',
            isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]/50',
          )}
        />
      </span>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/*  TableFooter (for pagination)                                       */
/* ------------------------------------------------------------------ */

export function TableFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-t border-[var(--surface-border)] bg-[var(--surface)]/50 px-4 py-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
