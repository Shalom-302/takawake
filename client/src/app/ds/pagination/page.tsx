import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { CodeBlock } from "@/ds/components/code-block";
import { PaginationExample, PaginationVariants, PaginationSizes, PaginationPageCounts, PaginationSiblingCounts, PaginationCombined, PaginationTypes } from "./pagination-examples";

export default function PaginationPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Pagination</h1>
        <p className="text-muted-foreground mt-2">
          A component for navigating between pages of content, providing a user-friendly way to browse through multi-page data.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Pagination Component</CardTitle>
            <CardDescription>
              The Pagination component provides an intuitive interface for navigating through multi-page content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example of Pagination usage
import { Pagination } from "@/ds/components/pagination";

// In a functional component
const [currentPage, setCurrentPage] = React.useState(5);

<Pagination
  currentPage={currentPage}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base Example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base Example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationExample />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationVariants />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  variant="default"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  variant="outline"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  variant="ghost"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationSizes />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  size="sm"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  size="default"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  size="lg"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* Different Page Counts */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Different Page Counts</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationPageCounts />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  currentPage={3}
  totalPages={5}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  currentPage={10}
  totalPages={20}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  currentPage={10}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* Custom Sibling Count */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Custom Sibling Count</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationSiblingCounts />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  currentPage={10}
  totalPages={20}
  siblingCount={1} // Default
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  currentPage={10}
  totalPages={20}
  siblingCount={2}
  onPageChange={(page) => setCurrentPage(page)}
/>

<Pagination
  currentPage={10}
  totalPages={20}
  siblingCount={0}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* Types */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pagination Types</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationTypes />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`// Default type
<Pagination
  type="default"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

// Simple type (only prev/next buttons)
<Pagination
  type="simple"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

// Compact type (prev/next with page X of Y)
<Pagination
  type="compact"
  currentPage={5}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>

// Rows per page type
<Pagination
  type="rows-per-page"
  currentPage={5}
  totalPages={10}
  totalItems={100}
  itemsPerPage={10}
  itemsPerPageOptions={[5, 10, 20, 50]}
  onPageChange={(page) => setCurrentPage(page)}
  onItemsPerPageChange={(value) => setItemsPerPage(value)}
/>`}
          />
        </div>
      </div>

      {/* Combined Example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Combined Example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <PaginationCombined />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Pagination
  variant="outline"
  size="lg"
  currentPage={8}
  totalPages={15}
  siblingCount={1}
  onPageChange={(page) => setCurrentPage(page)}
/>`}
          />
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
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
                <td className="py-2 px-4 font-mono text-sm">variant</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;default&apos; | &apos;outline&apos; | &apos;ghost&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The visual style of the pagination buttons.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">size</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;sm&apos; | &apos;default&apos; | &apos;lg&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The size of the pagination component.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">currentPage</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">The current active page (required).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">totalPages</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">The total number of pages (required).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">onPageChange</td>
                <td className="py-2 px-4 font-mono text-sm">(page: number) =&gt; void</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Callback function when a page is selected (required).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">siblingCount</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">1</td>
                <td className="py-2 px-4">Number of siblings to show on each side of the current page.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">type</td>
                <td className="py-2 px-4 font-mono text-sm">
                  &apos;default&apos; | &apos;simple&apos; | &apos;compact&apos; | &apos;numbered&apos; | &apos;complete&apos; | &apos;rows-per-page&apos; | &apos;position-indicator&apos; | &apos;jump-to-page&apos;
                </td>
                <td className="py-2 px-4 font-mono text-sm">&apos;default&apos;</td>
                <td className="py-2 px-4">The type of pagination UI to display.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">totalItems</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">The total number of items (required for rows-per-page and position-indicator types).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">itemsPerPage</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">10</td>
                <td className="py-2 px-4">Number of items displayed per page (used with rows-per-page and position-indicator types).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">itemsPerPageOptions</td>
                <td className="py-2 px-4 font-mono text-sm">number[]</td>
                <td className="py-2 px-4 font-mono text-sm">[5, 10, 20, 50]</td>
                <td className="py-2 px-4">Options for items per page dropdown (used with rows-per-page type).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">onItemsPerPageChange</td>
                <td className="py-2 px-4 font-mono text-sm">(value: number) =&gt; void</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Callback function when items per page is changed (used with rows-per-page type).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">className</td>
                <td className="py-2 px-4 font-mono text-sm">string</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Additional CSS classes to apply to the pagination component.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
