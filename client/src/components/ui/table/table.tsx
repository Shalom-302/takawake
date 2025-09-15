"use client";

import type {
    ComponentPropsWithRef,
    HTMLAttributes,
    ReactNode,
    Ref,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from "react";
import { createContext, isValidElement, useContext, useState } from "react";
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
    Table as TableInstance,
} from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badges";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "../checkbox";
import { Tooltip } from "../tootilp";
import { DropdownDotsButton, DropdownMenu } from "../dropdown-menu";

export const TableRowActionsDropdown = () => (
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
            },
            {
                id: "copy",
                label: (
                    <div className="flex items-center gap-4">
                        <Copy01 />
                        <span>Copy link</span>
                    </div>
                ),
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
            },
        ]}
    />
);

export type { ColumnDef } from "@tanstack/react-table";

interface TableContextType {
    size: "sm" | "md";
    data?: unknown[];
    columns?: ColumnDef<unknown, unknown>[];
    table?: TableInstance<unknown> | null;
    selection?: Set<string>;
    onSelectionChange?: (selection: Set<string>) => void;
}

const TableContext = createContext<TableContextType>({ size: "md" });

export const TableCard = ({
    children,
    className,
    size = "md",
    title,
    badge,
    description,
    contentTrailing,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md";
    title: string;
    badge?: ReactNode;
    description?: string;
    contentTrailing?: ReactNode;
    className?: string;
}) => {
    return (
        <div
            {...props}
            className={cn(
                "overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary",
                className
            )}
        >
            <div
                className={cn(
                    "relative flex flex-col items-start gap-4 border-b border-secondary bg-primary px-4 md:flex-row",
                    size === "sm" ? "py-4 md:px-5" : "py-5 md:px-6",
                    className
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
                        {badge ? (
                            isValidElement(badge) ? (
                                badge
                            ) : (
                                <Badge color="brand" size="sm">
                                    {badge}
                                </Badge>
                            )
                        ) : null}
                    </div>
                    {description && <p className="text-sm text-tertiary">{description}</p>}
                </div>
                {contentTrailing}
            </div>
            {children}
        </div>
    );
};

// Table Root Component
interface TableRootProps extends ComponentPropsWithRef<"table"> {
    size?: "sm" | "md";
    data?: unknown[];
    columns?: ColumnDef<unknown, unknown>[];
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    selection?: Set<string>;
    onSelectionChange?: (selection: Set<string>) => void;
    selectionMode?: "none" | "single" | "multiple";
}

const TableRoot = ({
    className,
    size = "md",
    data = [],
    columns = [],
    sorting = [],
    onSortingChange,
    selection = new Set(),
    onSelectionChange,
    // selectionMode = "none",
    children,
    ...props
}: TableRootProps) => {
    const [internalSorting, setInternalSorting] = useState<SortingState>(sorting);
    const [internalSelection, setInternalSelection] = useState<Set<string>>(selection);

    const currentSorting = onSortingChange ? sorting : internalSorting;
    const currentSelection = onSelectionChange ? selection : internalSelection;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: updater => {
            const newSorting = typeof updater === "function" ? updater(currentSorting) : updater;
            if (onSortingChange) {
                onSortingChange(newSorting);
            } else {
                setInternalSorting(newSorting);
            }
        },
        state: {
            sorting: currentSorting,
        },
    });

    const contextValue: TableContextType = {
        size,
        data,
        columns,
        table,
        selection: currentSelection,
        onSelectionChange: onSelectionChange || setInternalSelection,
    };

    return (
        <TableContext.Provider value={contextValue}>
            <div className="overflow-x-auto">
                <table className={cn("w-full overflow-x-hidden", className)} {...props}>
                    {children}
                </table>
            </div>
        </TableContext.Provider>
    );
};

// Table Header Component
interface TableHeaderProps extends ComponentPropsWithRef<"thead"> {
    bordered?: boolean;
    selectionMode?: "none" | "single" | "multiple";
}

const TableHeader = ({
    bordered = true,
    selectionMode = "none",
    className,
    children,
    ...props
}: TableHeaderProps) => {
    const { size, table, selection, onSelectionChange } = useContext(TableContext);

    const handleSelectAll = (checked: boolean) => {
        if (!table || !onSelectionChange) return;

        if (checked) {
            const allIds = new Set(table.getRowModel().rows.map(row => row.id));
            onSelectionChange(allIds);
        } else {
            onSelectionChange(new Set());
        }
    };

    const isAllSelected =
        table?.getRowModel()?.rows.length > 0 &&
        table?.getRowModel()?.rows.every(row => selection?.has(row.id));
    const isIndeterminate = selection?.size > 0 && !isAllSelected;

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
            <tr>
                {selectionMode === "multiple" && (
                    <th
                        className={cn(
                            "relative py-2 pr-0 pl-4",
                            size === "sm" ? "w-9 md:pl-5" : "w-11 md:pl-6"
                        )}
                    >
                        <div className="flex items-start">
                            <Checkbox
                                checked={isIndeterminate ? "indeterminate" : isAllSelected}
                                onCheckedChange={handleSelectAll}
                                // ref={
                                //     isIndeterminate
                                //         ? el => el && (el.indeterminate = true)
                                //         : undefined
                                // }
                            />
                        </div>
                    </th>
                )}
                {children}
            </tr>
        </thead>
    );
};

