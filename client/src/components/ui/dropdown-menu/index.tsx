"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle, DotsVertical } from "@untitled-ui/icons-react";

import { cn } from "@/lib/utils/cn";

// Types pour les éléments du menu
interface DropdownMenuItemData {
    id: string;
    type?: "item" | "checkbox" | "radio" | "separator" | "label" | "sub";
    label?: React.ReactNode;
    shortcut?: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "default" | "destructive";
    checked?: boolean;
    value?: string;
    inset?: boolean;
    href?: string;
    asChild?: boolean;
    // Pour les sous-menus
    items?: DropdownMenuItemData[];
}

interface DropdownMenuGroupData {
    id: string;
    label?: string;
    items: DropdownMenuItemData[];
}

interface DropdownMenuNewProps
    extends React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
        Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Content>, "children"> {
    trigger: React.ReactNode;
    items?: DropdownMenuItemData[];
    groups?: DropdownMenuGroupData[];
    contentLabel?: string;
    contentClassName?: string;
    itemClassName?: string;
    radioGroupValue?: string;
    onRadioValueChange?: (value: string) => void;
}

// Composant pour rendre un élément individuel
function renderMenuItem(
    item: DropdownMenuItemData,
    radioGroupValue?: string,
    onRadioValueChange?: (value: string) => void
): React.ReactNode {
    const key = item.id;

    switch (item.type) {
        case "separator":
            return <DropdownMenuSeparator key={key} />;

        case "label":
            return (
                <DropdownMenuLabel key={key} inset={item.inset}>
                    {item.label}
                </DropdownMenuLabel>
            );

        case "checkbox":
            return (
                <DropdownMenuCheckboxItem
                    key={key}
                    checked={item.checked}
                    onCheckedChange={item.onClick}
                    disabled={item.disabled}
                >
                    {item.label}
                </DropdownMenuCheckboxItem>
            );

        case "radio":
            return (
                <DropdownMenuRadioItem
                    key={key}
                    value={item.value || item.id}
                    disabled={item.disabled}
                >
                    {item.label}
                </DropdownMenuRadioItem>
            );

        case "sub":
            return (
                <DropdownMenuSub key={key}>
                    <DropdownMenuSubTrigger inset={item.inset} disabled={item.disabled}>
                        {item.label}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {item.items?.map(subItem =>
                                renderMenuItem(subItem, radioGroupValue, onRadioValueChange)
                            )}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            );

        case "item":
        default:
            const ItemComponent = (
                <DropdownMenuItem
                    key={key}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    variant={item.variant}
                    inset={item.inset}
                    asChild={item.asChild || !!item.href}
                >
                    {item.href ? (
                        <a href={item.href}>
                            {item.label}
                            {item.shortcut && (
                                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                            )}
                        </a>
                    ) : (
                        <>
                            {item.label}
                            {item.shortcut && (
                                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                            )}
                        </>
                    )}
                </DropdownMenuItem>
            );
            return ItemComponent;
    }
}

