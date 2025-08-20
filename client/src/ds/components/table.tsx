import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export type TableType = 
  | "default"
  | "compact"
  | "bordered"
  | "striped"
  | "card"
  | "interactive";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  type?: TableType;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  sortable?: boolean;
  selectable?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}

const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      variant: {
        default: "border-collapse",
        outline: "border-collapse border border-border",
        ghost: "border-collapse bg-transparent",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
      },
      type: {
        default: "",
        compact: "",
        bordered: "",
        striped: "",
        card: "rounded-md border border-border shadow-sm",
        interactive: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      type: "default",
    },
  }
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, type, sortable, selectable, loading, empty, emptyText = "No data available", children, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn(tableVariants({ variant, size, type }), className)}
          {...props}
        >
          {loading ? (
            <TableLoading />
          ) : empty ? (
            <TableEmpty emptyText={emptyText} />
          ) : (
            children
          )}
        </table>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-muted",
      selected && "bg-muted/50",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean }
>(({ className, sortable, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      sortable && "cursor-pointer hover:text-foreground",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

const TableLoading = () => (
  <tbody>
    <tr>
      <td colSpan={1000} className="h-24 text-center">
        <div className="flex items-center justify-center">
          <svg
            className="h-6 w-6 animate-spin text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2">Loading...</span>
        </div>
      </td>
    </tr>
  </tbody>
);

const TableEmpty = ({ emptyText }: { emptyText: string }) => (
  <tbody>
    <tr>
      <td colSpan={1000} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg
            className="h-10 w-10 text-muted-foreground/70"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-muted-foreground">{emptyText}</p>
        </div>
      </td>
    </tr>
  </tbody>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
