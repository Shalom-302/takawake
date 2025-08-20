import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/ds/components/button";
import { Input } from "@/ds/components/input";
import { Select } from "@/ds/components/select";

// Define variants for the pagination component
const paginationVariants = cva("flex flex-wrap items-center gap-1", {
  variants: {
    variant: {
      default: "",
      outline: "",
      ghost: "",
    },
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// Define the pagination types
export type PaginationType = 
  | "default"           // Standard pagination with page numbers
  | "simple"            // Just Previous/Next buttons
  | "compact"           // Page X of Y with arrows
  | "numbered"          // Numbers with Previous/Next
  | "complete"          // With First/Last buttons
  | "rows-per-page"     // With rows per page selector
  | "position-indicator" // Shows X-Y of Z
  | "jump-to-page";     // With direct page input

// Define the props interface for the Pagination component
export interface PaginationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  type?: PaginationType;
  itemsPerPage?: number;
  totalItems?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

/**
 * Pagination Component
 * 
 * A customizable pagination component with different variants and sizes.
 * 
 * @example
 * ```tsx
 * <Pagination
 *   variant="default"
 *   size="default"
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    className, 
    variant, 
    size, 
    currentPage, 
    totalPages, 
    onPageChange, 
    siblingCount = 1, 
    type = "default",
    itemsPerPage = 10,
    totalItems = 0,
    onItemsPerPageChange,
    itemsPerPageOptions = [10, 25, 50, 100],
    ...props 
  }, ref) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
      const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

      // If total pages is less than total page numbers to display
      if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      // Case 1: Show left dots but no right dots
      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = siblingCount * 2 + 1;
        const rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );
        return [1, "leftDots", ...rightRange];
      }

      // Case 2: Show right dots but no left dots
      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = siblingCount * 2 + 1;
        const leftRange = Array.from(
          { length: leftItemCount },
          (_, i) => i + 1
        );
        return [...leftRange, "rightDots", totalPages];
      }

      // Case 3: Show both left and right dots
      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        );
        return [1, "leftDots", ...middleRange, "rightDots", totalPages];
      }

      return [];
    };

    const pageNumbers = getPageNumbers();

    // Get button variant based on pagination variant
    const getButtonVariant = (isActive: boolean) => {
      if (isActive) return variant === "ghost" ? "default" : variant;
      return variant;
    };

    // Get button size based on pagination size
    const getButtonSize = () => {
      switch (size) {
        case "sm":
          return "xs";
        case "lg":
          return "default";
        default:
          return "sm";
      }
    };

    // Calculate start and end items for position indicator
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;
    
    // State for jump to page input
    const [jumpToPage, setJumpToPage] = React.useState<string>(currentPage.toString());
    
    // Handle jump to page
    const handleJumpToPage = () => {
      const page = parseInt(jumpToPage);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    };
    
    // Handle key press for jump to page
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleJumpToPage();
      }
    };
    
    // Update jump to page input when currentPage changes
    React.useEffect(() => {
      setJumpToPage(currentPage.toString());
    }, [currentPage]);

    // Render pagination based on type
    const renderPagination = () => {
      switch (type) {
        case "simple":
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <span className="mr-1">Previous</span>
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                <span className="ml-1">Next</span>
              </Button>
            </>
          );
          
        case "compact":
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center mx-2">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          );
          
        case "numbered":
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <span className="mr-1">Previous</span>
              </Button>
              
              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                  return (
                    <Button
                      key={`dots-${index}`}
                      variant="ghost"
                      size={getButtonSize()}
                      disabled
                      className="cursor-default"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                const isActive = pageNumber === currentPage;
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={getButtonVariant(isActive)}
                    size={getButtonSize()}
                    onClick={() => onPageChange(pageNumber as number)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${pageNumber}`}
                    className={cn(
                      isActive && variant !== "ghost" && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                <span className="ml-1">Next</span>
              </Button>
            </>
          );
          
        case "complete":
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Go to first page"
                className="px-2"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                  return (
                    <Button
                      key={`dots-${index}`}
                      variant="ghost"
                      size={getButtonSize()}
                      disabled
                      className="cursor-default"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                const isActive = pageNumber === currentPage;
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={getButtonVariant(isActive)}
                    size={getButtonSize()}
                    onClick={() => onPageChange(pageNumber as number)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${pageNumber}`}
                    className={cn(
                      isActive && variant !== "ghost" && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Go to last page"
                className="px-2"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </>
          );
          
        case "rows-per-page":
          return (
            <>
              <div className="flex items-center mr-4">
                <span className="mr-2">Rows per page</span>
                <div className="w-[70px]">
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => onItemsPerPageChange?.(parseInt(value))}
                  options={itemsPerPageOptions.map(option => ({
                    value: option.toString(),
                    label: option.toString()
                  }))}
                  placeholder={itemsPerPage.toString()}
                />
              </div>
              </div>
              
              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                  return (
                    <Button
                      key={`dots-${index}`}
                      variant="ghost"
                      size={getButtonSize()}
                      disabled
                      className="cursor-default"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                const isActive = pageNumber === currentPage;
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={getButtonVariant(isActive)}
                    size={getButtonSize()}
                    onClick={() => onPageChange(pageNumber as number)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${pageNumber}`}
                    className={cn(
                      isActive && variant !== "ghost" && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </>
          );
          
        case "position-indicator":
          return (
            <>
              <div className="flex items-center mr-4">
                <span>{startItem}-{endItem} of {totalItems}</span>
              </div>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Go to first page"
                className="px-2"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Go to last page"
                className="px-2"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </>
          );
          
        case "jump-to-page":
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Go to first page"
                className="px-2"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                  return (
                    <Button
                      key={`dots-${index}`}
                      variant="ghost"
                      size={getButtonSize()}
                      disabled
                      className="cursor-default"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                const isActive = pageNumber === currentPage;
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={getButtonVariant(isActive)}
                    size={getButtonSize()}
                    onClick={() => onPageChange(pageNumber as number)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${pageNumber}`}
                    className={cn(
                      isActive && variant !== "ghost" && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Go to last page"
                className="px-2"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center ml-4">
                <span className="mr-2">Go to page</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleJumpToPage}
                  className="w-16 h-8"
                />
              </div>
            </>
          );
          
        default: // "default" type
          return (
            <>
              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                  return (
                    <Button
                      key={`dots-${index}`}
                      variant="ghost"
                      size={getButtonSize()}
                      disabled
                      className="cursor-default"
                      aria-hidden="true"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                const isActive = pageNumber === currentPage;
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant={getButtonVariant(isActive)}
                    size={getButtonSize()}
                    onClick={() => onPageChange(pageNumber as number)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${pageNumber}`}
                    className={cn(
                      isActive && variant !== "ghost" && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                variant={variant}
                size={getButtonSize()}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={cn(paginationVariants({ variant, size }), className)}
        {...props}
      >
        {renderPagination()}
      </div>
    );
  }
);
Pagination.displayName = "Pagination";

export { Pagination };
