import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    );
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const btnBase =
    'inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
      {/* Results text */}
      <p className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
        {totalItems === 0 ? (
          'No results'
        ) : (
          <>
            Showing{' '}
            <span className="font-semibold text-[var(--text-primary)]">{startItem}</span>
            {' – '}
            <span className="font-semibold text-[var(--text-primary)]">{endItem}</span>
            {' of '}
            <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span>
            {' results'}
          </>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-tertiary)]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 rounded-[var(--radius-xs)] bg-[var(--surface)] border border-[var(--surface-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-0.5">
          {/* First */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className={cn(
              btnBase,
              currentPage === 1
                ? 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]',
            )}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={cn(
              btnBase,
              currentPage === 1
                ? 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]',
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, i) =>
            page === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex items-center justify-center w-8 h-8 text-xs text-[var(--text-tertiary)]"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  btnBase,
                  page === currentPage
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]',
                )}
              >
                {page}
              </button>
            ),
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={cn(
              btnBase,
              currentPage === totalPages
                ? 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]',
            )}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            className={cn(
              btnBase,
              currentPage === totalPages
                ? 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]',
            )}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
