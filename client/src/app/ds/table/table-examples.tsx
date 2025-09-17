"use client";

import React, { useState } from "react";
import { Edit01, Trash01 } from "@untitled-ui/icons-react";
import {
    createColumnHelper,
    Table,
    TableCard,
    TableRowActionsDropdown,
    type ColumnDef,
} from "@/components/ui/table";
import { Badge, type BadgeVariants } from "@/components/ui/badges";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/buttons";
// Import des types manquants pour les états
import type {
    SortingState,
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
} from "@tanstack/react-table";

type Payment = {
    id: string;
    status: "success" | "processing" | "failed";
    amount: string;
    paymentMethod: string;
    date: string;
};

const paymentData: Payment[] = [
    {
        id: "INV001",
        status: "success",
        amount: "€250.00",
        paymentMethod: "Credit Card",
        date: "2023-01-15",
    },
    {
        id: "INV002",
        status: "processing",
        amount: "€150.00",
        paymentMethod: "PayPal",
        date: "2023-02-20",
    },
    {
        id: "INV003",
        status: "failed",
        amount: "€350.00",
        paymentMethod: "Bank Transfer",
        date: "2023-03-10",
    },
];

const columnHelper = createColumnHelper<Payment>();

const paymentColumns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("amount", {
        header: "Amount",
        cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: info => {
            const status = info.getValue();
            return (
                <Badge
                    size="sm"
                    color={
                        status === "success"
                            ? "success"
                            : status === "processing"
                              ? "warning"
                              : "error"
                    }
                    variant="modern"
                >
                    {status === "success"
                        ? "Success"
                        : status === "processing"
                          ? "Processing"
                          : "Failed"}
                </Badge>
            );
        },
    }),
    columnHelper.accessor("paymentMethod", {
        header: "Payment Method",
    }),
    columnHelper.accessor("date", {
        header: "Date",
        cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
];

export const ModernSimpleTable = () => {
    return (
        <TableCard
            title="Payments"
            description="A list of your recent payments"
            contentTrailing={
                <TableRowActionsDropdown
                    onEdit={() => console.log("Edit")}
                    onCopy={() => console.log("Copy")}
                    onDelete={() => console.log("Delete")}
                />
            }
        >
            <Table
                data={paymentData}
                columns={paymentColumns}
                enableRowSelection
                enableMultiRowSelection
                size="md"
            />
        </TableCard>
    );
};

// ---

// === EXEMPLE 2: Table avec Sorting et Filtering ===
type TeamMember = {
    id: string;
    username: string;
    name: string;
    email: string;
    avatarUrl: string;
    status: "active" | "inactive";
    role: string;
    teams: Array<{ name: string; color: BadgeVariants["color"] }>;
};

const teamMembersData: TeamMember[] = [
    {
        id: "1",
        username: "@olivia",
        name: "Olivia Rhye",
        email: "olivia@untitledui.com",
        avatarUrl: "/avatars/avatar-1.png",
        status: "active",
        role: "Product Designer",
        teams: [
            { name: "Design", color: "purple" },
            { name: "Product", color: "blue" },
            { name: "Marketing", color: "pink" },
        ],
    },
    {
        id: "2",
        username: "@phoenix",
        name: "Phoenix Baker",
        email: "phoenix@untitledui.com",
        avatarUrl: "/avatars/avatar-2.png",
        status: "active",
        role: "Engineering Manager",
        teams: [
            { name: "Engineering", color: "success" },
            { name: "Leadership", color: "gray" },
        ],
    },
    {
        id: "3",
        username: "@lana",
        name: "Lana Steiner",
        email: "lana@untitledui.com",
        avatarUrl: "/avatars/avatar-3.png",
        status: "inactive",
        role: "Frontend Developer",
        teams: [{ name: "Engineering", color: "success" }],
    },
];

const teamColumnHelper = createColumnHelper<TeamMember>();

const teamColumns = [
    teamColumnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatarUrl} alt={row.original.name} size="md" />
                    <div className="whitespace-nowrap">
                        <p className="text-sm font-medium text-primary">{row.original.name}</p>
                        <p className="text-sm text-tertiary">{row.original.username}</p>
                    </div>
                </div>
            );
        },
        meta: {
            headClassName: "w-full max-w-1/4",
        },
    }),
    teamColumnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue();
            return (
                <Badge size="sm" color={status === "active" ? "success" : "gray"} variant="modern">
                    {status === "active" ? "Active" : "Inactive"}
                </Badge>
            );
        },
        filterFn: "includesString",
    }),
    teamColumnHelper.accessor("role", {
        header: "Role",
        cell: info => <span className="whitespace-nowrap">{info.getValue()}</span>,
        meta: {
            tooltip: "This is a tooltip",
        },
    }),
    teamColumnHelper.accessor("email", {
        header: "Email address",
        cell: info => <span className="whitespace-nowrap">{info.getValue()}</span>,
        meta: {
            headClassName: "md:hidden xl:table-cell",
        },
    }),
    teamColumnHelper.accessor("teams", {
        header: "Teams",
        cell: ({ getValue }) => {
            const teams = getValue();
            return (
                <div className="flex gap-1">
                    {teams.slice(0, 2).map(team => (
                        <Badge key={team.name} color={team.color!} size="sm">
                            {team.name}
                        </Badge>
                    ))}
                    {teams.length > 2 && (
                        <Badge color="gray" size="sm">
                            +{teams.length - 2}
                        </Badge>
                    )}
                </div>
            );
        },
        enableSorting: false,
    }),
    teamColumnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <div className="flex justify-end gap-0.5 px-4">
                <Button
                    size="sm"
                    variant="tertiary"
                    leftIcon={<Trash01 />}
                    onClick={() => console.log("Delete", row.original.id)}
                />
                <Button
                    size="sm"
                    variant="tertiary"
                    leftIcon={<Edit01 />}
                    onClick={() => console.log("Edit", row.original.id)}
                />
            </div>
        ),
        enableSorting: false,
    }),
];

