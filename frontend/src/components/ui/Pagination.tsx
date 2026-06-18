import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg border border-border transition-colors',
          currentPage === 1
            ? 'text-text-secondary cursor-not-allowed'
            : 'text-text-primary hover:bg-primary-secondary'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-primary-secondary transition-colors"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-text-secondary">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg border transition-colors',
            currentPage === page
              ? 'bg-primary-teal text-white border-primary-teal'
              : 'border-border hover:bg-primary-secondary'
          )}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-text-secondary">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-primary-secondary transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg border border-border transition-colors',
          currentPage === totalPages
            ? 'text-text-secondary cursor-not-allowed'
            : 'text-text-primary hover:bg-primary-secondary'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
