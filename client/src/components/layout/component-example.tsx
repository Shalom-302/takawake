"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/ds/components/button";
import { Tabs } from "@/ds/components/tabs";
import { Copy } from "lucide-react";

interface ComponentExampleProps {
    title: string;
    description?: string;
    preview: React.ReactNode;
    code: string;
    className?: string;
}

export function ComponentExample({
    title,
    description,
    preview,
    code,
    className,
}: ComponentExampleProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="space-y-1">
                <h3 className="text-lg font-medium">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 z-10"
                    onClick={copyToClipboard}
                >
                    {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>

                <Tabs
                    defaultValue="preview"
                    className="relative"
                    tabs={[
                        {
                            value: "preview",
                            label: "Preview",
                            content: (
                                <div className="rounded-md border p-6">
                                    <div className="flex min-h-[200px] w-full items-center justify-center">
                                        {preview}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            value: "code",
                            label: "Code",
                            content: (
                                <div className="rounded-md border bg-muted p-6">
                                    <pre className="text-sm text-muted-foreground overflow-x-auto">
                                        <code>{code}</code>
                                    </pre>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
