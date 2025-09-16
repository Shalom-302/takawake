"use client";

import type { ComponentProps, ReactNode } from "react";
import { createContext, isValidElement, useContext, useState, useMemo } from "react";
import {
    ArrowDown,
    ChevronSelectorVertical,
    Copy01,
    Edit01,
    HelpCircle,
    Trash01,
} from "@untitled-ui/icons-react";
import type {
    Column,
    ColumnDef,
    SortingState,
    RowSelectionState,
    Table as TableInstance,
    ColumnFiltersState,
    PaginationState,
    ExpandedState,
    OnChangeFn,
} from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badges";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "../checkbox";
import { DropdownDotsButton, DropdownMenu } from "../dropdown-menu";
import { Tooltip } from "../tootilp";

// Export des types et helpers
export type { ColumnDef } from "@tanstack/react-table";
export { createColumnHelper } from "@tanstack/react-table";

export const TableRowActionsDropdown = ({
    onEdit,
    onCopy,
    onDelete,
}: {
    onEdit?: () => void;
    onCopy?: () => void;
    onDelete?: () => void;
} = {}) => (
    <DropdownMenu
        trigger={<DropdownDotsButton />}
        align="end"
        contentClassName="w-min"
        items={[
            {
                id: "edit",
                label: (
                    <div className="flex items-center gap-4">
                        <Edit01 />
                        <span>Edit</span>
                    </div>
                ),
                onClick: onEdit,
            },
            {
                id: "copy",
                label: (
                    <div className="flex items-center gap-4">
                        <Copy01 />
                        <span>Copy link</span>
                    </div>
                ),
                onClick: onCopy,
            },
            {
                id: "delete",
                label: (
                    <div className="flex items-center gap-4">
                        <Trash01 />
                        <span>Delete</span>
                    </div>
                ),
                variant: "destructive",
                onClick: onDelete,
            },
        ]}
    />
);

interface TableContextType<TData> {
    size: "sm" | "md";
    table?: TableInstance<TData>;
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
}

const TableContext = createContext<unknown>(undefined);

export function useTableContext<TData>() {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error("useTableContext doit être utilisé à l'intérieur d'un TableProvider.");
    }
    return context as TableContextType<TData>;
}

export const TableCard = ({
    children,
    className,
    size = "md",
    title,
    badge,
    description,
    contentTrailing,
    ...props
}: ComponentProps<"div"> & {
    size?: "sm" | "md";
    title: string;
    badge?: ReactNode;
    description?: string;
    contentTrailing?: ReactNode;
}) => {
    return (
        <div
            {...props}
            className={cn(
                "overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary",
                className
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "relative flex flex-col items-start gap-4 border-b border-secondary bg-primary px-4 md:flex-row",
                    size === "sm" ? "py-4 md:px-5" : "py-5 md:px-6"
                )}
            >
                <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h2
                            className={cn(
                                "font-semibold text-primary",
                                size === "sm" ? "text-md" : "text-lg"
                            )}
                        >
                            {title}
                        </h2>
                        {badge &&
                            (isValidElement(badge) ? (
                                badge
                            ) : (
                                <Badge color="brand" size="sm">
                                    {badge}
                                </Badge>
                            ))}
                    </div>
                    {description && <p className="text-sm text-tertiary">{description}</p>}
                </div>
                {contentTrailing}
            </div>

            {children}
        </div>
    );
};

interface TableProps<TData, TValue> extends ComponentProps<"table"> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    size?: "sm" | "md";

    // État de tri
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    enableSorting?: boolean;

    // Sélection de lignes
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;

    // Filtrage
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

    // Pagination
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    pageCount?: number;

    // Expansion
    expanded?: ExpandedState;
    onExpandedChange?: OnChangeFn<ExpandedState>;
    getSubRows?: (originalRow: TData, index: number) => TData[] | undefined;

    // Styles et options
    bordered?: boolean;
    alternatingRows?: boolean;
    emptyMessage?: string;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
}

