"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    drawerContentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
    direction?: "top" | "bottom" | "left" | "right";
};

export function Drawer({
    trigger,
    title,
    description,
    content,
    footer,
    showCloseButton,
    drawerContentClassName,
    headerClassName,
    titleClassName,
    descriptionClassName,
    footerClassName,
    direction = "bottom",
    ...props
}: DrawerProps) {
    return (
        <DrawerPrimitive.Root data-slot="drawer" direction={direction} {...props}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className={drawerContentClassName} showCloseButton={showCloseButton}>
                {(title || description) && (
                    <DrawerHeader className={headerClassName}>
                        {title && <DrawerTitle className={titleClassName}>{title}</DrawerTitle>}
                        {description && (
                            <DrawerDescription className={descriptionClassName}>
                                {description}
                            </DrawerDescription>
                        )}
                    </DrawerHeader>
                )}
                {content}
                {footer && <DrawerFooter className={footerClassName}>{footer}</DrawerFooter>}
            </DrawerContent>
        </DrawerPrimitive.Root>
    );
}

function DrawerRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay opacity-70 backdrop-blur-md",
                className
            )}
            {...props}
        />
    );
}

interface DrawerContentProps extends React.ComponentProps<typeof DrawerPrimitive.Content> {
    showCloseButton?: boolean;
}

function DrawerContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: DrawerContentProps) {
    return (
        <DrawerPortal data-slot="drawer-portal">
            <DrawerOverlay />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    "group/drawer-content bg-primary fixed z-50 flex h-auto flex-col border-secondary shadow-lg",
                    // Top
                    "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
                    // Bottom
                    "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
                    // Right
                    "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
                    // Left
                    "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
                    className
                )}
                {...props}
            >
                {/* Drag handle pour bottom/top */}
                <div className="mx-auto mt-4 hidden h-1.5 w-12 shrink-0 rounded-full bg-border-secondary group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:block" />

                {children}

                {showCloseButton && (
                    <DrawerPrimitive.Close
                        data-slot="drawer-close"
                        className="data-[state=open]:text-fg-quaternary absolute top-4 right-4 z-10 rounded-xs opacity-70 transition-opacity hover:opacity-100 ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DrawerPrimitive.Close>
                )}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="drawer-header"
            className={cn(
                "flex flex-col gap-2 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:text-left",
                className
            )}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="drawer-footer"
            className={cn(
                "mt-auto flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end",
                className
            )}
            {...props}
        />
    );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn("text-lg text-secondary leading-none font-semibold", className)}
            {...props}
        />
    );
}

function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn("text-tertiary text-sm", className)}
            {...props}
        />
    );
}

export const DrawerCustom = {
    Root: DrawerRoot,
    Close: DrawerClose,
    Content: DrawerContent,
    Description: DrawerDescription,
    Footer: DrawerFooter,
    Header: DrawerHeader,
    Overlay: DrawerOverlay,
    Portal: DrawerPortal,
    Title: DrawerTitle,
    Trigger: DrawerTrigger,
};
