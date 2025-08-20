import React from "react";
import Link from "next/link";
import { Button } from "@/ds/components/button";
import { CodeBlock } from "@/ds/components/code-block";

export default function ButtonPage() {
    const variants = [
        { name: "default", description: "Default style" },
        { name: "destructive", description: "For destructive or error actions" },
        { name: "outline", description: "Outline style" },
        { name: "secondary", description: "Secondary style" },
        { name: "ghost", description: "Transparent style" },
        { name: "link", description: "Link style" },
        { name: "success", description: "For success or validations" },
        { name: "warning", description: "For warnings" },
        { name: "info", description: "For information" },
        { name: "gradient", description: "Style with gradient" },
    ];

    const sizes = ["xs", "sm", "default", "lg", "xl", "icon"];
    const roundedStyles = ["default", "full", "none"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Button</h1>
                <p className="text-muted-foreground mt-2">
                    Interactive buttons with different styles and sizes.
                </p>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Button variant={variant.name as any}>Button {variant.name}</Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <CodeBlock 
                                className="mt-2"
                                code={`<Button variant="${variant.name}">Button ${variant.name}</Button>`} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
                    {sizes
                        .filter(size => size !== "icon")
                        .map(size => (
                            <Button key={size} variant="default" size={size as any}>
                                Button {size}
                            </Button>
                        ))}
                    <Button variant="default" size="icon">
                        <span className="h-4 w-4">+</span>
                    </Button>
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Button size="xs|sm|default|lg|xl|icon">Button text</Button>`} 
                />
            </div>

            {/* Rounded styles */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Rounded styles</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    {roundedStyles.map(rounded => (
                        <Button key={rounded} variant="default" rounded={rounded as any}>
                            Button {rounded}
                        </Button>
                    ))}
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Button rounded="default|full|none">Button text</Button>`} 
                />
            </div>

            {/* Combinations */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combinations</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    <Button variant={"success" as any} size="lg" rounded="full">
                        Confirm
                    </Button>
                    <Button variant={"warning" as any} size="sm" rounded="none">
                        Warning
                    </Button>
                    <Button variant={"info" as any} size="default" rounded="default">
                        More info
                    </Button>
                    <Button variant={"gradient" as any} size={"xl" as any} rounded="full">
                        Special action
                    </Button>
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Button variant={"success" as any} size="lg" rounded="full">Confirm</Button>`} 
                />
            </div>
        </div>
    );
}
