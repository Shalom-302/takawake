"use client";

import { cn } from "@/lib/utils/cn";
import { useClipboard } from "@/lib/hooks/use-clipboard";
import { Check, Copy01 } from "@untitled-ui/icons-react";

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}

export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
    const { copy, copied } = useClipboard();

    return (
        <div className={cn("relative group", className)}>
            <pre className="p-2 rounded-md text-xs overflow-auto">
                <code className={`language-${language}`}>{code}</code>
            </pre>
            <button
                onClick={() => copy(code)}
                className="absolute top-2 right-2 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Copier le code"
            >
                {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                ) : (
                    <Copy01 className="h-4 w-4 text-tertiary" />
                )}
            </button>
        </div>
    );
}
