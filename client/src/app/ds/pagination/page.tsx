"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Pagination, PaginationDot, PaginationLine } from "@/components/ui/pagination";

export default function PaginationPage() {
    const [page, setPage] = useState(1);
    const total = 10;

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Pagination</h1>
                <p className="text-secondary mt-2">
                    A flexible pagination component supporting multiple variants: page, card,
                    button-group.
                </p>
            </div>

            {/* Default */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Default</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Pagination page={page} total={total} onPageChange={setPage} />
                    <CodeBlock
                        className="mt-2"
                        code={`<Pagination
  page={page} 
  total={total} 
  onPageChange={setPage} 
/>`}
                    />
                </div>
            </section>

            {/* Minimal */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Minimal</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Pagination
                        variant="minimal"
                        page={page}
                        total={total}
                        onPageChange={setPage}
                    />
                    <CodeBlock
                        className="mt-2"
                        code={`<Pagination 
  variant="minimal" 
  page={page} 
  total={total} 
  onPageChange={setPage} 
/>`}
                    />
                </div>
            </section>

            {/* Card Default */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Card Default</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Pagination variant="card" page={page} total={total} onPageChange={setPage} />
                    <CodeBlock
                        className="mt-2"
                        code={`<Pagination 
  variant="card" 
  page={page} 
  total={total} 
  onPageChange={setPage} 
/>`}
                    />
                </div>
            </section>

            {/* Card Minimal */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Card Minimal</h2>
                <div className="p-4 border border-tertiary space-y-8 rounded-lg">
                    <div>
                        <Pagination
                            variant="card-minimal"
                            align="left"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`
<Pagination 
    variant="card-minimal" 
    align="left" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>

`}
                        />
                    </div>
                    <div>
                        <Pagination
                            variant="card-minimal"
                            align="center"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`

<Pagination 
    variant="card-minimal" 
    align="center" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>

`}
                        />
                    </div>
                    <div>
                        <Pagination
                            variant="card-minimal"
                            align="right"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`

<Pagination 
    variant="card-minimal" 
    align="right" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>
`}
                        />
                    </div>
                </div>
            </section>

            {/* Button Group */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Button Group</h2>
                <div className="p-4 border border-tertiary space-y-8 rounded-lg">
                    <div>
                        <Pagination
                            variant="button-group"
                            align="left"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`
<Pagination 
    variant="button-group" 
    align="left" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>

`}
                        />
                    </div>
                    <div>
                        <Pagination
                            variant="button-group"
                            align="center"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`

<Pagination 
    variant="button-group" 
    align="center" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>

`}
                        />
                    </div>
                    <div>
                        <Pagination
                            variant="button-group"
                            align="right"
                            page={page}
                            total={total}
                            onPageChange={setPage}
                        />
                        <CodeBlock
                            className="mt-2"
                            code={`

<Pagination 
    variant="button-group" 
    align="right" 
    page={page} 
    total={total} 
    onPageChange={setPage} 
/>
`}
                        />
                    </div>
                </div>
            </section>

            {/* Pagination dot */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Pagination dot</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex flex-col gap-8">
                        <PaginationDot
                            total={6}
                            size="md"
                            isBrand
                            page={page}
                            onPageChange={setPage}
                        />
                        <PaginationDot total={6} size="lg" page={page} onPageChange={setPage} />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
<div className="flex flex-col gap-8">
    <PaginationDot total={6} size="md" page={page} onPageChange={setPage} />
    <PaginationDot total={6} size="lg" page={page} onPageChange={setPage} />
</div>`}
                    />
                </div>
            </section>

            {/* Pagination line */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Pagination line</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex flex-col gap-8">
                        <PaginationLine
                            className="w-64"
                            total={6}
                            size="md"
                            page={page}
                            onPageChange={setPage}
                        />
                        <PaginationLine
                            className="w-72"
                            total={6}
                            size="lg"
                            page={page}
                            onPageChange={setPage}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
<div className="flex flex-col gap-8">
    <PaginationLine
        className="w-64"
        total={6}
        size="md"
        page={page}
        onPageChange={setPage}
    />
    <PaginationLine
        className="w-72"
        total={6}
        size="lg"
        page={page}
        onPageChange={setPage}
    />
</div>`}
                    />
                </div>
            </section>

            {/* API Reference */}
            <section className="mb-10 space-y-10">
                <h2 className="text-xl font-semibold ">API Reference</h2>
                <div className="overflow-x-auto">
                    <h2 className="text-lg font-meium mb-4">Common</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">page</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">1</td>
                                <td className="py-2 px-4">Current active page.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">total</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">10</td>
                                <td className="py-2 px-4">Total number of pages.</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">onPageChange</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    (page: number) =&gt; void
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Callback triggered when the page changes.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="overflow-x-auto">
                    <h2 className="text-lg font-meium mb-4">Pagination</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">variant?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`"default" | "minimal" | "card" | "card-minimal" | "button-group" `}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`"default"`}</td>
                                <td className="py-2 px-4">Pagination layout style.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">align?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {` "left" | "center" | "right"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`"left"`}</td>
                                <td className="py-2 px-4">
                                    Alignment (for button-group and card-minimal variants).
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="overflow-x-auto">
                    <h2 className="text-lg font-meium mb-4">Pagination Dot</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">framed?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    Whether the pagination is displayed in a card.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">isBrand?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    Whether the pagination uses brand colors.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional style.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="overflow-x-auto">
                    <h2 className="text-lg font-meium mb-4">Pagination Line</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"md" | "lg"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"md"`}</td>
                                <td className="py-2 px-4">The size of the pagination line.</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">framed?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    Whether the pagination is displayed in a card.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional style.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
