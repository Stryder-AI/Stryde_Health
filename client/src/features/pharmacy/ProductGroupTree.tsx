import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProductGroup {
  id: string;
  name: string;
  count?: number;
  children?: ProductGroup[];
}

interface ProductGroupTreeProps {
  groups: ProductGroup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default Product Groups                                             */
/* ------------------------------------------------------------------ */

export const defaultProductGroups: ProductGroup[] = [
  {
    id: 'all', name: 'All Products', count: 156, children: [
      {
        id: 'tablets', name: 'Tablets & Capsules', count: 68, children: [
          { id: 'cardio', name: 'Cardiovascular', count: 14 },
          { id: 'antibiotics', name: 'Antibiotics', count: 12 },
          { id: 'analgesics', name: 'Analgesics / Pain', count: 10 },
          { id: 'antidiabetic', name: 'Anti-Diabetic', count: 8 },
          { id: 'gi', name: 'GI / Antacids', count: 9 },
          { id: 'respiratory', name: 'Respiratory', count: 7 },
          { id: 'neuro', name: 'Neurological', count: 8 },
        ],
      },
      {
        id: 'injectables', name: 'Injectables', count: 22, children: [
          { id: 'iv-fluids', name: 'IV Fluids', count: 8 },
          { id: 'vaccines', name: 'Vaccines', count: 6 },
          { id: 'injections', name: 'General Injections', count: 8 },
        ],
      },
      {
        id: 'syrups', name: 'Syrups & Suspensions', count: 18, children: [
          { id: 'pediatric-syrups', name: 'Pediatric', count: 10 },
          { id: 'adult-syrups', name: 'Adult', count: 8 },
        ],
      },
      {
        id: 'topicals', name: 'Topical / External', count: 15, children: [
          { id: 'creams', name: 'Creams & Ointments', count: 8 },
          { id: 'drops', name: 'Eye / Ear Drops', count: 7 },
        ],
      },
      {
        id: 'surgical', name: 'Surgical Supplies', count: 12, children: [
          { id: 'bandages', name: 'Bandages & Dressing', count: 6 },
          { id: 'sutures', name: 'Sutures & Needles', count: 6 },
        ],
      },
      { id: 'otc', name: 'OTC / General', count: 21 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Tree Node                                                          */
/* ------------------------------------------------------------------ */

function TreeNode({
  group,
  level,
  selectedId,
  onSelect,
  defaultExpanded = false,
}: {
  group: ProductGroup;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = group.children && group.children.length > 0;
  const isSelected = selectedId === group.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect(group.id === 'all' ? null : group.id);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 group',
          isSelected
            ? 'bg-[var(--pos-accent)]/20 text-[var(--pos-accent)] font-medium'
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Folder icon */}
        {hasChildren ? (
          expanded ? (
            <FolderOpen className={cn('w-4 h-4 shrink-0', isSelected ? 'text-[var(--pos-accent)]' : 'text-gray-500')} />
          ) : (
            <Folder className={cn('w-4 h-4 shrink-0', isSelected ? 'text-[var(--pos-accent)]' : 'text-gray-500')} />
          )
        ) : (
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isSelected ? 'bg-[var(--pos-accent)]' : 'bg-gray-600')} />
        )}

        <span className="truncate">{group.name}</span>

        {group.count !== undefined && (
          <span className={cn(
            'ml-auto text-[11px] tabular-nums shrink-0',
            isSelected ? 'text-[var(--pos-accent)]' : 'text-gray-500'
          )}>
            {group.count}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="animate-fade-in" style={{ animationDuration: '0.15s' }}>
          {group.children!.map((child) => (
            <TreeNode
              key={child.id}
              group={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ProductGroupTree({ groups, selectedId, onSelect, className }: ProductGroupTreeProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {groups.map((group) => (
        <TreeNode
          key={group.id}
          group={group}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultExpanded={group.id === 'all'}
        />
      ))}
    </div>
  );
}
