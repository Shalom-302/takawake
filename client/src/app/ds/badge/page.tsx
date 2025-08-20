import React from "react";
import Link from "next/link";
import { Badge } from "@/ds/components/badge";
import { CodeBlock } from "@/ds/components/code-block";

export default function BadgePage() {
    const variants = [
        { name: "default", description: "Default style" },
        { name: "secondary", description: "Secondary style" },
        { name: "destructive", description: "For destructive or error actions" },
        { name: "outline", description: "Outline style" },
        { name: "success", description: "For success or validations" },
        { name: "warning", description: "For warnings" },
        { name: "info", description: "For information" },
        { name: "ghost", description: "Transparent style" },
    ];

    const sizes = ["default", "sm", "lg"];
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
                                <Badge variant={variant.name as any}>Badge {variant.name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <CodeBlock 
                                className="mt-2"
                                code={`<Badge variant="${variant.name}">Badge ${variant.name}</Badge>`} 
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
                        <Badge key={size} variant="default" size={size as any}>
                            Badge {size}
                        </Badge>
                    ))}
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Badge size="default|sm|lg">Badge text</Badge>`} 
                />
            </div>

            {/* Rounded styles */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Rounded styles</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    {roundedStyles.map(rounded => (
                        <Badge key={rounded} variant="default" rounded={rounded as any}>
                            Badge {rounded}
                        </Badge>
                    ))}
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Badge rounded="default|full|none">Badge text</Badge>`} 
                />
            </div>

            {/* Combinations */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combinations</h2>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                    <Badge variant={"success" as any} size="lg" rounded="full">
                        Success
                    </Badge>
                    <Badge variant={"warning" as any} size="sm" rounded="none">
                        Warning
                    </Badge>
                    <Badge variant={"info" as any} size="default" rounded="default">
                        Information
                    </Badge>
                    <Badge variant="destructive" size="lg" rounded="default">
                        Error
                    </Badge>
                </div>
                <CodeBlock 
                    className="mt-2"
                    code={`<Badge variant={"success" as any} size="lg" rounded="full">Success</Badge>`} 
                />
            </div>
        </div>
    );
}
