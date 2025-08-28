import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import { Button } from "@/components/ui/buttons/button";
import { Circle } from "@untitled-ui/icons-react";
import { LinkButton } from "@/components/ui/buttons/link-button";

export default function ButtonPage() {
    const variants = [
        { name: "primary", description: "Primary style" },
        { name: "secondary", description: "Secondary style" },
        { name: "tertiary", description: "Tertiary style" },
        { name: "link-gray", description: "Link gray style" },
        { name: "link-color", description: "Link color style" },
        { name: "primary-destructive", description: "For destructive or error actions" },
        { name: "secondary-destructive", description: "For destructive or error actions" },
        { name: "tertiary-destructive", description: "For destructive or error actions" },
        { name: "link-destructive", description: "Link destructive " },
    ];

    const sizes = ["sm", "md", "lg", "xl"];

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
                    {variants.map(variant => {
                        return (
                            <>
                                {!variant.name.includes("link") ? (
                                    <div key={variant.name} className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Button variant={variant.name as any}>
                                                Button {variant.name}
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {variant.description}
                                        </p>
                                        <CodeBlock
                                            className="mt-2"
                                            code={`<Button variant="${variant.name}">Button ${variant.name}</Button>`}
                                        />
                                    </div>
                                ) : (
                                    <div key={variant.name} className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkButton href={"#"} variant={variant.name as any}>
                                                Button {variant.name}
                                            </LinkButton>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {variant.description}
                                        </p>
                                        <CodeBlock
                                            className="mt-2"
                                            code={`<LinkButton variant="${variant.name}">${variant.name} Button</LinkButton>`}
                                        />
                                    </div>
                                )}
                            </>
                        );
                    })}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
                    {sizes.map(size => (
                        <Button key={size} size={size as any}>
                            Button {size}
                        </Button>
                    ))}
                    {sizes.map(size => (
                        <Button key={size} iconLeft={<Circle data-icon />} size={size} />
                    ))}
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<Button size="sm|md|lg|xl">Button text</Button>`}
                />
            </div>
        </div>
    );
}