export function Table<TData, TValue>({
    data,
    columns,
    size = "md",
    className,

    // Tri
    sorting: controlledSorting,
    onSortingChange,
    enableSorting = true,
    manualSorting = false,

    // Sélection
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    enableRowSelection = false,
    enableMultiRowSelection = true,

    // Filtres
    columnFilters: controlledColumnFilters,
    onColumnFiltersChange,
    manualFiltering = false,

    // Pagination
    pagination: controlledPagination,
    onPaginationChange,
    pageCount = -1,
    manualPagination = false,

    // Expansion
    expanded: controlledExpanded,
    onExpandedChange,
    getSubRows,

    // Options de style
    bordered = true,
    alternatingRows = false,
    emptyMessage = "No results.",

    ...props
}: TableProps<TData, TValue>) {
    // États internes (utilisés si pas de contrôle externe)
    const [internalSorting, setInternalSorting] = useState<SortingState>([]);
    const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
    const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
    const [internalPagination, setInternalPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});

    // Déterminer quels états utiliser
    const sorting = controlledSorting ?? internalSorting;
    const setSorting = onSortingChange ?? setInternalSorting;

    const rowSelection = controlledRowSelection ?? internalRowSelection;
    const setRowSelection = onRowSelectionChange ?? setInternalRowSelection;

    const columnFilters = controlledColumnFilters ?? internalColumnFilters;
    const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;

    const pagination = controlledPagination ?? internalPagination;
    const setPagination = onPaginationChange ?? setInternalPagination;

    const expanded = controlledExpanded ?? internalExpanded;
    const setExpanded = onExpandedChange ?? setInternalExpanded;

    // Mémorisation des colonnes pour éviter les re-renders
    const memoizedColumns = useMemo(() => columns, [columns]);
    const memoizedData = useMemo(() => data, [data]);

    const table = useReactTable({
        data: memoizedData,
        columns: memoizedColumns,
        getCoreRowModel: getCoreRowModel(),

        // Tri
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        onSortingChange: setSorting,
        manualSorting,
        enableSorting,

        // Sélection
        enableRowSelection,
        enableMultiRowSelection,
        onRowSelectionChange: setRowSelection,

        // Filtrage
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        manualFiltering,

        // Pagination
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        manualPagination,
        pageCount,

        // Expansion
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: setExpanded,
        getSubRows,

        // État
        state: {
            sorting,
            rowSelection,
            columnFilters,
            pagination,
            expanded,
        },
    });

    const contextValue = {
        size,
        table,
        enableRowSelection,
        enableMultiRowSelection,
    };

    return (
        <TableContext.Provider value={contextValue}>
            <div className="overflow-x-auto">
                <table className={cn("w-full overflow-x-hidden", className)} {...props}>
                    {/* Header */}
                    <TableHeader
                        bordered={bordered}
                        className={alternatingRows ? "bg-primary" : undefined}
                    >
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {/* Checkbox de sélection globale */}
                                {enableRowSelection && (
                                    <TableHead
                                        className={cn(
                                            "relative py-2 pr-0 pl-4",
                                            size === "sm" ? "w-9 md:pl-5" : "w-11 md:pl-6"
                                        )}
                                    >
                                        {enableMultiRowSelection && (
                                            <div className="flex items-start">
                                                <Checkbox
                                                    checked={
                                                        table.getIsAllPageRowsSelected() ||
                                                        (table.getIsSomePageRowsSelected() &&
                                                            "indeterminate")
                                                    }
                                                    onCheckedChange={value =>
                                                        table.toggleAllPageRowsSelected(!!value)
                                                    }
                                                    aria-label="Select all"
                                                />
                                            </div>
                                        )}
                                    </TableHead>
                                )}

                                {/* Headers des colonnes */}
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        column={header.column}
                                        sortable={header.column.getCanSort()}
                                        className={header.column.columnDef.meta?.className}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </tr>
                        ))}
                    </TableHeader>

                    <TableBody emptyMessage={emptyMessage}>
                        {table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                className={cn(
                                    alternatingRows && "odd:bg-secondary_subtle",
                                    row.getIsSelected() && "bg-secondary"
                                )}
                            >
                                {enableRowSelection && (
                                    <TableCell
                                        className={cn(
                                            "relative py-2 pr-0 pl-4",
                                            size === "sm" ? "md:pl-5" : "md:pl-6"
                                        )}
                                    >
                                        <div className="flex items-end">
                                            <Checkbox
                                                checked={row.getIsSelected()}
                                                disabled={!row.getCanSelect()}
                                                onCheckedChange={value =>
                                                    row.toggleSelected(!!value)
                                                }
                                                aria-label="Select row"
                                            />
                                        </div>
                                    </TableCell>
                                )}

                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </table>
            </div>
        </TableContext.Provider>
    );
}

