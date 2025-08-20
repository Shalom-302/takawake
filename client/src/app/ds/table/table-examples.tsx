"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption,
  TableType
} from "@/ds/components/table";
import { Checkbox } from "@/ds/components/checkbox";
import { Button } from "@/ds/components/button";
import { Pagination } from "@/ds/components/pagination";

// Données d'exemple pour les tables
const invoices = [
  {
    id: "INV001",
    paymentStatus: "Paid",
    totalAmount: "€250.00",
    paymentMethod: "Credit Card",
    date: "2023-01-15",
  },
  {
    id: "INV002",
    paymentStatus: "Pending",
    totalAmount: "€150.00",
    paymentMethod: "PayPal",
    date: "2023-02-20",
  },
  {
    id: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "€350.00",
    paymentMethod: "Bank Transfer",
    date: "2023-03-10",
  },
  {
    id: "INV004",
    paymentStatus: "Paid",
    totalAmount: "€450.00",
    paymentMethod: "Credit Card",
    date: "2023-04-05",
  },
  {
    id: "INV005",
    paymentStatus: "Paid",
    totalAmount: "€550.00",
    paymentMethod: "PayPal",
    date: "2023-05-18",
  },
];

// Exemple de table basique
export function BasicTable() {
  return (
    <Table>
      <TableCaption>Liste des factures récentes</TableCaption>
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
    </Table>
  );
}

// Exemple de table avec différents types
export function TableTypes() {
  const [selectedType, setSelectedType] = useState<TableType>("default");
  
  const types: TableType[] = ["default", "compact", "bordered", "striped", "card", "interactive"];
  
  const renderTable = (type: TableType) => (
    <div className="mb-8" key={type}>
      <h3 className="text-lg font-medium mb-2 capitalize">{type} Table</h3>
      <Table type={type}>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.slice(0, 3).map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => setSelectedType(type)}
            size="sm"
          >
            {type}
          </Button>
        ))}
      </div>
      {renderTable(selectedType)}
    </div>
  );
}

// Exemple de table avec différentes variantes
export function TableVariants() {
  const variants = ["default", "outline", "ghost"] as const;
  
  return (
    <div>
      {variants.map((variant) => (
        <div className="mb-8" key={variant}>
          <h3 className="text-lg font-medium mb-2 capitalize">{variant} Variant</h3>
          <Table variant={variant}>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 3).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.paymentStatus}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

// Exemple de table avec sélection
export function SelectableTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

  return (
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
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id} selected={selectedRows.includes(invoice.id)}>
            <TableCell>
              <Checkbox
                checked={selectedRows.includes(invoice.id)}
                onCheckedChange={() => toggleRow(invoice.id)}
                aria-label={`Select invoice ${invoice.id}`}
              />
            </TableCell>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>
            {selectedRows.length} sur {invoices.length} sélectionnés
          </TableCell>
          <TableCell className="text-right">
            {selectedRows.length > 0 && (
              <Button variant="outline" size="sm">
                Actions
              </Button>
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

// Exemple de table avec pagination
export function PaginatedTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  
  const totalItems = invoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
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
    </div>
  );
}

// Exemple de table avec états (loading, empty)
export function TableStates() {
  const [state, setState] = useState<'normal' | 'loading' | 'empty'>('normal');
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={state === 'normal' ? "default" : "outline"}
          onClick={() => setState('normal')}
          size="sm"
        >
          Normal
        </Button>
        <Button
          variant={state === 'loading' ? "default" : "outline"}
          onClick={() => setState('loading')}
          size="sm"
        >
          Loading
        </Button>
        <Button
          variant={state === 'empty' ? "default" : "outline"}
          onClick={() => setState('empty')}
          size="sm"
        >
          Empty
        </Button>
      </div>
      
      <Table
        loading={state === 'loading'}
        empty={state === 'empty'}
        emptyText="Aucune facture disponible"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state === 'normal' && invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Exemple de table avec tri des colonnes
export function SortableTable() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    
    return (
      <span className="ml-2">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead 
            onClick={() => handleSort('id')}
            sortable
          >
            Invoice <SortIcon column="id" />
          </TableHead>
          <TableHead 
            onClick={() => handleSort('paymentStatus')}
            sortable
          >
            Status <SortIcon column="paymentStatus" />
          </TableHead>
          <TableHead 
            onClick={() => handleSort('paymentMethod')}
            sortable
          >
            Method <SortIcon column="paymentMethod" />
          </TableHead>
          <TableHead 
            className="text-right"
            onClick={() => handleSort('totalAmount')}
            sortable
          >
            Amount <SortIcon column="totalAmount" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Exemple complet de table avec toutes les fonctionnalités
export function CompleteTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleInvoices = paginatedInvoices.map(invoice => invoice.id);
    const allSelected = visibleInvoices.every(id => selectedRows.includes(id));
    
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !visibleInvoices.includes(id)));
    } else {
      setSelectedRows(prev => [
        ...prev,
        ...visibleInvoices.filter(id => !prev.includes(id))
      ]);
    }
  };
  
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const totalItems = sortedInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    
    return (
      <span className="ml-2">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  return (
    <div>
      <Table type="card">
        <TableCaption>Tableau complet avec pagination, tri et sélection</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={paginatedInvoices.length > 0 && paginatedInvoices.every(invoice => selectedRows.includes(invoice.id))}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead 
              onClick={() => handleSort('id')}
              sortable
            >
              Invoice <SortIcon column="id" />
            </TableHead>
            <TableHead 
              onClick={() => handleSort('paymentStatus')}
              sortable
            >
              Status <SortIcon column="paymentStatus" />
            </TableHead>
            <TableHead 
              onClick={() => handleSort('paymentMethod')}
              sortable
            >
              Method <SortIcon column="paymentMethod" />
            </TableHead>
            <TableHead 
              className="text-right"
              onClick={() => handleSort('totalAmount')}
              sortable
            >
              Amount <SortIcon column="totalAmount" />
            </TableHead>
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
                  aria-label={`Select invoice ${invoice.id}`}
                />
              </TableCell>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm">Voir</Button>
                  <Button variant="outline" size="sm">Éditer</Button>
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
      </div>
    </div>
  );
}
