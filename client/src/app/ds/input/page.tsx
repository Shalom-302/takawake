import React from "react";
import Link from "next/link";
import { Input } from "@/ds/components/input";
import { CodeBlock } from "@/ds/components/code-block";

export default function InputPage() {
    const variants = [
        {
            name: "default",
            description: "Default style",
        },
        {
            name: "success",
            description: "For validated fields",
        },
        {
            name: "warning",
            description: "For fields requiring attention",
        },
        {
            name: "error",
            description: "For fields with error",
        },
        {
            name: "info",
            description: "For informative fields",
        },
    ];

    const sizes = ["sm", "default", "lg"];
    const roundedStyles = ["default", "full", "none"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Input</h1>
                <p className="text-muted-foreground mt-2">
                    Inputs with different variants, sizes, and rounded styles.
                </p>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border rounded-lg">
                            <div className="mb-4">
                                <Input
                                    variant={variant.name as any}
                                    placeholder={`Input ${variant.name}`}
                                    className="w-full"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <CodeBlock
                                className="mt-2"
                                code={`<Input variant="${variant.name}" placeholder="Input ${variant.name}" />`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sizes.map(size => (
                        <div key={size} className="p-4 border rounded-lg">
                            <div className="mb-4">
                                <Input
                                    size={size as any}
                                    placeholder={`Size ${size}`}
                                    className="w-full"
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Input size="${size}" placeholder="Size ${size}" />`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Rounded styles */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Rounded styles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roundedStyles.map(rounded => (
                        <div key={rounded} className="p-4 border rounded-lg">
                            <div className="mb-4">
                                <Input
                                    rounded={rounded as any}
                                    placeholder={`Rounded ${rounded}`}
                                    className="w-full"
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Input rounded="${rounded}" placeholder="Rounded ${rounded}" />`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Types */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input types</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input type="password" placeholder="Password" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="password" placeholder="Password" />`}
                        />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input type="email" placeholder="Email" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="email" placeholder="Email" />`}
                        />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input type="number" placeholder="Number" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="number" placeholder="Number" />`}
                        />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input type="date" className="w-full" />
                        </div>
                        <CodeBlock className="mt-2" code={`<Input type="date" />`} />
                    </div>
                </div>
            </div>

            {/* Combinaisons */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combinaisons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input
                                variant={"success" as any}
                                size={"lg" as any}
                                rounded={"full" as any}
                                placeholder="Champ validé"
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input variant="success" size="lg" rounded="full" placeholder="Validated field" />`}
                        />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input
                                variant={"error" as any}
                                size={"sm" as any}
                                rounded={"none" as any}
                                placeholder="Error field"
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input variant="error" size="sm" rounded="none" placeholder="Error field" />`}
                        />
                    </div>
                </div>
            </div>

            {/* States */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input disabled placeholder="Disabled field" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input disabled placeholder="Disabled field" />`}
                        />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="mb-4">
                            <Input readOnly value="Readonly field" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input readOnly value="Readonly field" />`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
