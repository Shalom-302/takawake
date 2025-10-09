"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { DatePicker, DatePickerForm } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/buttons";
import { Form } from "@/components/ui/form";
import { CodeBlock } from "@/ds/components/code-block";
import {
    DateRangePicker,
    DateRangePickerForm,
} from "@/components/ui/date-picker/date-range-picker";

export default function DatePickerPage() {
    // =========================
    // Form schema
    // =========================
    const formSchema = z.object({
        startDate: z.date({
            error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
        }),
        eventPeriod: z.object(
            {
                start: z.date({
                    error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
                }),
                end: z.date({
                    error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
                }),
            },
            { message: "Both start and end date are required" }
        ),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: undefined,
            eventPeriod: { start: undefined, end: undefined },
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    // =========================
    // Controlled example
    // =========================
    const [selected, setSelected] = useState<Date>();
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);

    return (
        <div className="container mx-auto py-10 px-4">
            {/* HEADER */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">DatePicker</h1>
                <p className="text-tertiary mt-2">
                    Basic DatePicker component with form integration.
                </p>
            </div>

            {/* =========================
          EXAMPLES
      ========================= */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Single Date Picker</h2>
                <div className="p-4 border border-tertiary w-1/2 rounded-lg space-y-3">
                    <DatePicker value={selected} onChange={setSelected} />
                    <CodeBlock
                        code={`
const [selected, setSelected] = useState<Date>();

<DatePicker value={selected} onChange={setSelected} />
`}
                    />
                </div>
            </section>
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Range Date Picker</h2>
                <div className="p-4 border border-tertiary w-1/2 rounded-lg space-y-3">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <CodeBlock
                        code={`
const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);

<DateRangePicker value={dateRange} onChange={setDateRange} />
`}
                    />
                </div>
            </section>

            {/* =========================
          FORM INTEGRATION
      ========================= */}
            <section className="my-12 w-1/2">
                <h2 className="text-xlfont-semibold mb-4">Form</h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <DatePickerForm
                            control={form.control}
                            name="startDate"
                            label="Start Date"
                            placeholder="Pick a date"
                            labelTooltip="hi"
                            isRequired
                        />
                        <DateRangePickerForm
                            control={form.control}
                            name="eventPeriod"
                            label="Event period"
                            placeholder="Select date range"
                            description="Choose a start and end date"
                            isRequired
                        />

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>

                <CodeBlock
                    className="mt-4"
                    code={`
const formSchema = z.object({
        startDate: z.date({
            error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
        }),
        eventPeriod: z.object(
            {
                start: z.date({
                    error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
                }),
                end: z.date({
                    error: issue => (issue.input === undefined ? "Required" : "Invalid date"),
                }),
            },
            { message: "Both start and end date are required" }
        ),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: undefined,
            eventPeriod: { start: undefined, end: undefined },
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <DatePickerForm
      control={form.control}
      name="startDate"
      label="Start Date"
      placeholder="Pick a date"
      isRequired
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
`}
                />
            </section>

            {/* =========================
    API Reference
========================= */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-10">API Reference</h2>

                {/* DatePicker */}
                <div className="overflow-x-auto mb-10">
                    <h3 className="text-lg font-medium mb-4">DatePicker</h3>
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
                                <td className="py-2 px-4 font-mono text-sm">value?</td>
                                <td className="py-2 px-4 font-mono text-sm">Date | undefined</td>
                                <td className="py-2 px-4 font-mono text-sm">undefined</td>
                                <td className="py-2 px-4">Current selected date.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onChange?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    (date: Date | undefined) ⇒ void
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Callback when date is changed.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">placeholder?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"Select date"`}</td>
                                <td className="py-2 px-4">Placeholder when no date is selected.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Disable the input and button.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DatePickerForm */}
                <div className="overflow-x-auto mb-10">
                    <h3 className="text-lg font-medium mb-4">DatePickerForm</h3>
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
                                <td className="py-2 px-4 font-mono text-sm">name</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Field name (react-hook-form).</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">control</td>
                                <td className="py-2 px-4 font-mono text-sm">Control&lt;T&gt;</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">react-hook-form control object.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Field label.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">description?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Helper text under the field.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">isRequired?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Mark the field as required.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DateRangePicker */}
                <div className="overflow-x-auto mb-10">
                    <h3 className="text-lg font-medium mb-4">DateRangePicker</h3>
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
                                <td className="py-2 px-4 font-mono text-sm">value?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    &#123; start: Date; end: Date &#125; | null
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">null</td>
                                <td className="py-2 px-4">Currently selected range.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onChange?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    (range: &#123; start: Date; end: Date &#125; | null) ⇒ void
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Callback when range is changed.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">placeholder?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"Select date range"`}</td>
                                <td className="py-2 px-4">Placeholder when no range selected.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Disable the input and button.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DateRangePickerForm */}
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-medium mb-4">DateRangePickerForm</h3>
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
                                <td className="py-2 px-4 font-mono text-sm">name</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Field name (react-hook-form).</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">control</td>
                                <td className="py-2 px-4 font-mono text-sm">Control&lt;T&gt;</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">react-hook-form control object.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Field label.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">description?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Helper text under the field.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">isRequired?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Mark the field as required.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
