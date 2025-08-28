"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import {
    Accordion as ShadcnAccordion,
    AccordionItem as ShadcnAccordionItem,
    AccordionTrigger as ShadcnAccordionTrigger,
    AccordionContent as ShadcnAccordionContent,
} from "@/components/ui/accordion";

// Variants for AccordionItem
const accordionItemVariants = cva("", {
    variants: {
        variant: {
            default: "border-b",
            bordered: "border border-border rounded-md mb-2",
            card: "border border-border rounded-md shadow-sm mb-2",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

// Variants for AccordionTrigger
const accordionTriggerVariants = cva(
    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
    {
        variants: {
            variant: {
                default: "",
                filled: "bg-muted/50 px-4 rounded-t-md",
                minimal: "hover:no-underline",
            },
            size: {
                default: "text-sm",
                sm: "text-xs py-2",
                lg: "text-base py-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// Variants for AccordionContent
const accordionContentVariants = cva(
    "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    {
        variants: {
            variant: {
                default: "",
                filled: "bg-muted/30 px-4 rounded-b-md",
            },
            padding: {
                default: "",
                sm: "p-2",
                md: "p-4",
                lg: "p-6",
            },
        },
        defaultVariants: {
            variant: "default",
            padding: "default",
        },
    }
);

// Interfaces for props
export interface AccordionItemProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnAccordionItem>,
        VariantProps<typeof accordionItemVariants> {}

export interface AccordionTriggerProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnAccordionTrigger>,
        VariantProps<typeof accordionTriggerVariants> {}

export interface AccordionContentProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnAccordionContent>,
        VariantProps<typeof accordionContentVariants> {}

// Composants with variants
const AccordionItem = React.forwardRef<
    React.ElementRef<typeof ShadcnAccordionItem>,
    AccordionItemProps
>(({ className, variant, ...props }, ref) => (
    <ShadcnAccordionItem
        ref={ref}
        className={cn(accordionItemVariants({ variant }), className)}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof ShadcnAccordionTrigger>,
    AccordionTriggerProps
>(({ className, variant, size, ...props }, ref) => (
    <ShadcnAccordionTrigger
        ref={ref}
        className={cn(accordionTriggerVariants({ variant, size }), className)}
        {...props}
    />
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof ShadcnAccordionContent>,
    AccordionContentProps
>(({ className, variant, padding, ...props }, ref) => (
    <ShadcnAccordionContent
        ref={ref}
        className={cn(accordionContentVariants({ variant, padding }), className)}
        {...props}
    />
));
AccordionContent.displayName = "AccordionContent";

// Type for accordion items
export interface AccordionItemData {
    value: string;
    trigger: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}

// Interface for the Accordion component
export interface AccordionProps {
    items: AccordionItemData[];
    type?: "single" | "multiple";
    collapsible?: boolean;
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    // Props pour le style
    itemVariant?: VariantProps<typeof accordionItemVariants>["variant"];
    triggerVariant?: VariantProps<typeof accordionTriggerVariants>["variant"];
    triggerSize?: VariantProps<typeof accordionTriggerVariants>["size"];
    contentVariant?: VariantProps<typeof accordionContentVariants>["variant"];
    contentPadding?: VariantProps<typeof accordionContentVariants>["padding"];
    // Classes personnalisées
    className?: string;
    itemClassName?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

// Composant Accordion avec API simplifiée
export function SimplifiedAccordion({
    items,
    type = "single",
    collapsible = true,
    defaultValue,
    value,
    onValueChange,
    itemVariant,
    triggerVariant,
    triggerSize,
    contentVariant,
    contentPadding,
    className,
    itemClassName,
    triggerClassName,
    contentClassName,
}: AccordionProps) {
    // Gérer correctement les types pour l'accordéon single ou multiple
    if (type === "single") {
        return (
            <ShadcnAccordion
                type="single"
                collapsible={collapsible}
                defaultValue={defaultValue as string}
                value={value as string}
                onValueChange={onValueChange as (value: string) => void}
                className={className}
            >
                {items.map(item => (
                    <AccordionItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        variant={itemVariant}
                        className={itemClassName}
                    >
                        <AccordionTrigger
                            variant={triggerVariant}
                            size={triggerSize}
                            className={triggerClassName}
                        >
                            {item.trigger}
                        </AccordionTrigger>
                        <AccordionContent
                            variant={contentVariant}
                            padding={contentPadding}
                            className={contentClassName}
                        >
                            {item.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </ShadcnAccordion>
        );
    } else {
        // Type "multiple"
        return (
            <ShadcnAccordion
                type="multiple"
                defaultValue={defaultValue as string[]}
                value={value as string[]}
                onValueChange={onValueChange as (value: string[]) => void}
                className={className}
            >
                {items.map(item => (
                    <AccordionItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        variant={itemVariant}
                        className={itemClassName}
                    >
                        <AccordionTrigger
                            variant={triggerVariant}
                            size={triggerSize}
                            className={triggerClassName}
                        >
                            {item.trigger}
                        </AccordionTrigger>
                        <AccordionContent
                            variant={contentVariant}
                            padding={contentPadding}
                            className={contentClassName}
                        >
                            {item.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </ShadcnAccordion>
        );
    }
}

// Réexporter Accordion comme alias pour une meilleure lisibilité dans les imports
export { SimplifiedAccordion as Accordion };
