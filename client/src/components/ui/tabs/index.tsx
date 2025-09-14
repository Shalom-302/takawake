"use client";

import * as React from "react";
import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Badge, type BadgeVariants } from "../badges";

// === TYPES ===
type Orientation = "horizontal" | "vertical";
type HorizontalTypes =
    | "button-brand"
    | "button-gray"
    | "button-border"
    | "button-minimal"
    | "underline";
type VerticalTypes = "button-brand" | "button-gray" | "button-border" | "button-minimal" | "line";
type TabType = HorizontalTypes | VerticalTypes;

interface TabItem {
    value: string;
    label: ReactNode;
    badge?: number | string;
    content: ReactNode;
}

// === COMPONENT VARIANTS ===
const tabVariants = cva(
    "z-10 flex h-max cursor-pointer items-center justify-center gap-2 rounded-md whitespace-nowrap text-quaternary transition duration-100 ease-linear outline-focus-ring data-[orientation=vertical]:justify-start",
    {
        variants: {
            type: {
                "button-brand":
                    "data-[state=active]:bg-brand-primary_alt data-[state=active]:text-brand-secondary hover:bg-brand-primary_alt hover:text-brand-secondary focus-visible:outline-2 focus-visible:-outline-offset-2",
                "button-gray":
                    "hover:bg-primary_hover hover:text-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 data-[state=active]:bg-active data-[state=active]:text-secondary",
                "button-border":
                    "hover:bg-primary_alt hover:text-secondary hover:shadow-sm focus-visible:outline-2 focus-visible:-outline-offset-2 data-[state=active]:bg-primary_alt data-[state=active]:text-secondary data-[state=active]:shadow-sm",
                "button-minimal":
                    "rounded-lg hover:text-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 data-[state=active]:bg-primary_alt data-[state=active]:text-secondary data-[state=active]:shadow-xs data-[state=active]:ring-1 data-[state=active]:ring-primary data-[state=active]:ring-inset",
                underline:
                    "rounded-none border-b-2 border-transparent hover:border-fg-brand-primary_alt hover:text-brand-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 data-[state=active]:border-fg-brand-primary_alt data-[state=active]:text-brand-secondary",
                line: "rounded-none border-l-2 border-transparent hover:border-fg-brand-primary_alt hover:text-brand-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 data-[state=active]:border-fg-brand-primary_alt data-[state=active]:text-brand-secondary",
            },
            size: {
                sm: "",
                md: "",
            },
            fullWidth: {
                true: "w-full flex-1",
                false: "",
            },
        },
        compoundVariants: [
            { type: "button-brand", size: "sm", class: "text-sm font-semibold py-2 px-3" },
            { type: "button-gray", size: "sm", class: "text-sm font-semibold py-2 px-3" },
            { type: "button-border", size: "sm", class: "text-sm font-semibold py-2 px-3" },
            { type: "button-minimal", size: "sm", class: "text-sm font-semibold py-2 px-3" },
            { type: "underline", size: "sm", class: "text-sm font-semibold px-1 pb-2.5 pt-0" },
            { type: "line", size: "sm", class: "text-sm font-semibold pl-2.5 pr-3 py-0.5" },
            { type: "button-brand", size: "md", class: "text-md font-semibold py-2.5 px-3" },
            { type: "button-gray", size: "md", class: "text-md font-semibold py-2.5 px-3" },
            { type: "button-border", size: "md", class: "text-md font-semibold py-2.5 px-3" },
            { type: "button-minimal", size: "md", class: "text-md font-semibold py-2.5 px-3" },
            { type: "underline", size: "md", class: "text-md font-semibold px-1 pb-2.5 pt-0" },
            { type: "line", size: "md", class: "text-md font-semibold pr-3.5 pl-3 py-1" },
        ],
        defaultVariants: {
            type: "button-brand",
            size: "sm",
            fullWidth: false,
        },
    }
);

const tabListVariants = cva("group flex", {
    variants: {
        type: {
            "button-brand": "gap-1",
            "button-gray": "gap-1",
            "button-border":
                "gap-1 rounded-[10px] bg-secondary_alt p-1 ring-1 ring-secondary ring-inset",
            "button-minimal":
                "gap-0.5 rounded-lg bg-secondary_alt ring-1 ring-inset ring-secondary",
            underline:
                "gap-3 relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border-secondary",
            line: "gap-2",
        },
        size: {
            sm: "",
            md: "",
        },
        orientation: {
            horizontal: "",
            vertical: "w-max flex-col",
        },
        fullWidth: {
            true: "",
            false: "",
        },
    },
    compoundVariants: [
        { type: "button-border", size: "md", class: "rounded-xl p-1.5" },
        { type: "underline", fullWidth: true, class: "w-full gap-4" },
    ],
    defaultVariants: {
        type: "button-brand",
        size: "sm",
        orientation: "horizontal",
        fullWidth: false,
    },
});