export const ModernTeamMembersTable = () => {
    // Correction du typage des états
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    return (
        <TableCard
            title="Team members"
            badge={`${teamMembersData.length} users`}
            contentTrailing={
                <div className="absolute top-5 right-4 md:right-6">
                    <TableRowActionsDropdown />
                </div>
            }
        >
            <Table
                data={teamMembersData}
                columns={teamColumns}
                enableRowSelection
                enableMultiRowSelection
                enableSorting
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                sorting={sorting}
                onSortingChange={setSorting}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                size="md"
            />
        </TableCard>
    );
};

// ---

// === EXEMPLE 3: Table avec Pagination ===
export const ModernPaginatedTable = () => {
    // Correction du typage des états
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    return (
        <TableCard
            title="Paginated Team members"
            badge={`Page ${pagination.pageIndex + 1} of ${Math.ceil(teamMembersData.length / pagination.pageSize)}`}
            contentTrailing={
                <div className="absolute top-5 right-4 md:right-6">
                    <TableRowActionsDropdown />
                </div>
            }
        >
            <Table
                data={teamMembersData}
                columns={teamColumns}
                enableRowSelection
                enableMultiRowSelection
                enableSorting
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                sorting={sorting}
                onSortingChange={setSorting}
                pagination={pagination}
                onPaginationChange={setPagination}
                size="md"
            />

            {/* Footer de pagination */}
            <div className="flex items-center justify-between border-t border-secondary px-6 pt-3 pb-4">
                <span className="text-sm text-tertiary">
                    Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                    {Math.min(
                        (pagination.pageIndex + 1) * pagination.pageSize,
                        teamMembersData.length
                    )}{" "}
                    of {teamMembersData.length} results
                </span>
                <div className="flex gap-3">
                    <Button
                        color="secondary"
                        onClick={() =>
                            setPagination(prev => ({
                                ...prev,
                                pageIndex: Math.max(0, prev.pageIndex - 1),
                            }))
                        }
                        disabled={pagination.pageIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() =>
                            setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                        }
                        disabled={
                            pagination.pageIndex >=
                            Math.ceil(teamMembersData.length / pagination.pageSize) - 1
                        }
                    >
                        Next
                    </Button>
                </div>
            </div>
        </TableCard>
    );
};

// ---

// === EXEMPLE 4: Table avec Lignes Alternées ===
export const ModernAlternatingTable = () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    return (
        <TableCard
            title="Team members"
            badge="100 users"
            contentTrailing={
                <div className="absolute top-5 right-4 md:right-6">
                    <TableRowActionsDropdown />
                </div>
            }
        >
            <Table
                data={teamMembersData}
                columns={teamColumns}
                enableRowSelection
                enableMultiRowSelection
                enableSorting
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                size="md"
                alternatingRows={true}
            />
        </TableCard>
    );
};

// ---