// Table Header Component
interface TableHeaderProps extends ComponentProps<"thead"> {
    bordered?: boolean;
}

const TableHeader = ({ bordered = true, className, children, ...props }: TableHeaderProps) => {
    const { size } = useTableContext();

    return (
        <thead
            {...props}
            className={cn(
                "relative bg-secondary",
                size === "sm" ? "h-9" : "h-11",
                bordered &&
                    "[&>tr>th]:after:pointer-events-none [&>tr>th]:after:absolute [&>tr>th]:after:inset-x-0 [&>tr>th]:after:bottom-0 [&>tr>th]:after:h-px [&>tr>th]:after:bg-border-secondary [&>tr>th]:focus-visible:after:bg-transparent",
                className
            )}
        >
            {children}
        </thead>
    );
};

interface TableHeadProps<TData, TValue> extends ComponentProps<"th"> {
    label?: string;
    tooltip?: string;
    column?: Column<TData, TValue>;
    sortable?: boolean;
}

function TableHead<TData, TValue>({
    className,
    tooltip,
    label,
    column,
    sortable = false,
    children,
    ...props
}: TableHeadProps<TData, TValue>) {
    const canSort = column?.getCanSort() ?? sortable;
    const sortDirection = column?.getIsSorted();

    const handleSort = () => {
        if (column && canSort) {
            column.toggleSorting();
        }
    };

    return (
        <th
            {...props}
            className={cn(
                "relative p-0 px-6 py-2 outline-hidden focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-bg-primary focus-visible:ring-inset",
                canSort && "cursor-pointer",
                className
            )}
            onClick={canSort ? handleSort : undefined}
        >
            <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                    {label && (
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            {label}
                        </span>
                    )}
                    {children}
                </div>

                {tooltip && (
                    <Tooltip
                        trigger={
                            <HelpCircle className="size-4 cursor-pointer text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover" />
                        }
                        title={tooltip}
                    />
                )}

                {canSort &&
                    (sortDirection ? (
                        <ArrowDown
                            className={cn(
                                "size-3 stroke-[3px] text-fg-quaternary",
                                sortDirection === "asc" && "rotate-180"
                            )}
                        />
                    ) : (
                        <ChevronSelectorVertical
                            strokeWidth={3}
                            className="size-3 text-fg-quaternary"
                        />
                    ))}
            </div>
        </th>
    );
}

// Table Row Component

const TableRow = ({ className, children, ...props }: ComponentProps<"tr">) => {
    const { size } = useTableContext();

    return (
        <tr
            {...props}
            className={cn(
                "relative outline-focus-ring transition-colors after:pointer-events-none hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" ? "h-14" : "h-18",
                "[&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:w-full [&>td]:after:bg-border-secondary last:[&>td]:after:hidden [&>td]:focus-visible:after:opacity-0 focus-visible:[&>td]:after:opacity-0",
                className
            )}
        >
            {children}
        </tr>
    );
};

// Table Cell Component

const TableCell = ({ className, children, ...props }: ComponentProps<"td">) => {
    const { size } = useTableContext();

    return (
        <td
            {...props}
            className={cn(
                "relative text-sm text-tertiary outline-focus-ring focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" && "px-5 py-3",
                size === "md" && "px-6 py-4",
                className
            )}
        >
            {children}
        </td>
    );
};

// Table Body Component
interface TableBodyProps extends ComponentProps<"tbody"> {
    emptyMessage?: string;
}

const TableBody = ({
    className,
    emptyMessage = "No results.",
    children,
    ...props
}: TableBodyProps) => {
    const { table } = useTableContext();
    const hasData = table?.getRowModel() && table?.getRowModel()?.rows?.length > 0;

    return (
        <tbody className={className} {...props}>
            {hasData ? (
                children
            ) : (
                <tr>
                    <td
                        className="h-24 text-center text-tertiary"
                        colSpan={table?.getAllColumns().length || 1}
                    >
                        {emptyMessage}
                    </td>
                </tr>
            )}
        </tbody>
    );
};

// Exports
export { TableHeader, TableHead, TableRow, TableCell, TableBody };
