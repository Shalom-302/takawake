import React from "react";
import { Card, CardContent } from "@/ds/components/card";
import { CodeBlock } from "@/ds/components/code-block";
import { ComponentLayout, ComponentSection, ComponentExample } from "@/app/ds/components/component-layout";
import { 
  BasicTable, 
  TableTypes, 
  TableVariants, 
  SelectableTable, 
  PaginatedTable, 
  TableStates, 
  SortableTable, 
  CompleteTable 
} from "./table-examples";

export default function TablePage() {
  return (
    <ComponentLayout
      title="Table"
      description="A flexible table component with support for different types, variants, and features."
    >

      <ComponentSection
        title="Installation"
        description="How to use the Table component in your project."
      >
        <Card>
          <CardContent>
            <CodeBlock
              code={`import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from "@/ds/components/table"`}
            />
          </CardContent>
        </Card>
      </ComponentSection>

      <ComponentSection
        title="Basic Example"
        description="A simple example of a table with header, body, and footer."
      >
        <ComponentExample
          title="Default Table"
          description="A standard table with headers, rows, and a caption."
          code={
            <CodeBlock
              code={`<Table>
  <TableCaption>List of recent invoices</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((invoice) => (
      <TableRow key={invoice.id}>
        <TableCell className="font-medium">{invoice.id}</TableCell>
        <TableCell>{invoice.paymentStatus}</TableCell>
        <TableCell>{invoice.paymentMethod}</TableCell>
        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">€1,750.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
            />
          }
          showCode={true}
        >
          <BasicTable />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="Table Types"
        description="Different visual styles for tables to match various use cases."
      >
        <ComponentExample
          title="Table Types"
          description="Available types: default, compact, bordered, striped, card, interactive"
          code={
            <CodeBlock
              code={`// Types available: "default", "compact", "bordered", "striped", "card", "interactive"
<Table type="default">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

<Table type="compact">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

<Table type="bordered">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>`}
            />
          }
          showCode={true}
        >
          <TableTypes />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="Table Variants"
        description="Visual variants that can be applied to any table type."
      >
        <ComponentExample
          title="Table Variants"
          description="Available variants: outline, ghost, elevated"
          code={
            <CodeBlock
              code={`// Available variants: "outline", "ghost", "elevated"
<Table variant="outline">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

<Table variant="ghost">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

<Table variant="elevated">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>`}
            />
          }
          showCode={true}
        >
          <TableVariants />
        </ComponentExample>
      </ComponentSection>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Selectable Table</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <SelectableTable />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`const [selectedRows, setSelectedRows] = useState<string[]>([]);

const toggleRow = (id: string) => {
  setSelectedRows((prev) =>
    prev.includes(id)
      ? prev.filter((rowId) => rowId !== id)
      : [...prev, id]
  );
};

const toggleAll = () => {
  setSelectedRows(
    selectedRows.length === invoices.length
      ? []
      : invoices.map((invoice) => invoice.id)
  );
};

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox
          checked={selectedRows.length === invoices.length}
          onCheckedChange={toggleAll}
          aria-label="Select all"
        />
      </TableHead>
      <TableHead>Invoice</TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((invoice) => (
      <TableRow key={invoice.id} selected={selectedRows.includes(invoice.id)}>
        <TableCell>
          <Checkbox
            checked={selectedRows.includes(invoice.id)}
            onCheckedChange={() => toggleRow(invoice.id)}
            aria-label={\`Select invoice \${invoice.id}\`}
          />
        </TableCell>
        <TableCell>{invoice.id}</TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>`}
          />
        </div>
      </div>

      <ComponentSection
        title="Pagination"
        description="Tables with integrated pagination controls."
      >
        <ComponentExample
          title="Paginated Table"
          description="Table with pagination controls for handling large datasets."
          code={
            <CodeBlock
              code={`const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(2);

const totalItems = invoices.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);

const paginatedInvoices = invoices.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

<div>
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>
      {paginatedInvoices.map((invoice) => (
        <TableRow key={invoice.id}>
          {/* ... */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
  <div className="mt-4 flex justify-center">
    <Pagination
      type="rows-per-page"
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      itemsPerPageOptions={[2, 3, 5]}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  </div>
</div>`}
            />
          }
          showCode={true}
        >
          <PaginatedTable />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="States"
        description="Tables can display different states such as loading, empty, or error."
      >
        <ComponentExample
          title="Table States"
          description="Examples of tables in different states."
          code={
            <CodeBlock
              code={`// Loading state
<Table loading>
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

// Empty state
<Table empty emptyText="No data available">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

// Error state
<Table error errorText="An error occurred while loading data">
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>`}
            />
          }
          showCode={true}
        >
          <TableStates />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="Sortable Table"
        description="Tables with sortable columns for data organization."
      >
        <ComponentExample
          title="Sortable Columns"
          description="Enable sorting functionality on table columns."
          code={
            <CodeBlock
              code={`const [sorting, setSorting] = useState({ column: 'id', direction: 'asc' });

const sortedInvoices = [...invoices].sort((a, b) => {
  const column = sorting.column;
  const direction = sorting.direction === 'asc' ? 1 : -1;
  
  if (a[column] < b[column]) return -1 * direction;
  if (a[column] > b[column]) return 1 * direction;
  return 0;
});

const handleSort = (column) => {
  setSorting((prev) => ({
    column,
    direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
  }));
};

const sortIcon = (column) => {
  if (sorting.column !== column) return null;
  return sorting.direction === 'asc' ? ' ↑' : ' ↓';
};

<Table>
  <TableHeader>
    <TableRow>
      <TableHead sortable onClick={() => handleSort('id')}>
        Invoice {sortIcon('id')}
      </TableHead>
      <TableHead sortable onClick={() => handleSort('status')}>
        Status {sortIcon('status')}
      </TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {sortedInvoices.map((invoice) => (
      <TableRow key={invoice.id}>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>`}
            />
          }
          showCode={true}
        >
          <SortableTable />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="Complete Example"
        description="A comprehensive table example with pagination, sorting, and row selection."
      >
        <ComponentExample
          title="Advanced Table"
          description="Combines multiple features into a single table component."
          code={
            <CodeBlock
              code={`// Complete table with pagination, sorting, and selection
<Table type="card">
  <TableCaption>Complete table with pagination, sorting, and selection</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
      </TableHead>
      <TableHead sortable onClick={() => handleSort('id')}>
        Invoice {sortIcon('id')}
      </TableHead>
      {/* Other headers... */}
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedInvoices.map((invoice) => (
      <TableRow key={invoice.id} selected={selectedRows.includes(invoice.id)}>
        <TableCell>
          <Checkbox
            checked={selectedRows.includes(invoice.id)}
            onCheckedChange={() => toggleRow(invoice.id)}
          />
        </TableCell>
        {/* Other cells... */}
        <TableCell>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm">View</Button>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

<div className="mt-4 flex justify-between items-center">
  <div>
    {selectedRows.length > 0 && (
      <Button variant="outline" size="sm">
        Actions ({selectedRows.length})
      </Button>
    )}
  </div>
  <Pagination
    type="rows-per-page"
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={totalItems}
    itemsPerPage={itemsPerPage}
    itemsPerPageOptions={[3, 5, 10]}
    onPageChange={setCurrentPage}
    onItemsPerPageChange={setItemsPerPage}
  />
</div>`}
            />
          }
          showCode={true}
        >
          <CompleteTable />
        </ComponentExample>
      </ComponentSection>

      <ComponentSection
        title="API Reference"
        description="Properties and options for the Table component."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Prop</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Default</th>
                <th className="py-2 px-4 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">type</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;default&apos; | &apos;compact&apos; | &apos;bordered&apos; | &apos;striped&apos; | &apos;card&apos; | &apos;interactive&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The type of table to display.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">variant</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;default&apos; | &apos;outline&apos; | &apos;ghost&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The visual variant of the table.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">size</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;sm&apos; | &apos;default&apos; | &apos;lg&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The size of the table.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">sortable</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">false</td>
                <td className="py-2 px-4">Whether the table columns are sortable.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">selectable</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">false</td>
                <td className="py-2 px-4">Whether the table rows are selectable.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">loading</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">false</td>
                <td className="py-2 px-4">Whether the table is in loading state.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">empty</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">false</td>
                <td className="py-2 px-4">Whether the table is empty.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">emptyText</td>
                <td className="py-2 px-4 font-mono text-sm">string</td>
                <td className="py-2 px-4 font-mono text-sm">&apos;No data available&apos;</td>
                <td className="py-2 px-4">Text to display when the table is empty.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">className</td>
                <td className="py-2 px-4 font-mono text-sm">string</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Additional CSS classes to apply to the table.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Subcomponents"
        description="Individual components that make up the Table system."
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">TableHeader</h3>
            <p className="text-muted-foreground">
              Contains the table headers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableBody</h3>
            <p className="text-muted-foreground">
              Contains the table data rows.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableFooter</h3>
            <p className="text-muted-foreground">
              Contains the table footer, typically used for totals or actions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableRow</h3>
            <p className="text-muted-foreground">
              Represents a table row. Accepts a &apos;selected&apos; prop to indicate if the row is selected.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableHead</h3>
            <p className="text-muted-foreground">
              Table header cell. Accepts a &apos;sortable&apos; prop to indicate if the column is sortable.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableCell</h3>
            <p className="text-muted-foreground">
              Table data cell.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">TableCaption</h3>
            <p className="text-muted-foreground">
              Optional caption for the table.
            </p>
          </div>
        </div>
      </ComponentSection>
    </ComponentLayout>
  );
}
