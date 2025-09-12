"use client";

import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BaseTextAreaVariants, TextArea, TextAreaForm } from "@/components/ui/texarea";

export default function TextAreaPage() {
    const sizes: BaseTextAreaVariants["size"][] = ["sm", "md"];

    const formSchema = z.object({
        description: z.string().min(5, {
            message: "Description must be at least 5 characters.",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        toast("Form submitted", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <div className="container mx-auto py-10 px-4">
            {/* =========================
                HEADER
            ========================= */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">TextArea</h1>
                <p className="text-tertiary mt-2">
                    Multi-line input with autosize, states, tooltip and form integration.
                </p>
            </div>

            {/* =========================
                SIZES
            ========================= */}
            <section className="mb-12" id="sizes">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sizes.map(size => (
                        <div key={size} className="p-4 border border-tertiary rounded-lg">
                            <TextArea
                                size={size}
                                placeholder={`TextArea size ${size}`}
                                className="w-full"
                            />
                            <CodeBlock
                                code={`<TextArea size="${size}" placeholder="TextArea size ${size}" />`}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================
                TOOLTIP
            ========================= */}
            <section className="mb-12" id="tooltip">
                <h2 className="text-xl font-semibold mb-4">Tooltip</h2>
                <div className="p-4 border border-tertiary rounded-lg space-y-3">
                    <TextArea
                        placeholder="Avec tooltip"
                        tooltip="Ceci est une aide contextuelle"
                        className="w-full"
                    />
                    <CodeBlock
                        code={`<TextArea 
  placeholder="Avec tooltip" 
  tooltip="Ceci est une aide contextuelle" 
/>`}
                    />
                </div>
            </section>

            {/* =========================
                STATES
            ========================= */}
            <section className="mb-12" id="states">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Error */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <TextArea placeholder="Champ avec erreur..." aria-invalid />
                        <CodeBlock
                            code={`<TextArea placeholder="Champ avec erreur..." aria-invalid />`}
                        />
                    </div>

                    {/* Disabled */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <TextArea disabled defaultValue="Contenu désactivé" />
                        <CodeBlock
                            code={`<TextArea disabled defaultValue="Contenu désactivé" />`}
                        />
                    </div>
                </div>
            </section>

            {/* =========================
                RESIZE OPTIONS
            ========================= */}
            <section className="mb-12" id="resize">
                <h2 className="text-xl font-semibold mb-4">Resize Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <TextArea placeholder="Resize vertical..." className="resize-y" rows={3} />
                        <CodeBlock
                            code={`<TextArea placeholder="Resize vertical..." className="resize-y" rows={3} />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <TextArea placeholder="No resize..." className="resize-none" rows={3} />
                        <CodeBlock
                            code={`<TextArea placeholder="No resize..." className="resize-none" rows={3} />`}
                        />
                    </div>
                </div>
            </section>

            {/* =========================
                FORM INTEGRATION
            ========================= */}
            <section className="mb-16" id="form">
                <h2 className="text-xl font-semibold mb-4">Form integration</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                        <TextAreaForm
                            control={form.control}
                            name="description"
                            label="Description"
                            description="Décrivez votre projet en quelques mots"
                            placeholder="Description de votre projet..."
                            isRequired
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>

                <CodeBlock
                    className="mt-4"
                    code={`
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
 const formSchema = z.object({
        description: z.string().min(5, {
            message: "Description must be at least 5 characters.",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        toast("Form submitted", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }
<TextAreaForm
  control={form.control}
  name="description"
  label="Description"
  description="Décrivez votre projet en quelques mots"
  placeholder="Description de votre projet..."
  isRequired
/>`}
                />
            </section>

            {/* =========================
                API REFERENCE
            ========================= */}
            <section className="my-16" id="api">
                <h2 className="text-2xl font-bold mb-6">API Reference</h2>
                <div className="overflow-x-auto space-y-16">
                    {/* TEXTAREA */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">TextArea</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="px-4 py-2">Props</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Default</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">size?</td>
                                    <td className="px-4 py-2">{`"sm" | "md"`}</td>
                                    <td className="px-4 py-2">{`"sm"`}</td>
                                    <td className="px-4 py-2">Contrôle la taille du padding.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltip?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Message d’aide contextuelle.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">wrapperClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Classes appliquées au wrapper.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltipClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Styles pour le contenu du tooltip.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TEXTAREA FORM */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">TextAreaForm</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="px-4 py-2">Props</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Default</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">control</td>
                                    <td className="px-4 py-2">Control&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Instance de React Hook Form.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">name</td>
                                    <td className="px-4 py-2">FieldPath&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Nom du champ dans le schéma.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">label?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Label affiché au-dessus.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">description?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Texte d’aide sous le champ.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">isRequired?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">Ajoute l’indicateur obligatoire.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