// Table Head Component
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
    label?: string;
    tooltip?: string;
    column?: Column<unknown, unknown>;
    sortable?: boolean;
}

const TableHead = ({
    className,
    tooltip,
    label,
    column,
    sortable = false,
    children,
    ...props
}: TableHeadProps) => {
    const canSort = column?.getCanSort() ?? sortable;
    const sortDirection = column?.getIsSorted();

    const handleSort = () => {
        if (column && canSort) {
            column.toggleSorting();
        }
    };

    const headContent = (
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
                        className="size-12 text-fg-quaternary"
                    />
                ))}
        </div>
    );

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
            {headContent}
        </th>
    );
};

// Table Row Component
interface TableRowProps<T extends object> extends ComponentPropsWithRef<"tr"> {
    highlightSelectedRow?: boolean;
    selectionMode?: "none" | "single" | "multiple";
    rowId?: string;
    data?: T;
}

const TableRow = <T extends object>({
    highlightSelectedRow = true,
    selectionMode = "none",
    rowId,
    // data,
    className,
    children,
    ...props
}: TableRowProps<T>) => {
    const { size, selection, onSelectionChange } = useContext(TableContext);

    const isSelected = rowId ? selection?.has(rowId) : false;

    const handleSelectionChange = (checked: boolean) => {
        if (!rowId || !onSelectionChange) return;

        const newSelection = new Set(selection);
        if (checked) {
            if (selectionMode === "single") {
                newSelection.clear();
            }
            newSelection.add(rowId);
        } else {
            newSelection.delete(rowId);
        }
        onSelectionChange(newSelection);
    };

    return (
        <tr
            {...props}
            className={cn(
                "relative outline-focus-ring transition-colors after:pointer-events-none hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" ? "h-14" : "h-18",
                highlightSelectedRow && isSelected && "bg-secondary",
                "[&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:w-full [&>td]:after:bg-border-secondary last:[&>td]:after:hidden [&>td]:focus-visible:after:opacity-0 focus-visible:[&>td]:after:opacity-0",
                className
            )}
        >
            {selectionMode !== "none" && (
                <td
                    className={cn("relative py-2 pr-0 pl-4", size === "sm" ? "md:pl-5" : "md:pl-6")}
                >
                    <div className="flex items-end">
                        <Checkbox checked={isSelected} onCheckedChange={handleSelectionChange} />
                    </div>
                </td>
            )}
            {children}
        </tr>
    );
};

// Table Cell Component
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    ref?: Ref<HTMLTableCellElement>;
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
    const { size } = useContext(TableContext);

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
interface TableBodyProps extends ComponentPropsWithRef<"tbody"> {
    emptyMessage?: string;
}

const TableBody = ({
    className,
    emptyMessage = "No results.",
    children,
    ...props
}: TableBodyProps) => {
    const { columns, table } = useContext(TableContext);
    const rows = table?.getRowModel().rows;

    return (
        <tbody className={className} {...props}>
            {rows?.length ? (
                children ||
                rows.map(row => (
                    <TableRow key={row.id} rowId={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <tr>
                    <td className="h-24 text-center" colSpan={columns?.length || 1}>
                        {emptyMessage}
                    </td>
                </tr>
            )}
        </tbody>
    );
};

// Factory Function for Easy Usage
interface TableFactoryProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    size?: "sm" | "md";
    selectionMode?: "none" | "single" | "multiple";
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    selection?: Set<string>;
    onSelectionChange?: (selection: Set<string>) => void;
    emptyMessage?: string;
    className?: string;
}

export function Table<T extends object>({
    data,
    columns,
    size = "md",
    selectionMode = "none",
    sorting,
    onSortingChange,
    selection,
    onSelectionChange,
    emptyMessage,
    className,
}: TableFactoryProps<T>) {
    return (
        <TableRoot
            data={data}
            columns={columns}
            size={size}
            sorting={sorting}
            onSortingChange={onSortingChange}
            selection={selection}
            onSelectionChange={onSelectionChange}
            className={className}
        >
            <TableHeader selectionMode={selectionMode}>
                {columns.map(column => (
                    <TableHead key={column.id}>
                        {typeof column.header === "string"
                            ? column.header
                            : typeof column.header === "function"
                              ? column.header({} as any)
                              : column.header}
                    </TableHead>
                ))}
            </TableHeader>
            <TableBody emptyMessage={emptyMessage} />
        </TableRoot>
    );
}

// const Table = TableRoot as typeof TableRoot & {
//     Body: typeof TableBody;
//     Cell: typeof TableCell;
//     Head: typeof TableHead;
//     Header: typeof TableHeader;
//     Row: typeof TableRow;
//     Card: typeof TableCard;
// };

// Table.Body = TableBody;
// Table.Cell = TableCell;
// Table.Head = TableHead;
// Table.Header = TableHeader;
// Table.Row = TableRow;

// export { Table };