export function DropdownMenu({
    // Props du Root
    defaultOpen,
    open,
    onOpenChange,
    modal,
    // Props du Content
    side,
    sideOffset = 4,
    align,
    alignOffset,
    contentClassName,
    // Props spécifiques
    trigger,
    items = [],
    groups = [],
    contentLabel,
    radioGroupValue,
    onRadioValueChange,
    ...props
}: DropdownMenuNewProps) {
    // Détermine si on a des éléments radio pour wrapper dans RadioGroup
    const hasRadioItems = [...items, ...groups.flatMap(g => g.items)].some(
        item => item.type === "radio"
    );

    return (
        <DropdownMenuRoot
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={onOpenChange}
            modal={modal}
            {...props}
        >
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent
                side={side}
                sideOffset={sideOffset}
                align={align}
                alignOffset={alignOffset}
                className={contentClassName}
            >
                {contentLabel && <DropdownMenuLabel>{contentLabel}</DropdownMenuLabel>}

                {/* Rendu des éléments directs */}
                {items.length > 0 &&
                    (hasRadioItems && radioGroupValue !== undefined ? (
                        <DropdownMenuRadioGroup
                            value={radioGroupValue}
                            onValueChange={onRadioValueChange}
                        >
                            {items.map(item =>
                                renderMenuItem(item, radioGroupValue, onRadioValueChange)
                            )}
                        </DropdownMenuRadioGroup>
                    ) : (
                        items.map(item => renderMenuItem(item, radioGroupValue, onRadioValueChange))
                    ))}

                {/* Rendu des groupes */}
                {groups.map((group, groupIndex) => {
                    const groupHasRadioItems = group.items.some(item => item.type === "radio");

                    return (
                        <React.Fragment key={group.id}>
                            {(groupIndex > 0 || items.length > 0) && <DropdownMenuSeparator />}
                            <DropdownMenuGroup>
                                {group.label && (
                                    <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                                )}
                                {groupHasRadioItems && radioGroupValue !== undefined ? (
                                    <DropdownMenuRadioGroup
                                        value={radioGroupValue}
                                        onValueChange={onRadioValueChange}
                                    >
                                        {group.items.map(item =>
                                            renderMenuItem(
                                                item,
                                                radioGroupValue,
                                                onRadioValueChange
                                            )
                                        )}
                                    </DropdownMenuRadioGroup>
                                ) : (
                                    group.items.map(item =>
                                        renderMenuItem(item, radioGroupValue, onRadioValueChange)
                                    )
                                )}
                            </DropdownMenuGroup>
                        </React.Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenuRoot>
    );
}

// Réexport des composants de base pour les cas où on veut plus de contrôle
function DropdownMenuRoot({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
    return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
    return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
    return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                data-slot="dropdown-menu-content"
                className={cn(
                    "max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] z-50 py-1 px-1.5 select-none outline-hidden  origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-primary shadow-xl ring-1 ring-secondary_alt will-change-transform border-0",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    className
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
    return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

interface DropdownMenuItemProps extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
    inset?: boolean;
    variant?: "default" | "destructive";
}

function DropdownMenuItem({
    className,
    inset,
    variant = "default",
    ...props
}: DropdownMenuItemProps) {
    return (
        <DropdownMenuPrimitive.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "text-secondary text-sm font-semibold focus:bg-primary_hover focus:text-secondary_hover px-2.5 py-2 relative flex items-center cursor-default rounded-md outline-hidden select-none data-[inset]:pl-8",
                "[&_svg:not([class*='text-'])]:text-fg-quaternary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[2.25px] [&_svg:not([class*='size-'])]:size-4",
                "data-[disabled]:text-disabled data-[disabled]:pointer-events-none data-[disabled]:[&_svg:not([class*='text-'])]:text-fg-disabled",
                "data-[variant=destructive]:text-error-400 data-[variant=destructive]:focus:bg-error-50 data-[variant=destructive]:focus:text-error-600 data-[variant=destructive]:*:[svg]:!text-error-500 ",
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            checked={checked}
            className={cn(
                "relative flex items-center rounded-md px-2.5 py-2 pl-8 text-sm font-semibold text-secondary",
                "cursor-default select-none outline-hidden",
                "focus:bg-primary_hover focus:text-secondary_hover",
                "data-[disabled]:text-disabled data-[disabled]:pointer-events-none",
                "data-[disabled]:[&_svg:not([class*='text-'])]:text-fg-disabled",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Check className="size-4 text-fg-quaternary" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

function DropdownMenuRadioGroup({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            data-slot="dropdown-menu-radio-item"
            className={cn(
                "relative flex items-center rounded-md px-2.5 py-2 pl-8 text-sm font-semibold text-secondary",
                "cursor-default select-none outline-hidden",
                "focus:bg-primary_hover focus:text-secondary_hover",
                "data-[disabled]:text-disabled data-[disabled]:pointer-events-none",
                "data-[disabled]:[&_svg:not([class*='text-'])]:text-fg-disabled",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Circle className="size-2 fill-current text-fg-quaternary" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.Label
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn(
                "px-4 py-2 text-sm font-medium text-secondary",
                inset && "pl-8",
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuSeparator({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            data-slot="dropdown-menu-separator"
            className={cn("my-1 h-px w-full bg-border-secondary", className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                "ml-auto text-xs tracking-widest text-quaternary data-[disabled]:text-disabled",
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
    return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "relative flex items-center rounded-md px-2.5 py-2 text-sm font-semibold text-secondary",
                "cursor-default select-none outline-hidden",
                "focus:bg-primary_hover focus:text-secondary_hover",
                "data-[inset]:pl-8",
                className
            )}
            {...props}
        >
            <span className="grow">{children}</span>
            <ChevronRight className="ml-auto size-4 text-fg-quaternary" />
        </DropdownMenuPrimitive.SubTrigger>
    );
}

function DropdownMenuSubContent({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
    return (
        <DropdownMenuPrimitive.SubContent
            data-slot="dropdown-menu-sub-content"
            className={cn(
                "max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] z-50 py-1 px-1.5 select-none outline-hidden  origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt border-0",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props}
        />
    );
}

export function DropdownDotsButton({ className, ...props }: React.ComponentProps<"button">) {
    return (
        <button
            aria-label="Open menu"
            className={cn(
                "cursor-pointer rounded-md text-fg-quaternary hover:text-fg-quaternary_hover ring-focus-ring transition duration-100 ease-linear",
                "focus-visible:text-fg-quaternary_hover focus-visible:ring-2 focus-visible:ring-offset-2 ",
                className
            )}
            {...props}
        >
            <DotsVertical className="size-5 transition-inherit-all" />
        </button>
    );
}

export const DropdownMenuCustom = {
    Root: DropdownMenuRoot,
    Portal: DropdownMenuPortal,
    Trigger: DropdownMenuTrigger,
    Content: DropdownMenuContent,
    Group: DropdownMenuGroup,
    Item: DropdownMenuItem,
    CheckboxItem: DropdownMenuCheckboxItem,
    RadioGroup: DropdownMenuRadioGroup,
    RadioItem: DropdownMenuRadioItem,
    Label: DropdownMenuLabel,
    Separator: DropdownMenuSeparator,
    Shortcut: DropdownMenuShortcut,
    Sub: DropdownMenuSub,
    SubTrigger: DropdownMenuSubTrigger,
    SubContent: DropdownMenuSubContent,
};
