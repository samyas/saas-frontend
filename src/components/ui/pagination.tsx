'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    // Show all pages
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show limited pages with ellipsis
    if (currentPage < 3) {
      // Near start
      for (let i = 0; i < 3; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages - 1);
    } else if (currentPage > totalPages - 4) {
      // Near end
      pages.push(0);
      pages.push('...');
      for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
    } else {
      // Middle
      pages.push(0);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages - 1);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
