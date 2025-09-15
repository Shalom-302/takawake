//Exemple avec mon composant

"use client";
import React from "react";

import { CodeBlock } from "@/ds/components/code-block";
import { ColumnDef, Table, TableCard, TableRowActionsDropdown } from "@/components/ui/table";

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

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method",
    },
    {
        accessorKey: "date",
        header: "Date",
    },
];

export default function TablePage() {
    return (
        <>
            <TableCard
                title="Utilisateurs"
                badge="123"
                description="Liste des utilisateurs actifs"
                contentTrailing={<TableRowActionsDropdown />}
            >
                <Table data={data} columns={columns} />
            </TableCard>
        </>
    );
}
