"use client";

import Pagination from "@/components/starter_ui/pagination";
import BasePagination from "@/components/starter_ui/pagination";
import { useState } from "react";

export default function ViewPagination() {
    const [page, setPage] = useState(1);
    const totalPages = 10;

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Pagination"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        variant="numbers"
                    />
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        variant="minimal"
                    />
                </div>
            </section>
        </>
    );
}
