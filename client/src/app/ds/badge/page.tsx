import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Badge } from "@/components/ui/badge";
import { Dot } from "@/components/icons/dot-icon";
import { Plus } from "@untitled-ui/icons-react";

export default function BadgePage() {
    const variants = [
        { name: "pill-color", description: " Default variant" },
        { name: "color", description: " color variant" },
        { name: "modern", description: " modern variant" },
    ];
    const colors = [
        { name: "gray" },
        { name: "brand" },
        { name: "error" },
        { name: "warning" },
        { name: "success" },
        { name: "gray-blue" },
        { name: "blue-light" },
        { name: "blue" },
        { name: "indigo" },
        { name: "purple" },
        { name: "pink" },
        { name: "orange" },
    ];
    const sizes = ["sm", "md", "lg"];
    const roundedStyles = ["default", "full", "none"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Badge</h1>
                <p className="text-muted-foreground mt-2">
                    Badges to display statuses, labels or notifications.
                </p>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={variant.name as any}>
                                    <Dot size="sm" />
                                    Badge {variant.name}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge variant="${variant.name}"><Dot size="sm"/>Badge ${variant.name}</Badge>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Colors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {colors.map(color => (
                        <div key={color.name} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge color={color.name as any}>
                                    <Dot size="sm" />
                                    Badge {color.name}
                                </Badge>
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge color="${color.name}"><Dot size="sm"/>Badge ${color.name}</Badge>`}
                            />
                        </div>
                    ))}
                    {colors.map(color => (
                        <div key={color.name} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={"color"} color={color.name as any}>
                                    Badge {color.name}
                                </Badge>
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge variant={'color'} color="${color.name}">Badge ${color.name}</Badge>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    {sizes.map(size => (
                        <Badge key={size} size={size as any}>
                            Badge {size}
                        </Badge>
                    ))}
                </div>
                <CodeBlock className="mt-2" code={`<Badge size="sm|md|lg">Badge</Badge>`} />
            </div>

            {/* Combinations */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combinations</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    <Badge color={"success"} size="lg">
                        Success
                    </Badge>
                    <Badge variant="pill-color" color={"warning"} size="sm">
                        Warning
                    </Badge>
                    <Badge color={"blue"} size="md">
                        Information
                    </Badge>
                    <Badge color="error" size="lg">
                        Error
                    </Badge>
                </div>
                <CodeBlock
                    className="mt-2 w-[500px]"
                    code={`<Badge color={"success"} size="lg">Success</Badge>`}
                />
            </div>
        </div>
    );
}