const getBadgeColor = (
    type: TabType,
    isActive: boolean,
    isHovered: boolean
): BadgeVariants["color"] => {
    const colorMap: Record<TabType, BadgeVariants["color"]> = {
        "button-brand": isActive || isHovered ? "brand" : "gray",
        "button-gray": "gray",
        "button-border": "gray",
        "button-minimal": "gray",
        underline: isActive || isHovered ? "brand" : "gray",
        line: isActive || isHovered ? "brand" : "gray",
    };
    return colorMap[type] ?? "gray";
};

interface TabsContextValue {
    size: "sm" | "md";
    type: TabType;
    orientation: Orientation;
    fullWidth: boolean;
    currentValue?: string;
}

const TabsContext = React.createContext<TabsContextValue>({
    size: "sm",
    type: "button-brand",
    orientation: "horizontal",
    fullWidth: false,
});

interface TabsRootProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
    size: "sm" | "md";
    type: TabType;
    orientation: Orientation;
    fullWidth: boolean;
}

function TabsRoot({
    className,
    children,
    size,
    type,
    orientation,
    fullWidth,
    value,
    defaultValue,
    onValueChange,
    ...props
}: TabsRootProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;

    const handleValueChange = (newValue: string) => {
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ size, type, orientation, fullWidth, currentValue }}>
            <TabsPrimitive.Root
                orientation={orientation}
                value={currentValue}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                className={cn("flex w-full flex-col", className)}
                {...props}
            >
                {children}
            </TabsPrimitive.Root>
        </TabsContext.Provider>
    );
}

function TabsList({
    className,
    children,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    const { size, type, orientation, fullWidth } = React.useContext(TabsContext);
    return (
        <TabsPrimitive.List
            className={cn(tabListVariants({ type, size, orientation, fullWidth }), className)}
            {...props}
        >
            {children}
        </TabsPrimitive.List>
    );
}

interface TabsTriggerProps
    extends Omit<React.ComponentProps<typeof TabsPrimitive.Trigger>, "children"> {
    label?: ReactNode;
    badge?: number | string;
    children?: ReactNode;
}

function TabsTrigger({ label, badge, children, className, value, ...props }: TabsTriggerProps) {
    const { size, type, fullWidth, currentValue } = React.useContext(TabsContext);
    const [isHovered, setIsHovered] = React.useState(false);

    // Déterminer si ce trigger est actif
    const isActive = currentValue === value;

    return (
        <TabsPrimitive.Trigger
            value={value}
            className={cn(tabVariants({ type, size, fullWidth }), className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            {children || label}
            {badge && (
                <Badge
                    size={size}
                    variant="pill-color"
                    color={getBadgeColor(type, isActive, isHovered)!}
                    className={cn(
                        "hidden transition-inherit-all md:flex",
                        size === "sm" && "-my-px"
                    )}
                >
                    {badge}
                </Badge>
            )}
        </TabsPrimitive.Trigger>
    );
}

function TabsContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            className={cn(
                "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                className
            )}
            {...props}
        >
            {children}
        </TabsPrimitive.Content>
    );
}

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
    items: TabItem[];
    size?: "sm" | "md";
    type?: TabType;
    orientation?: Orientation;
    fullWidth?: boolean;
    listClassName?: string;
    contentClassName?: string;
}

const Tabs = ({
    items,
    size = "sm",
    type = "button-brand",
    orientation = "horizontal",
    fullWidth = false,
    className,
    listClassName,
    contentClassName,
    ...props
}: TabsProps) => {
    return (
        <TabsRoot
            size={size}
            type={type}
            orientation={orientation}
            fullWidth={fullWidth}
            className={className}
            {...props}
        >
            <TabsList className={listClassName}>
                {items.map(item => (
                    <TabsTrigger
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        badge={item.badge}
                    />
                ))}
            </TabsList>

            {items.map(item => (
                <TabsContent key={item.value} value={item.value} className={contentClassName}>
                    {item.content}
                </TabsContent>
            ))}
        </TabsRoot>
    );
};

export {
    Tabs,
    TabsRoot,
    TabsList,
    TabsTrigger,
    TabsContent,
    tabVariants,
    tabListVariants,
    type TabItem,
};