// === EXEMPLE 6: Table avec définition traditionnelle de colonnes ===
export const TraditionalColumnDefTable = () => {
    const traditionalColumns: ColumnDef<Payment>[] = [
        {
            accessorKey: "id",
            header: "Invoice ID",
            cell: ({ getValue }) => <span className="font-mono">{getValue() as string}</span>,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ getValue }) => {
                const amount = getValue() as string;
                return <span className="font-semibold text-green-600">{amount}</span>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const colors = {
                    success: "success",
                    processing: "warning",
                    failed: "error",
                } as const;

                return (
                    <Badge size="sm" color={colors[status as keyof typeof colors]} variant="modern">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
            filterFn: "equals",
        },
        {
            accessorFn: row => `${row.paymentMethod} - ${row.date}`,
            id: "methodAndDate",
            header: "Method & Date",
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium">{row.original.paymentMethod}</div>
                    <div className="text-tertiary">{row.original.date}</div>
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <TableRowActionsDropdown
                    onEdit={() => console.log("Edit payment", row.original.id)}
                    onCopy={() => console.log("Copy payment", row.original.id)}
                    onDelete={() => console.log("Delete payment", row.original.id)}
                />
            ),
            enableSorting: false,
        },
    ];

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    // Correction du typage de l'état de tri
    const [sorting, setSorting] = useState<SortingState>([]);

    return (
        <TableCard
            title="Invoice Payments"
            badge={`${Object.keys(rowSelection).length} selected`}
            description="Traditional column definition approach"
        >
            <Table
                data={paymentData}
                columns={traditionalColumns}
                enableRowSelection
                enableMultiRowSelection
                enableSorting
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                sorting={sorting}
                onSortingChange={setSorting}
                size="md"
            />
        </TableCard>
    );
};

// ---

// === EXEMPLE 7: Table avec état complet contrôlé ===
export const FullyControlledTable = () => {
    // Tous les états contrôlés depuis l'extérieur
    // Correction du typage des états
    const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({ "1": true });
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Statistiques dérivées
    const selectedCount = Object.keys(rowSelection).length;
    const totalPages = Math.ceil(teamMembersData.length / pagination.pageSize);

    return (
        <div className="space-y-4">
            {/* Contrôles externes */}
            <div className="flex gap-4 p-4 bg-secondary rounded-lg">
                <Button size="sm" onClick={() => setSorting([{ id: "name", desc: false }])}>
                    Sort by Name Asc
                </Button>
                <Button size="sm" onClick={() => setSorting([{ id: "status", desc: true }])}>
                    Sort by Status Desc
                </Button>
                <Button size="sm" onClick={() => setRowSelection({})}>
                    Clear Selection
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        const allSelected: RowSelectionState = {};
                        teamMembersData.forEach(member => {
                            allSelected[member.id] = true;
                        });
                        setRowSelection(allSelected);
                    }}
                >
                    Select All
                </Button>
            </div>

            <TableCard
                title="Fully Controlled Table"
                badge={`${selectedCount} selected • Page ${pagination.pageIndex + 1}/${totalPages}`}
                description="All state is controlled from outside the component"
            >
                <Table
                    data={teamMembersData}
                    columns={teamColumns}
                    // Sélection contrôlée
                    enableRowSelection
                    enableMultiRowSelection
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    // Tri contrôlé
                    enableSorting
                    sorting={sorting}
                    onSortingChange={setSorting}
                    // Filtres contrôlés
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    // Pagination contrôlée
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    size="md"
                    alternatingRows={false}
                />

                {/* Pagination footer personnalisée */}
                <div className="flex items-center justify-between border-t border-secondary px-6 pt-3 pb-4">
                    <div className="text-sm text-tertiary">
                        Selected: {selectedCount} • Total: {teamMembersData.length}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            color="secondary"
                            onClick={() =>
                                setPagination(prev => ({
                                    ...prev,
                                    pageIndex: Math.max(0, prev.pageIndex - 1),
                                }))
                            }
                            disabled={pagination.pageIndex === 0}
                        >
                            ← Prev
                        </Button>

                        <span className="flex items-center px-3 text-sm">
                            {pagination.pageIndex + 1} / {totalPages}
                        </span>

                        <Button
                            size="sm"
                            color="secondary"
                            onClick={() =>
                                setPagination(prev => ({
                                    ...prev,
                                    pageIndex: prev.pageIndex + 1,
                                }))
                            }
                            disabled={pagination.pageIndex >= totalPages - 1}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            </TableCard>
        </div>
    );
};
