"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import {
    Plus,
    DownloadCloud01,
    CheckCircle,
    XCircle,
    Clock,
    Trash01,
    Edit01,
} from "@untitled-ui/icons-react";
import type { SortingState, RowSelectionState } from "@tanstack/react-table";
import {
    createColumnHelper,
    Table,
    TableCard,
    TableRowActionsDropdown,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/buttons";
import { Pagination } from "@/components/ui/pagination";
import { ProgressBar } from "@/components/ui/progress-indicators";
import { ButtonUtility } from "@/components/ui/buttons/button-utility";

// Types pour les données d'exemple
type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    role: "Admin" | "Editor" | "Viewer";
    status: "Active" | "Inactive" | "Pending";
    lastSeen: string;
    department: string;
};

type Project = {
    id: string;
    name: string;
    status: "Completed" | "In Progress" | "On Hold" | "Cancelled";
    progress: number;
    budget: number;
    team: { name: string; avatar: string }[];
    dueDate: string;
    priority: "High" | "Medium" | "Low";
};

type Invoice = {
    id: string;
    invoiceNumber: string;
    customer: string;
    amount: number;
    status: "Paid" | "Pending" | "Overdue";
    issueDate: string;
    dueDate: string;
};

// Données d'exemple
const usersData: User[] = [
    {
        id: "1",
        name: "Mark Rhye",
        username: "@mark",
        email: "mark@untitledui.com",
        avatar: "/images/avatar-1.png",
        role: "Admin",
        status: "Active",
        lastSeen: "2 hours ago",
        department: "Design",
    },
    {
        id: "2",
        name: "Phoenix Baker",
        username: "@phoenix",
        email: "phoenix@untitledui.com",
        avatar: "/images/avatar-2.png",
        role: "Editor",
        status: "Active",
        lastSeen: "1 day ago",
        department: "Engineering",
    },
    {
        id: "3",
        name: "Brice Steiner",
        username: "@brice",
        email: "brice@untitledui.com",
        avatar: "/images/avatar-3.png",
        role: "Viewer",
        status: "Pending",
        lastSeen: "3 days ago",
        department: "Marketing",
    },
];

const projectsData: Project[] = [
    {
        id: "1",
        name: "Website Redesign",
        status: "In Progress",
        progress: 75,
        budget: 25000,
        team: [
            { name: "Olivia", avatar: "/images/avatar-1.png" },
            { name: "Phoenix", avatar: "/images/avatar-2.png" },
        ],
        dueDate: "2024-03-15",
        priority: "High",
    },
    {
        id: "2",
        name: "Mobile App",
        status: "Completed",
        progress: 100,
        budget: 45000,
        team: [{ name: "Lana", avatar: "/images/avatar-3.png" }],
        dueDate: "2024-02-28",
        priority: "Medium",
    },
];

const invoicesData: Invoice[] = [
    {
        id: "1",
        invoiceNumber: "INV-001",
        customer: "Acme Corp",
        amount: 2500,
        status: "Paid",
        issueDate: "2024-01-15",
        dueDate: "2024-02-15",
    },
    {
        id: "2",
        invoiceNumber: "INV-002",
        customer: "TechStart Ltd",
        amount: 1800,
        status: "Pending",
        issueDate: "2024-01-20",
        dueDate: "2024-02-20",
    },
    {
        id: "3",
        invoiceNumber: "INV-002",
        customer: "Motion",
        amount: 1200,
        status: "Pending",
        issueDate: "2024-01-20",
        dueDate: "2024-02-20",
    },
];

