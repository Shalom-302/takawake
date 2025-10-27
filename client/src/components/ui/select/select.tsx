"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown, ChevronUp } from "@untitled-ui/icons-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";

export interface SelectItemData {
    id: string;
    label?: React.ReactNode;
    value?: string;
    disabled?: boolean;
    type?: "item" | "separator" | "group";
    icon?: React.ReactNode;
    avatarUrl?: string;
    supportingText?: string;
    customContent?: React.ReactNode;
    // pour group
    items?: SelectItemData[];
}

interface SelectProps
    extends React.ComponentProps<typeof SelectPrimitive.Root>,
        Omit<SelectTriggerProps, "defaultValue" | "dir" | "value" | "className"> {
    items: SelectItemData[];
    placeholder?: string;
    triggerClassName?: string;
    contentClassName?: string;
    itemClassName?: string;
    renderItem?: (item: SelectItemData) => React.ReactNode;
}

function renderSelectItem(
    item: SelectItemData,
    renderItem?: (item: SelectItemData) => React.ReactNode,
    itemClassName?: string
): React.ReactNode {
    switch (item.type) {
        case "separator":
            return <SelectSeparator key={item.id} />;
        // case "label":
        //     return <SelectLabel key={item.id}>{item.label}</SelectLabel>;
        case "group":
            return (
                <SelectGroup key={item.id}>
                    {item.label && <SelectLabel>{item.label}</SelectLabel>}
                    {item.items?.map(subItem =>
                        renderSelectItem(subItem, renderItem, itemClassName)
                    )}
                </SelectGroup>
            );
        case "item":
        default:
            return (
                <SelectItem
                    key={item.id}
                    value={item.value || item.id}
                    disabled={item.disabled}
                    className={itemClassName}
                >
                    {renderItem ? renderItem(item) : <DefaultItemContent item={item} />}
                </SelectItem>
            );
    }
}

// Composant pour le contenu par défaut d'un item
function DefaultItemContent({ item }: { item: SelectItemData }) {
    if (item.customContent) {
        return <>{item.customContent}</>;
    }

    return (
        <div className="flex items-center gap-2 w-full">
            {item.icon && (
                <span className="flex-shrink-0 flex items-center justify-center">{item.icon}</span>
            )}
            {item.avatarUrl && (
                <Image
                    src={item.avatarUrl}
                    alt={typeof item.label === "string" ? item.label : ""}
                    width={20}
                    height={20}
                    className="rounded-full flex-shrink-0"
                />
            )}

            <div>{item.label}</div>

            {item.supportingText && (
                <div className="text-xs text-muted-foreground truncate">{item.supportingText}</div>
            )}
        </div>
    );
}

function Select({
    items,
    placeholder = "Select an option...",
    size = "sm",
    value,
    onValueChange,
    disabled,
    id,
    triggerClassName,
    contentClassName,
    itemClassName,
    renderItem,
    ...props
}: SelectProps) {
    // Fonction pour trouver l'item sélectionné dans une structure imbriquée
    const findSelectedItem = (
        items: SelectItemData[],
        targetValue: string
    ): SelectItemData | undefined => {
        for (const item of items) {
            if (item.type === "group" && item.items) {
                const found = findSelectedItem(item.items, targetValue);
                if (found) return found;
            } else if (item.type !== "separator") {
                // Pour les items normaux, comparer avec value ou id
                if ((item.value || item.id) === targetValue) {
                    return item;
                }
            }
        }
        return undefined;
    };

    const selectedItem = value ? findSelectedItem(items, value) : undefined;

    return (
        <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className={triggerClassName} size={size} id={id} {...props}>
                <SelectValue placeholder={placeholder} selectedItem={selectedItem} />
            </SelectTrigger>
            <SelectContent className={contentClassName}>
                {items.map(item => renderSelectItem(item, renderItem, itemClassName))}
            </SelectContent>
        </SelectRoot>
    );
}

interface SelectFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<SelectProps, "defaultValue" | "name"> {
    // isRequired?: boolean;
}

function SelectForm<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    isRequired,
    control,
    name,
    label,
    labelTooltip,
    description,
    ...selectProps
}: SelectFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => (
                <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                    disabled={field.disabled}
                    {...selectProps}
                />
            )}
        </FormFieldWrapper>
    );
}

function SelectRoot({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

interface SelectValueProps extends React.ComponentProps<typeof SelectPrimitive.Value> {
    selectedItem?: SelectItemData;
}

function SelectValue({ selectedItem, ...props }: SelectValueProps) {
    if (!selectedItem) {
        return <SelectPrimitive.Value data-slot="select-value" {...props} />;
    }

    return (
        <SelectPrimitive.Value data-slot="select-value" aria-label={selectedItem.id}>
            <div className="flex items-center gap-2 w-full min-w-0 text-left">
                {selectedItem.icon && (
                    <span className="flex-shrink-0 flex items-center justify-center">
                        {selectedItem.icon}
                    </span>
                )}
                {selectedItem.avatarUrl && (
                    <Image
                        src={selectedItem.avatarUrl}
                        alt={typeof selectedItem.label === "string" ? selectedItem.label : ""}
                        width={20}
                        height={20}
                        className="rounded-full flex-shrink-0"
                    />
                )}
                <span>{selectedItem.label}</span>
                {selectedItem.supportingText && (
                    <div className="text-xs text-muted-foreground truncate">
                        {selectedItem.supportingText}
                    </div>
                )}
            </div>
        </SelectPrimitive.Value>
    );
}

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "md";
};

function SelectTrigger({ className, size = "sm", children, ...props }: SelectTriggerProps) {
    const isInvalid = props["aria-invalid"] === true;
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                // Base styles
                "flex w-full h-max text-md text-primary items-center justify-between gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",
                // Focus states
                "focus:outline-none focus:ring-2 focus:ring-brand",
                // Disabled states
                "disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled",
                // Placeholder styles
                "data-[placeholder]:text-placeholder",
                // Size variants
                size === "sm" ? "py-2 px-3 " : "py-2.5 px-3.5",
                // Icon styles
                "[&>span]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-fg-quaternary",
                isInvalid && "ring-error_subtle focus:ring-2 focus:ring-error",
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="size-4 text-fg-quaternary" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = "popper",
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    // Base styles
                    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt",
                    // Animation styles
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    // Popper specific styles
                    position === "popper" &&
                        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                    className
                )}
                position={position}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        "p-1 flex flex-col gap-0.5",
                        position === "popper" &&
                            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn("px-2 py-1.5 text-xs text-tertiary font-medium", className)}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                // Base styles
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none text-primary",
                // Focus and selection states
                "focus:bg-primary_hover focus:text-primary",
                "data-[state=checked]:bg-active",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:text-disabled",
                // Icon styles
                "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-quaternary",
                className
            )}
            {...props}
        >
            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="size text-fg-brand-primary" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn("-mx-1 my-1 h-px bg-secondary", className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot="select-scroll-up-button"
            className={cn("flex cursor-default items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronUp className="size-4 text-fg-brand-primary" />
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot="select-scroll-down-button"
            className={cn("flex cursor-default items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronDown className="size-4 text-fg-brand-primary" />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectForm,
    SelectRoot,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    DefaultItemContent,
};
