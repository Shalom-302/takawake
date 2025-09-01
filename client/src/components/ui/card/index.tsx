import * as React from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = React.ComponentProps<"div"> & {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    actionClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
};

function Card({
    title,
    description,
    action,
    content,
    footer,
    className,
    headerClassName,
    titleClassName,
    descriptionClassName,
    actionClassName,
    contentClassName,
    footerClassName,
}: CardProps) {
    return (
        <CardRoot className={className}>
            {title && (
                <CardHeader className={headerClassName}>
                    <CardTitle className={titleClassName}>{title}</CardTitle>
                    {description && (
                        <CardDescription className={descriptionClassName}>
                            {description}
                        </CardDescription>
                    )}
                    {action && <CardAction className={actionClassName}>{action}</CardAction>}
                </CardHeader>
            )}

            <CardContent className={contentClassName}>{content}</CardContent>
            {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
        </CardRoot>
    );
}

function CardRoot({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "overflow-hidden bg-primary text-card-foreground ring-1 ring-secondary flex flex-col gap-6 rounded-xl py-6 shadow-sm",
                className
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
                className
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-title"
            className={cn("text-primary leading-none font-semibold", className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-description"
            className={cn("text-tertiary text-sm", className)}
            {...props}
        />
    );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
                className
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
            {...props}
        />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
