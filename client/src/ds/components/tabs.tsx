"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
    Tabs as ShadcnTabs,
    TabsList as ShadcnTabsList,
    TabsTrigger as ShadcnTabsTrigger,
    TabsContent as ShadcnTabsContent,
} from "@/components/ui/tabs";

const tabsListVariants = cva(
    "inline-flex items-center justify-center rounded-md text-muted-foreground",
    {
        variants: {
            variant: {
                default: "bg-muted p-1",
                pills: "bg-transparent gap-2",
                underlined: "bg-transparent border-b border-border w-full justify-start gap-4",
                cards: "bg-transparent gap-2",
                minimal: "bg-transparent p-0 gap-4",
            },
            size: {
                default: "h-10",
                sm: "h-8",
                lg: "h-12",
            },
            fullWidth: {
                true: "w-full grid",
            },
            distribution: {
                default: "",
                equal: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
                start: "justify-start",
                center: "justify-center",
                end: "justify-end",
            },
        },
        compoundVariants: [
            {
                fullWidth: true,
                distribution: "equal",
                className: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            distribution: "default",
        },
    }
);

const tabsTriggerVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                pills: "rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                underlined:
                    "rounded-none px-2 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground",
                cards: "rounded-md px-4 py-2 border border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:text-foreground",
                minimal:
                    "rounded-none px-2 py-1 data-[state=active]:font-bold data-[state=active]:text-foreground",
            },
            size: {
                default: "text-sm",
                sm: "text-xs px-2 py-1",
                lg: "text-base px-4 py-2",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const tabsContentVariants = cva(
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "mt-2",
                pills: "mt-4",
                underlined: "mt-4",
                cards: "mt-4",
                minimal: "mt-2",
            },
            animation: {
                default: "",
                fade: "data-[state=active]:animate-in data-[state=active]:fade-in-50",
                slide: "data-[state=active]:animate-in data-[state=active]:slide-in-from-left-5",
                zoom: "data-[state=active]:animate-in data-[state=active]:zoom-in-95",
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
            animation: "default",
            padding: "default",
        },
    }
);

export interface TabsListProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnTabsList>,
        VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ElementRef<typeof ShadcnTabsList>, TabsListProps>(
    ({ className, variant, size, fullWidth, distribution, ...props }, ref) => (
        <ShadcnTabsList
            className={cn(tabsListVariants({ variant, size, fullWidth, distribution }), className)}
            ref={ref}
            {...props}
        />
    )
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnTabsTrigger>,
        VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof ShadcnTabsTrigger>, TabsTriggerProps>(
    ({ className, variant, size, fullWidth, ...props }, ref) => (
        <ShadcnTabsTrigger
            className={cn(tabsTriggerVariants({ variant, size, fullWidth }), className)}
            ref={ref}
            {...props}
        />
    )
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnTabsContent>,
        VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<React.ElementRef<typeof ShadcnTabsContent>, TabsContentProps>(
    ({ className, variant, animation, padding, ...props }, ref) => (
        <ShadcnTabsContent
            className={cn(tabsContentVariants({ variant, animation, padding }), className)}
            ref={ref}
            {...props}
        />
    )
);
TabsContent.displayName = "TabsContent";

// Type pour les onglets
export interface TabItem {
    value: string;
    label: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}

// Interface pour le composant SimplifiedTabs
export interface SimplifiedTabsProps {
    tabs: TabItem[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    // Props pour le style
    variant?: VariantProps<typeof tabsListVariants>["variant"];
    size?: VariantProps<typeof tabsListVariants>["size"];
    fullWidth?: boolean;
    distribution?: VariantProps<typeof tabsListVariants>["distribution"];
    animation?: VariantProps<typeof tabsContentVariants>["animation"];
    padding?: VariantProps<typeof tabsContentVariants>["padding"];
    // Classes personnalisées
    className?: string;
    tabsListClassName?: string;
    tabsTriggerClassName?: string;
    tabsContentClassName?: string;
}

// Composant SimplifiedTabs avec API simplifiée
export function SimplifiedTabs({
    tabs,
    defaultValue,
    value,
    onValueChange,
    variant,
    size,
    fullWidth,
    distribution,
    animation,
    padding,
    className,
    tabsListClassName,
    tabsTriggerClassName,
    tabsContentClassName,
}: SimplifiedTabsProps) {
    // Utiliser la première valeur d'onglet comme valeur par défaut si aucune n'est fournie
    const defaultTabValue = defaultValue || (tabs && tabs.length > 0 ? tabs[0].value : "");

    return (
        <ShadcnTabs
            defaultValue={defaultTabValue}
            value={value}
            onValueChange={onValueChange}
            className={className}
        >
            <TabsList
                variant={variant}
                size={size}
                fullWidth={fullWidth}
                distribution={distribution}
                className={tabsListClassName}
            >
                {tabs?.map(tab => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        disabled={tab.disabled}
                        variant={variant}
                        size={size}
                        fullWidth={fullWidth}
                        className={tabsTriggerClassName}
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs?.map(tab => (
                <TabsContent
                    key={tab.value}
                    value={tab.value}
                    variant={variant}
                    animation={animation}
                    padding={padding}
                    className={tabsContentClassName}
                >
                    {tab.content}
                </TabsContent>
            ))}
        </ShadcnTabs>
    );
}

// Export SimplifiedTabs as Tabs for the simplified API
export { SimplifiedTabs as Tabs };

// Export individual components for more flexibility
export { TabsList, TabsTrigger, TabsContent };

// Export the Shadcn components directly for compatibility
export { ShadcnTabs as RawTabs };
