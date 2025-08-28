"use client";
import React, { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}

export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("relative group", className)}>
            <pre className="p-2 bg-muted rounded-md text-xs overflow-auto">
                <code className={`language-${language}`}>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Copier le code"
            >
                {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                    <CopyIcon className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
        </div>
    );
}
