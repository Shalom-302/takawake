"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils/cn";
import { CloseButton } from "../button";

type SlideoutProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    slideoutContentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
};

export function Slideout({
    trigger,
    title,
    description,
    content,
    footer,
    showCloseButton = true,
    slideoutContentClassName,
    headerClassName,
    titleClassName,
    descriptionClassName,
    footerClassName,
    ...props
}: SlideoutProps) {
    return (
        <DrawerPrimitive.Root data-slot="slideout" direction="right" {...props}>
            {trigger && <SlideoutTrigger asChild>{trigger}</SlideoutTrigger>}
            <SlideoutContent className={slideoutContentClassName} showCloseButton={showCloseButton}>
                {(title || description) && (
                    <SlideoutHeader className={headerClassName}>
                        {title && <SlideoutTitle className={titleClassName}>{title}</SlideoutTitle>}
                        {description && (
                            <SlideoutDescription className={descriptionClassName}>
                                {description}
                            </SlideoutDescription>
                        )}
                    </SlideoutHeader>
                )}
                <SlideoutBody>{content}</SlideoutBody>
                {footer && <SlideoutFooter className={footerClassName}>{footer}</SlideoutFooter>}
            </SlideoutContent>
        </DrawerPrimitive.Root>
    );
}

// ============================================================================
// Composants de composition
// ============================================================================

function SlideoutRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="slideout" direction="right" {...props} />;
}

function SlideoutTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot="slideout-trigger" {...props} />;
}

function SlideoutPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot="slideout-portal" {...props} />;
}

function SlideoutClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot="slideout-close" {...props} />;
}

function SlideoutOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="slideout-overlay"
            className={cn(
                "fixed inset-0 min-h-dvh z-50 bg-overlay/70 backdrop-blur-sm",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=open]:duration-300 data-[state=closed]:duration-500",
                className
            )}
            {...props}
        />
    );
}

interface SlideoutContentProps extends React.ComponentProps<typeof DrawerPrimitive.Content> {
    showCloseButton?: boolean;
}

function SlideoutContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: SlideoutContentProps) {
    return (
        <SlideoutPortal>
            <SlideoutOverlay />
            <DrawerPrimitive.Content
                data-slot="slideout-content"
                className={cn(
                    "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[400px] shadow-xl transition flex-col items-start gap-6 overflow-y-auto bg-primary ring-1 ring-secondary_alt outline-hidden",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                    "data-[state=open]:duration-300 data-[state=closed]:duration-500",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DrawerPrimitive.Close
                        data-slot="slideout-close-button"
                        className="absolute z-10 top-3 right-3 shrink-0"
                    >
                        <CloseButton size="md" />
                        <span className="sr-only">Close</span>
                    </DrawerPrimitive.Close>
                )}
            </DrawerPrimitive.Content>
        </SlideoutPortal>
    );
}

function SlideoutHeader({ className, ...props }: React.ComponentProps<"header">) {
    return (
        <header
            data-slot="slideout-header"
            className={cn("relative z-10 flex flex-col gap-2 px-4 pt-6 md:px-6", className)}
            {...props}
        />
    );
}

function SlideoutBody({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="slideout-body"
            className={cn(
                "flex size-full flex-col gap-6 overflow-y-auto overscroll-auto px-4 md:px-6",
                className
            )}
            {...props}
        />
    );
}

function SlideoutFooter({ className, ...props }: React.ComponentProps<"footer">) {
    return (
        <footer
            data-slot="slideout-footer"
            className={cn(
                "w-full p-4 shadow-[inset_0px_1px_0px_0px] shadow-border-secondary md:px-6",
                className
            )}
            {...props}
        />
    );
}

function SlideoutTitle({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            data-slot="slideout-title"
            className={cn("text-lg font-semibold leading-none text-secondary", className)}
            {...props}
        />
    );
}

function SlideoutDescription({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            data-slot="slideout-description"
            className={cn("text-sm text-tertiary", className)}
            {...props}
        />
    );
}

// ============================================================================
// Export des composants de composition
// ============================================================================

export const SlideoutCustom = {
    Root: SlideoutRoot,
    Trigger: SlideoutTrigger,
    Portal: SlideoutPortal,
    Close: SlideoutClose,
    Overlay: SlideoutOverlay,
    Content: SlideoutContent,
    Header: SlideoutHeader,
    Body: SlideoutBody,
    Footer: SlideoutFooter,
    Title: SlideoutTitle,
    Description: SlideoutDescription,
};