export default function TableDocs() {
    return (
        <div className="space-y-16">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-4">Table</h1>
                <p className="text-muted-foreground mb-4">
                    A powerful data table component built with TanStack Table v8. Supports sorting,
                    filtering, pagination, row selection, and many customization options.
                </p>
                <Link href="/docs/components" className="text-primary hover:underline">
                    ← Back to components
                </Link>
            </div>

            {/* Examples */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Examples</h2>

                {/* Basic Table */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Basic</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        A simple table with user data, avatars, and basic styling.
                    </p>
                    <div className="mb-4">
                        <BasicTableExample />
                    </div>
                    <CodeBlock
                        code={`const userColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.username}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant="secondary">{getValue() as string}</Badge>
    ),
  },
];

<Table data={usersData} columns={userColumns} size="md" />`}
                    />
                </div>

                {/* With Selection */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With row selection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Enable single or multiple row selection with checkboxes.
                    </p>
                    <div className="mb-4">
                        <SelectionTableExample />
                    </div>
                    <CodeBlock
                        code={`const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

<Table
  data={usersData}
  columns={userColumns}
  enableRowSelection
  enableMultiRowSelection
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
  size="md"
/>`}
                    />
                </div>

                {/* With Sorting */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With sorting</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click on column headers to sort data in ascending or descending order.
                    </p>
                    <div className="mb-4">
                        <SortingTableExample />
                    </div>
                    <CodeBlock
                        code={`const [sorting, setSorting] = useState<SortingState>([]);

<Table
  data={usersData}
  columns={userColumns}
  enableSorting
  sorting={sorting}
  onSortingChange={setSorting}
  size="md"
/>`}
                    />
                </div>

                {/* Complex Table */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Complex data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Table with complex data types including progress bars, team avatars, and
                        custom badges.
                    </p>
                    <div className="mb-4">
                        <ComplexTableExample />
                    </div>
                    <CodeBlock
                        code={`const projectColumns = [
  projectColumnHelper.accessor("name", {
    header: "Project",
    cell: ({ getValue }) => (
      <div className="font-medium">{getValue()}</div>
    ),
  }),
  projectColumnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const config = {
        "Completed": { color: "success", icon: CheckCircle },
        "In Progress": { color: "warning", icon: Clock },
        "On Hold": { color: "gray", icon: XCircle },
        "Cancelled": { color: "error", icon: XCircle }
      };
      const { color, icon: Icon } = config[status];
      
      return (
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <Badge color={color}>{status}</Badge>
        </div>
      );
    },
  }),
  projectColumnHelper.accessor("progress", {
    header: "Progress",
    cell: ({ getValue }) => {
      const progress = getValue();
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all" 
              style={{ width: \`\${progress}%\` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      );
    },
  }),
];`}
                    />
                </div>

                {/* Table with Card */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Table card</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Wrap your table in a card with header, badge, and action buttons.
                    </p>
                    <div className="mb-4">
                        <TableCardExample />
                    </div>
                    <CodeBlock
                        code={`<TableCard
  title="Team members"
  badge="24 users"
  description="Manage your team members and their access levels"
  contentTrailing={
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" leftIcon={<DownloadCloud01 />}>
        Download
      </Button>
      <Button size="sm" leftIcon={<Plus />}>
        Add member
      </Button>
    </div>
  }
>
  <Table
    data={usersData}
    columns={userColumns}
    enableRowSelection
    enableSorting
    size="md"
  />
</TableCard>`}
                    />
                </div>

                {/* Alternating Rows */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Alternating rows</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Add zebra striping to table rows for better readability.
                    </p>
                    <div className="mb-4">
                        <AlternatingTableExample />
                    </div>
                    <CodeBlock
                        code={`<Table
  data={usersData}
  columns={userColumns}
  alternatingRows={true}
  size="md"
/>`}
                    />
                </div>

                {/* With Pagination */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With pagination</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Add pagination controls for large datasets.
                    </p>
                    <div className="mb-4">
                        <PaginatedTableExample />
                    </div>
                    <CodeBlock
                        code={`const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 2,
});

<TableCard title="Invoices" badge="247 invoices">
  <Table
    data={invoicesData}
    columns={invoiceColumns}
    pagination={pagination}
    onPaginationChange={setPagination}
    size="md"
  />
  
  {/* Custom pagination footer */}
    
    <Pagination
      page={pagination.pageIndex + 1}
      total={Math.ceil(invoicesData.length / pagination.pageSize)}
      onPageChange={(page) => setPagination(prev => ({ 
        ...prev, 
        pageIndex: page - 1 
      }))}
    />

</TableCard>`}
                    />
                </div>

                {/* Empty State */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Empty state</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Custom empty state when no data is available.
                    </p>
                    <div className="mb-4">
                        <EmptyStateTableExample />
                    </div>
                    <CodeBlock
                        code={`<Table
  data={[]}
  columns={userColumns}
  emptyMessage={
    <div className="text-center py-12">
      <div className="mx-auto size-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="size-6 text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">No team members</h3>
      <p className="text-sm text-gray-500 mb-4">
        Get started by adding your first team member.
      </p>
      <Button size="sm" leftIcon={<Plus />}>
        Add team member
      </Button>
    </div>
  }
  size="md"
/>`}
                    />
                </div>

                {/* Sizes */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Sizes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Two size variants: sm and md (default).
                    </p>
                    <div className="space-y-6 mb-4">
                        <div>
                            <h4 className="text-sm font-medium mb-2">Small</h4>
                            <SizeTableExample size="sm" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-2">Medium (default)</h4>
                            <SizeTableExample size="md" />
                        </div>
                    </div>
                    <CodeBlock
                        code={`<Table data={usersData} columns={userColumns} size="sm" />
<Table data={usersData} columns={userColumns} size="md" />`}
                    />
                </div>
            </section>

            {/* API Reference */}
            <section>
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>

                <div className="space-y-8">
                    {/* Table Props */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Table</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-tertiary">
                                        <th className="text-left py-2 px-4">Props</th>
                                        <th className="text-left py-2 px-4">Type</th>
                                        <th className="text-left py-2 px-4">Default</th>
                                        <th className="text-left py-2 px-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">data</td>
                                        <td className="py-2 px-4 text-sm font-mono">TData[]</td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">
                                            Array of data objects to display
                                        </td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">columns</td>
                                        <td className="py-2 px-4 text-sm font-mono">
                                            ColumnDef&lt;TData&gt;[]
                                        </td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">Column definitions</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">size?</td>
                                        <td className="py-2 px-4 text-sm font-mono">
                                            {`"sm" | "md"`}
                                        </td>
                                        <td className="py-2 px-4 text-sm">{`"md"`}</td>
                                        <td className="py-2 px-4 text-sm">Table size variant</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">
                                            enableRowSelection?
                                        </td>
                                        <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                        <td className="py-2 px-4 text-sm">false</td>
                                        <td className="py-2 px-4 text-sm">Enable row selection</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">
                                            enableMultiRowSelection?
                                        </td>
                                        <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                        <td className="py-2 px-4 text-sm">true</td>
                                        <td className="py-2 px-4 text-sm">
                                            Allow multiple row selection
                                        </td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">enableSorting?</td>
                                        <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                        <td className="py-2 px-4 text-sm">true</td>
                                        <td className="py-2 px-4 text-sm">Enable column sorting</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">alternatingRows?</td>
                                        <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                        <td className="py-2 px-4 text-sm">false</td>
                                        <td className="py-2 px-4 text-sm">Add zebra striping</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">bordered?</td>
                                        <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                        <td className="py-2 px-4 text-sm">true</td>
                                        <td className="py-2 px-4 text-sm">
                                            Show borders between rows
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 font-medium">emptyMessage?</td>
                                        <td className="py-2 px-4 text-sm font-mono">ReactNode</td>
                                        <td className="py-2 px-4 text-sm">{`"No results."`}</td>
                                        <td className="py-2 px-4 text-sm">
                                            Message shown when no data
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TableCard Props */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">TableCard</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-tertiary">
                                        <th className="text-left py-2 px-4">Props</th>
                                        <th className="text-left py-2 px-4">Type</th>
                                        <th className="text-left py-2 px-4">Default</th>
                                        <th className="text-left py-2 px-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">title</td>
                                        <td className="py-2 px-4 text-sm font-mono">string</td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">Card header title</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">badge?</td>
                                        <td className="py-2 px-4 text-sm font-mono">ReactNode</td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">Badge next to title</td>
                                    </tr>
                                    <tr className="border-b border-tertiary">
                                        <td className="py-2 px-4 font-medium">description?</td>
                                        <td className="py-2 px-4 text-sm font-mono">string</td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">
                                            Description below title
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 font-medium">contentTrailing?</td>
                                        <td className="py-2 px-4 text-sm font-mono">ReactNode</td>
                                        <td className="py-2 px-4 text-sm">-</td>
                                        <td className="py-2 px-4 text-sm">
                                            Content on the right side
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Example Components
const BasicTableExample = () => {
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-sm text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => <Badge variant="color">{getValue()}</Badge>,
        }),
        userColumnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <Badge
                        color={
                            status === "Active"
                                ? "success"
                                : status === "Pending"
                                  ? "warning"
                                  : "gray"
                        }
                        variant="modern"
                    >
                        {status}
                    </Badge>
                );
            },
        }),
        userColumnHelper.display({
            id: "actions",
            cell: () => (
                <div className="flex items-center gap-3">
                    <ButtonUtility icon={Trash01} tooltip="Delete" />
                    <ButtonUtility icon={Edit01} tooltip="Edit" />
                </div>
            ),
        }),
    ];

    return <Table data={usersData} columns={columns} size="md" />;
};

const SelectionTableExample = () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-sm text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => <Badge variant="color">{getValue()}</Badge>,
        }),
    ];

    return (
        <Table
            data={usersData}
            columns={columns}
            enableRowSelection
            enableMultiRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            size="md"
        />
    );
};

const SortingTableExample = () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-sm text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => <Badge variant="color">{getValue()}</Badge>,
        }),
        userColumnHelper.accessor("lastSeen", {
            header: "Last seen",
        }),
    ];

    return (
        <Table
            data={usersData}
            columns={columns}
            enableSorting
            sorting={sorting}
            onSortingChange={setSorting}
            size="md"
        />
    );
};

