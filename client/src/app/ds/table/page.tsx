//Exemple avec mon composant

"use client";
import React from "react";

import { CodeBlock } from "@/ds/components/code-block";
import {
    createColumnHelper,
    Table,
    TableCard,
    TableRowActionsDropdown,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badges";
import {
    FullyControlledTable,
    ModernAlternatingTable,
    ModernPaginatedTable,
    ModernSimpleTable,
    ModernTeamMembersTable,
} from "./table-examples";

const data = [
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
    {
        id: "INV004",
        status: "success",
        amount: "€450.00",
        paymentMethod: "Credit Card",
        date: "2023-04-05",
    },
    {
        id: "INV005",
        status: "success",
        amount: "€550.00",
        paymentMethod: "PayPal",
        date: "2023-05-18",
    },
];

type Payment = {
    id: string;
    amount: string;
    status: "pending" | "processing" | "success" | "failed";
    paymentMethod: string;
    date: string;
};

const columnHelper = createColumnHelper<Payment>();

const paymentColumns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: row => row.getValue(),
    }),
    columnHelper.accessor("amount", {
        header: "Amount",
        cell: row => <span className="font-medium">{row.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: row => {
            const status = row.getValue();
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
        cell: row => new Date(row.getValue()).toLocaleDateString(),
    }),
];

export default function TablePage() {
    return (
        <div className="space-y-16">
            {/* <TableCard
                title="Utilisateurs"
                badge="123"
                description="Liste des utilisateurs actifs"
                contentTrailing={<TableRowActionsDropdown />}
            >
                <Table
                    data={data}
                    columns={paymentColumns}
                    enableRowSelection
                    enableMultiRowSelection
                />
            </TableCard> */}
            <ModernSimpleTable />
            <ModernTeamMembersTable />
            <ModernPaginatedTable />
            <ModernAlternatingTable />
            <FullyControlledTable />
        </div>
    );
}
