"use client";

import * as React from "react";
import {
    Dialog as ShadcnDialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger as ShadcnDialogTrigger,
    DialogContent as ShadcnDialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Extension des variants de dialog content
export const dialogContentVariants = cva(
    "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
    {
        variants: {
            size: {
                default: "max-w-lg",
                sm: "max-w-sm",
                md: "max-w-md",
                lg: "max-w-lg",
                xl: "max-w-xl",
                "2xl": "max-w-2xl",
                "3xl": "max-w-3xl",
                "4xl": "max-w-4xl",
                "5xl": "max-w-5xl",
                full: "max-w-full mx-4",
            },
            rounded: {
                default: "sm:rounded-lg",
                none: "",
                sm: "sm:rounded-md",
                md: "sm:rounded-lg",
                lg: "sm:rounded-xl",
                full: "sm:rounded-full",
            },
        },
        defaultVariants: {
            size: "default",
            rounded: "default",
        },
    }
);

// Types pour les props du composant Dialog simplifié
export interface DialogProps extends React.ComponentProps<typeof ShadcnDialog> {
    // Props pour l'API simplifiée
    title?: string;
    description?: string;
    content?: React.ReactNode;
    trigger?: React.ReactNode;
    footer?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Props pour le style
    size?: VariantProps<typeof dialogContentVariants>["size"];
    rounded?: VariantProps<typeof dialogContentVariants>["rounded"];
    contentClassName?: string;
    headerClassName?: string;
    footerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}

// Composant Dialog avec API simplifiée
export function Dialog({
    title,
    description,
    content,
    trigger,
    footer,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    open,
    onOpenChange,
    size,
    rounded,
    contentClassName,
    headerClassName,
    footerClassName,
    titleClassName,
    descriptionClassName,
    children,
    ...props
}: DialogProps) {
    // Gestion des callbacks pour les boutons de confirmation et d'annulation
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    // Si des enfants sont fournis, utiliser le mode composant normal
    if (children) {
        return (
            <ShadcnDialog open={open} onOpenChange={onOpenChange} {...props}>
                {children}
            </ShadcnDialog>
        );
    }

    // Sinon, utiliser l'API simplifiée
    return (
        <ShadcnDialog open={open} onOpenChange={onOpenChange} {...props}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent size={size} rounded={rounded} className={contentClassName}>
                {(title || description) && (
                    <DialogHeader className={headerClassName}>
                        {title && <DialogTitle className={titleClassName}>{title}</DialogTitle>}
                        {description && (
                            <DialogDescription className={descriptionClassName}>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                )}
                {content}
                {(footer || confirmLabel || cancelLabel) && (
                    <DialogFooter className={footerClassName}>
                        {footer || (
                            <>
                                {cancelLabel && (
                                    <Button variant="outline" onClick={handleCancel}>
                                        {cancelLabel}
                                    </Button>
                                )}
                                {confirmLabel && (
                                    <Button onClick={handleConfirm}>{confirmLabel}</Button>
                                )}
                            </>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </ShadcnDialog>
    );
}

// Composants individuels avec les variants
export const DialogTrigger = ShadcnDialogTrigger;

export const DialogContent = React.forwardRef<
    React.ElementRef<typeof ShadcnDialogContent>,
    React.ComponentPropsWithoutRef<typeof ShadcnDialogContent> &
        VariantProps<typeof dialogContentVariants>
>(({ className, size, rounded, ...props }, ref) => (
    <ShadcnDialogContent
        ref={ref}
        className={cn(dialogContentVariants({ size, rounded }), className)}
        {...props}
    />
));
DialogContent.displayName = "DialogContent";

// Re-export des autres composants pour une utilisation avancée
export { DialogPortal, DialogOverlay, DialogClose };