const ComplexTableExample = () => {
    const projectColumnHelper = createColumnHelper<Project>();

    const columns = [
        projectColumnHelper.accessor("name", {
            header: "Project",
            cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
        }),
        projectColumnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue();
                const config = {
                    Completed: { color: "success" as const, icon: CheckCircle },
                    "In Progress": { color: "warning" as const, icon: Clock },
                    "On Hold": { color: "gray" as const, icon: XCircle },
                    Cancelled: { color: "error" as const, icon: XCircle },
                };
                const { color, icon: Icon } = config[status];

                return (
                    <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <Badge color={color} variant="modern">
                            {status}
                        </Badge>
                    </div>
                );
            },
        }),
        projectColumnHelper.accessor("progress", {
            header: "Progress",
            cell: ({ getValue }) => {
                const progress = getValue();
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <ProgressBar value={progress} />
                        </div>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                );
            },
        }),
        projectColumnHelper.accessor("team", {
            header: "Team",
            cell: ({ getValue }) => {
                const team = getValue();
                return (
                    <div className="flex -space-x-2">
                        {team.slice(0, 3).map((member, index) => (
                            <Avatar
                                key={index}
                                src={member.avatar}
                                alt={member.name}
                                size="sm"
                                className="ring-2 ring-white"
                            />
                        ))}
                        {team.length > 3 && (
                            <div className="flex items-center justify-center size-8 rounded-full bg-gray-100 ring-2 ring-white text-xs font-medium">
                                +{team.length - 3}
                            </div>
                        )}
                    </div>
                );
            },
        }),
        projectColumnHelper.accessor("budget", {
            header: "Budget",
            cell: ({ getValue }) => {
                const budget = getValue();
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(budget);
            },
        }),
    ];

    return <Table data={projectsData} columns={columns} size="md" />;
};

