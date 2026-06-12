import React from "react";

interface ComponentLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export function ComponentLayout({ children, title, description }: ComponentLayoutProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground mt-2">{description}</p>
            </div>

            {/* Content */}
            <div className="space-y-10">{children}</div>
        </div>
    );
}

interface ComponentSectionProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    id?: string;
}

export function ComponentSection({ children, title, description, id }: ComponentSectionProps) {
    return (
        <section id={id} className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            <div>{children}</div>
        </section>
    );
}

interface ComponentExampleProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    code?: React.ReactNode;
    showCode?: boolean;
}

export function ComponentExample({
    children,
    title,
    description,
    code,
    showCode = false,
}: ComponentExampleProps) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/40">
                <h3 className="font-medium">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="p-6 flex items-center justify-center bg-background">{children}</div>
            {code && showCode && <div className="p-4 border-t bg-muted/40">{code}</div>}
        </div>
    );
}

interface ComponentPropsTableProps {
    items: {
        name: string;
        type: string;
        defaultValue?: string;
        description?: string;
        required?: boolean;
    }[];
}

export function ComponentPropsTable({ items }: ComponentPropsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Default</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.name} className="border-b">
                            <td className="py-3 px-4 align-top font-mono text-xs">
                                {item.name}
                                {item.required && <span className="text-destructive ml-1">*</span>}
                            </td>
                            <td className="py-3 px-4 align-top font-mono text-xs">{item.type}</td>
                            <td className="py-3 px-4 align-top font-mono text-xs">
                                {item.defaultValue || "-"}
                            </td>
                            <td className="py-3 px-4 align-top">{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
