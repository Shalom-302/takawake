import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Badge, BadgeVariants } from "@/components/ui/badges/badge";
import { Dot } from "@/components/icons/dot-icon";

export default function BadgePage() {
    const variants = [
        { name: "pill-color", description: " Default variant" },
        { name: "color", description: " color variant" },
        { name: "modern", description: " modern variant" },
    ];
    const colors = [
        "gray",
        "brand",
        "error",
        "warning",
        "success",
        "gray-blue",
        "blue-ligt",
        "blue",
        "indigo",
        "purple",
        "pink",
        "orange",
    ];
    const sizes = ["sm", "md", "lg"];

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
                                <Badge variant={variant.name as BadgeVariants["variant"]}>
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
                        <div key={color} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge color={color as BadgeVariants["color"]}>
                                    <Dot size="sm" />
                                    Badge {color}
                                </Badge>
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge color="${color}"><Dot size="sm"/>Badge ${color}</Badge>`}
                            />
                        </div>
                    ))}
                    {colors.map(color => (
                        <div key={color} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={"color"} color={color as BadgeVariants["color"]}>
                                    Badge {color}
                                </Badge>
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge variant={'color'} color="${color}">Badge ${color}</Badge>`}
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
                        <Badge key={size} size={size as BadgeVariants["size"]}>
                            Badge {size}
                        </Badge>
                    ))}
                </div>
                <CodeBlock className="mt-2" code={`<Badge size="sm|md|lg">Badge</Badge>`} />
            </div>

            {/* Combinations */}
            {/* <div className="mb-10">
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
            </div> */}

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-sm">variant?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'pill-color' | 'color' | 'modern'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{"pill-color"}</td>
                                <td className="py-2 px-4">Badge Variants.</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-sm">color?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'gray' | 'brand' | 'eror' | 'warning' | 'success' | 'gray-blue' 
                                    | 'blue-light' | 'blue' | 'indigo' | 'purple' | 'pink' | 'orange'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{"gray"}</td>
                                <td className="py-2 px-4">The badge color</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'sm' | 'md' | 'lg'`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{"sm"}</td>
                                <td className="py-2 px-4">The badge size .</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-sm">asChild?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`boolean`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{"false"}</td>
                                <td className="py-2 px-4">
                                    Change the default rendered element for the one passed as a
                                    child, merging their props and behavior.
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional CSS classes to apply to the badge.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