const TableCardExample = () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-sm text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => <Badge variant="color">{getValue()}</Badge>,
        }),
        userColumnHelper.display({
            id: "actions",
            cell: ({ row }) => (
                <TableRowActionsDropdown
                    onEdit={() => console.log("Edit", row.original.name)}
                    onCopy={() => console.log("Copy", row.original.name)}
                    onDelete={() => console.log("Delete", row.original.name)}
                />
            ),
        }),
    ];

    return (
        <TableCard
            title="Team members"
            badge="24 users"
            description="Manage your team members and their access levels"
            contentTrailing={
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<DownloadCloud01 />}>
                        Download
                    </Button>
                    <Button size="sm" leftIcon={<Plus />}>
                        Add member
                    </Button>
                </div>
            }
        >
            <Table
                data={usersData}
                columns={columns}
                enableRowSelection
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

const AlternatingTableExample = () => {
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.original.avatar} alt={row.original.name} size="md" />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-sm text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => <Badge variant="color">{getValue()}</Badge>,
        }),
        userColumnHelper.accessor("department", {
            header: "Department",
        }),
    ];

    return <Table data={usersData} columns={columns} alternatingRows={true} size="md" />;
};

const PaginatedTableExample = () => {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 2,
    });
    const invoiceColumnHelper = createColumnHelper<Invoice>();

    const columns = [
        invoiceColumnHelper.accessor("invoiceNumber", {
            header: "Invoice",
            cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
        }),
        invoiceColumnHelper.accessor("customer", {
            header: "Customer",
        }),
        invoiceColumnHelper.accessor("amount", {
            header: "Amount",
            cell: ({ getValue }) => {
                const amount = getValue();
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(amount);
            },
        }),
        invoiceColumnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue();
                const config = {
                    Paid: { color: "success" as const },
                    Pending: { color: "warning" as const },
                    Overdue: { color: "error" as const },
                };
                return (
                    <Badge color={config[status].color} variant="modern">
                        {status}
                    </Badge>
                );
            },
        }),
        invoiceColumnHelper.accessor("dueDate", {
            header: "Due date",
            cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
        }),
    ];

    return (
        <TableCard title="Invoices" badge="3 invoices">
            <Table
                data={invoicesData}
                columns={columns}
                pagination={pagination}
                onPaginationChange={setPagination}
                size="md"
            />

            <Pagination
                page={pagination.pageIndex + 1}
                total={Math.ceil(invoicesData.length / pagination.pageSize)}
                onPageChange={page =>
                    setPagination(prev => ({
                        ...prev,
                        pageIndex: page - 1,
                    }))
                }
                className="px-4 mb-3"
            />
        </TableCard>
    );
};

const EmptyStateTableExample = () => {
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
        }),
    ];

    return (
        <Table
            data={[]}
            columns={columns}
            emptyMessage={
                <div className="text-center py-12">
                    <div className="mx-auto size-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="size-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No team members</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Get started by adding your first team member.
                    </p>
                    <Button size="sm" leftIcon={<Plus />}>
                        Add team member
                    </Button>
                </div>
            }
            size="md"
        />
    );
};

const SizeTableExample = ({ size }: { size: "sm" | "md" }) => {
    const userColumnHelper = createColumnHelper<User>();

    const columns = [
        userColumnHelper.accessor("name", {
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar
                        src={row.original.avatar}
                        alt={row.original.name}
                        size={size === "sm" ? "sm" : "md"}
                    />
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">{row.original.username}</p>
                    </div>
                </div>
            ),
        }),
        userColumnHelper.accessor("email", {
            header: "Email",
        }),
        userColumnHelper.accessor("role", {
            header: "Role",
            cell: ({ getValue }) => (
                <Badge variant="color" size={size === "sm" ? "sm" : "sm"}>
                    {getValue()}
                </Badge>
            ),
        }),
    ];

    return <Table data={usersData.slice(0, 2)} columns={columns} size={size} />;
};
