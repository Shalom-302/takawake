"use client";

import React, { useState } from "react";
import { Pagination, PaginationType } from "@/ds/components/pagination";

type PaginationVariant = "default" | "outline" | "ghost";
type PaginationSize = "default" | "sm" | "lg";

interface PaginationExampleProps {
  initialPage?: number;
  totalPages?: number;
  variant?: PaginationVariant;
  size?: PaginationSize;
  siblingCount?: number;
}

export function PaginationExample({ 
  initialPage = 5, 
  totalPages = 10, 
  variant = "default", 
  size = "default",
  siblingCount = 1 
}: PaginationExampleProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      variant={variant}
      size={size}
      siblingCount={siblingCount}
      onPageChange={(page) => setCurrentPage(page)}
    />
  );
}

export function PaginationVariants() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Default</h3>
        <div className="flex justify-center">
          <PaginationExample variant="default" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Outline</h3>
        <div className="flex justify-center">
          <PaginationExample variant="outline" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Ghost</h3>
        <div className="flex justify-center">
          <PaginationExample variant="ghost" />
        </div>
      </div>
    </div>
  );
}

export function PaginationSizes() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Small</h3>
        <div className="flex justify-center">
          <PaginationExample size="sm" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Default</h3>
        <div className="flex justify-center">
          <PaginationExample size="default" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Large</h3>
        <div className="flex justify-center">
          <PaginationExample size="lg" />
        </div>
      </div>
    </div>
  );
}

export function PaginationPageCounts() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Few Pages (5)</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={3} totalPages={5} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Many Pages (20)</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={10} totalPages={20} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">First Page</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={1} totalPages={10} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Last Page</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={10} totalPages={10} />
        </div>
      </div>
    </div>
  );
}

export function PaginationSiblingCounts() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Default (Sibling Count: 1)</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={10} totalPages={20} siblingCount={1} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Sibling Count: 2</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={10} totalPages={20} siblingCount={2} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Sibling Count: 0</h3>
        <div className="flex justify-center">
          <PaginationExample initialPage={10} totalPages={20} siblingCount={0} />
        </div>
      </div>
    </div>
  );
}

export function PaginationCombined() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Small Outline Pagination</h3>
        <div className="flex justify-center">
          <PaginationExample variant="outline" size="sm" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Large Ghost Pagination</h3>
        <div className="flex justify-center">
          <PaginationExample variant="ghost" size="lg" />
        </div>
      </div>
    </div>
  );
}

interface PaginationTypeExampleProps {
  type: PaginationType;
  initialPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
}

function PaginationTypeExample({ 
  type, 
  initialPage = 5, 
  totalPages = 10,
  totalItems = 100,
  itemsPerPage = 10
}: PaginationTypeExampleProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);
  
  return (
    <Pagination
      type={type}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={currentItemsPerPage}
      itemsPerPageOptions={[5, 10, 20, 50]}
      onPageChange={(page) => setCurrentPage(page)}
      onItemsPerPageChange={(value) => setCurrentItemsPerPage(value)}
    />
  );
}

export function PaginationTypes() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Default Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="default" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Simple Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="simple" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Compact Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="compact" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Numbered Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="numbered" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Complete Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="complete" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Rows Per Page Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="rows-per-page" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Position Indicator Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="position-indicator" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Jump To Page Type</h3>
        <div className="flex justify-center">
          <PaginationTypeExample type="jump-to-page" />
        </div>
      </div>
    </div>
  );
}
