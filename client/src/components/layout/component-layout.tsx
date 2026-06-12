"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface ComponentLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
    isComposite?: boolean;
}

export function ComponentLayout({ title, description, children, className }: ComponentLayoutProps) {
    return (
        <div className={cn("space-y-8", className)}>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-10">{children}</div>
        </div>
    );
}
