"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";

interface AccordionItemData {
    value: string;
    trigger: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}

type AccordionPrimitiveProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

type AccordionProps = AccordionPrimitiveProps & {
    items: AccordionItemData[];
    itemVariant?: AccordionItemVariants["itemVariant"];
    triggerVariant?: AccordionTriggerVariants["triggerVariant"];
    contentVariant?: AccordionContentVariants["contentVariant"];
    className?: string; // Accordion class
    itemClassName?: string;
    triggerClassName?: string;
    contentClassName?: string;
};
function Accordion(props: AccordionProps) {
    const {
        type,
        value,
        defaultValue,
        onValueChange,
        items,
        itemVariant,
        triggerVariant,
        contentVariant,
        className,
        itemClassName,
        triggerClassName,
        contentClassName,
        ...rest
    } = props;

    if (type === "multiple") {
        return (
            <AccordionRoot
                type={type}
                className={className}
                defaultValue={defaultValue as string[]}
                value={value as string[]}
                onValueChange={onValueChange as (value: string[]) => void}
                {...rest}
            >
                {items.map(item => (
                    <AccordionItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        itemVariant={itemVariant}
                        className={itemClassName}
                    >
                        <AccordionTrigger
                            triggerVariant={triggerVariant}
                            className={triggerClassName}
                        >
                            {item.trigger}
                        </AccordionTrigger>
                        <AccordionContent
                            contentVariant={contentVariant}
                            className={contentClassName}
                        >
                            {item.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </AccordionRoot>
        );
    } else {
        const { collapsible = true } = props;
        return (
            <AccordionRoot
                type={type}
                className={className}
                defaultValue={defaultValue as string}
                value={value as string}
                onValueChange={onValueChange as (value: string) => void}
                collapsible={collapsible}
                {...rest}
            >
                {items.map(item => (
                    <AccordionItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        itemVariant={itemVariant}
                        className={itemClassName}
                    >
                        <AccordionTrigger
                            triggerVariant={triggerVariant}
                            className={triggerClassName}
                        >
                            {item.trigger}
                        </AccordionTrigger>
                        <AccordionContent
                            contentVariant={contentVariant}
                            className={contentClassName}
                        >
                            {item.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </AccordionRoot>
        );
    }
}

function AccordionRoot({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

const accordionItemVariants = cva(
    "border-secondary disabled:pointer-events-none disabled:text-placeholder_subtle",
    {
        variants: {
            itemVariant: {
                default: "border-b first:border-t border-secondary",
                bordered: "border rounded-md mb-2",
                card: "border rounded-md shadow-sm mb-2",
            },
        },
        defaultVariants: {
            itemVariant: "default",
        },
    }
);
export type AccordionItemVariants = VariantProps<typeof accordionItemVariants>;

function AccordionItem({
    className,
    itemVariant,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
    itemVariant: AccordionItemVariants["itemVariant"];
}) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn(accordionItemVariants({ itemVariant }), className)}
            {...props}
        />
    );
}

const accordionTriggerVariants = cva(
    [
        "flex flex-1 items-start justify-between gap-4 rounded-md h-max text-left font-medium transition-all cursor-pointer px-2",
        "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:text-placeholder_subtle disabled:[&_svg]:text-placeholder_subtle",
        "[&[data-state=open]>svg]:rotate-180",
    ],
    {
        variants: {
            triggerVariant: {
                default: "my-4",
                filled: "bg-secondary rounded-t-md py-5",
                underline: "hover:underline",
            },
        },
        defaultVariants: {
            triggerVariant: "default",
        },
    }
);
export type AccordionTriggerVariants = VariantProps<typeof accordionTriggerVariants>;

function AccordionTrigger({
    className,
    children,
    triggerVariant,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
    triggerVariant: AccordionTriggerVariants["triggerVariant"];
}) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(accordionTriggerVariants({ triggerVariant }), className)}
                {...props}
            >
                {children}
                <ChevronDownIcon className="text-fg-quaternary_hover pointer-cursor size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

const accordionContentVariants = cva("pt-0 pb-4 px-2", {
    variants: {
        contentVariant: {
            default: "",
            filled: "bg-secondary pt-4 rounded-b-md",
        },
    },
    defaultVariants: {
        contentVariant: "default",
    },
});
export type AccordionContentVariants = VariantProps<typeof accordionContentVariants>;

function AccordionContent({
    className,
    contentVariant,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
    contentVariant: AccordionContentVariants["contentVariant"];
}) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
            {...props}
        >
            <div className={cn(accordionContentVariants({ contentVariant }), className)}>
                {children}
            </div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
