"use client";

import * as React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import { Select, SelectForm, SelectItemData } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { toast } from "sonner";

export default function SelectPage() {
    // =========================
    // FORM SETUP
    // =========================
    const FormSchema = z.object({
        email: z.email({
            message: "Please select an email to display.",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    const emailItems: SelectItemData[] = [
        { id: "m@example.com", label: "m@example.com" },
        { id: "m@google.com", label: "m@google.com" },
        { id: "m@support.com", label: "m@support.com" },
    ];

    // =========================
    // EXAMPLES
    // =========================
    const basicItems: SelectItemData[] = [
        { id: "apple", label: "Apple" },
        { id: "orange", label: "Orange" },
        { id: "banana", label: "Banana" },
    ];

    const scrollableItems: SelectItemData[] = [
        {
            id: "north-america",
            type: "group",
            label: "North America",
            items: [
                { id: "est", label: "Eastern Standard Time (EST)" },
                { id: "cst", label: "Central Standard Time (CST)" },
                { id: "mst", label: "Mountain Standard Time (MST)" },
                { id: "pst", label: "Pacific Standard Time (PST)" },
                { id: "akst", label: "Alaska Standard Time (AKST)" },
                { id: "hst", label: "Hawaii Standard Time (HST)" },
            ],
        },
        {
            id: "europe-africa",
            type: "group",
            label: "Europe & Africa",
            items: [
                { id: "gmt", label: "Greenwich Mean Time (GMT)" },
                { id: "cet", label: "Central European Time (CET)" },
                { id: "eet", label: "Eastern European Time (EET)" },
                { id: "west", label: "Western European Summer Time (WEST)" },
                { id: "cat", label: "Central Africa Time (CAT)" },
                { id: "eat", label: "East Africa Time (EAT)" },
            ],
        },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            {/* HEADER */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Select</h1>
                <p className="text-tertiary mt-2">
                    Select component with groups, scrollable items, and form integration.
                </p>
            </div>

            {/* BASIC SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Basic Select</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select items={basicItems} placeholder="Select a fruit" />
                        <CodeBlock
                            code={`<Select items={[{ id: "apple", label: "Apple" },  { id: "orange", label: "Orange" },
        { id: "banana", label: "Banana" },]} placeholder="Select a fruit" />`}
                        />
                    </div>
                </div>
            </section>

            {/* SCROLLABLE SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Scrollable Select</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Select
                        items={scrollableItems}
                        placeholder="Select a timezone"
                        triggerClassName="w-[280px]"
                    />
                    <CodeBlock
                        code={`<Select items={scrollableItems} placeholder="Select a timezone" triggerClassName="w-[280px]" />`}
                    />
                </div>
            </section>

            {/* FORM SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Select in Form</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                        <SelectForm
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Select a verified email to display"
                            items={emailItems}
                            isRequired
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                <CodeBlock
                    code={`
<SelectForm
    control={form.control}
    name="email"
    label="Email"
    placeholder="Select a verified email to display"
    items={emailItems}
    isRequired
/>`}
                />
            </section>

            {/* API REFERENCE */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto space-y-8">
                    <table className="w-full">
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
                                <td className="py-2 px-4 font-medium">items</td>
                                <td className="py-2 px-4 ">SelectItemData[]</td>
                                <td className="py-2 px-4 ">[]</td>
                                <td className="py-2 px-4 ">
                                    Liste des éléments à afficher dans le select (items, groups,
                                    labels, separators)
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">value?</td>
                                <td className="py-2 px-4 ">string</td>
                                <td className="py-2 px-4 ">—</td>
                                <td className="py-2 px-4 ">Valeur sélectionnée (controlled)</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onValueChange?</td>
                                <td className="py-2 px-4 ">{`(value: string) => void`}</td>
                                <td className="py-2 px-4 ">—</td>
                                <td className="py-2 px-4 ">
                                    Callback appelé lors du changement de valeur
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">placeholder?</td>
                                <td className="py-2 px-4 ">string</td>
                                <td className="py-2 px-4 ">{`"Sélectionnez une option..."`}</td>
                                <td className="py-2 px-4 ">
                                    Texte affiché quand aucune valeur n’est sélectionnée
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">size?</td>
                                <td className="py-2 px-4 ">{`"sm" | "default"`}</td>
                                <td className="py-2 px-4 ">{`"default"`}</td>
                                <td className="py-2 px-4 ">Taille du trigger</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">contentClassName?</td>
                                <td className="py-2 px-4 ">string</td>
                                <td className="py-2 px-4 ">—</td>
                                <td className="py-2 px-4 ">
                                    Classe appliquée au contenu du select
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">itemClassName?</td>
                                <td className="py-2 px-4 ">string</td>
                                <td className="py-2 px-4 ">—</td>
                                <td className="py-2 px-4 ">Classe appliquée aux items</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">disabled?</td>
                                <td className="py-2 px-4 ">boolean</td>
                                <td className="py-2 px-4 ">false</td>
                                <td className="py-2 px-4 ">Désactive le select</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* --- SelectItemData --- */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">SelectItemData</h3>
                        <table className="w-full">
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
                                    <td className="py-2 px-4">
                                        <code>id</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Identifiant unique de l’item</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>label?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>React.ReactNode</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Texte ou élément affiché</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>value?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Valeur du select</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>disabled?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">Désactive l’item</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>type?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`"item" | "separator" | "group" | "label"`}</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`"item"`}</code>
                                    </td>
                                    <td className="py-2 px-4">Type d’élément</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>items?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>SelectItemData[]</code>
                                    </td>
                                    <td className="py-2 px-4">[]</td>
                                    <td className="py-2 px-4">Sous-items pour les groupes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
