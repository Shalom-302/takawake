"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { isReactComponent } from "@/lib/utils/is-react-component";
import { Separator } from "@/components/ui/separator";

const buttonGroupVariants = cva(
    "flex w-fit items-stretch [&>*]:cursor-pointer [&>*]:whitespace-nowrap [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
    {
        variants: {
            orientation: {
                horizontal:
                    "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
                vertical:
                    "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
            },
        },
        defaultVariants: {
            orientation: "horizontal",
        },
    }
);

export function ButtonGroup({
    className,
    orientation,
    ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
    return (
        <div
            role="group"
            data-slot="button-group"
            data-orientation={orientation}
            className={cn(buttonGroupVariants({ orientation }), className)}
            {...props}
        />
    );
}

export function ButtonGroupText({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"div"> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : "div";
    return (
        <Comp
            className={cn(
                "bg-active flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
                className
            )}
            {...props}
        />
    );
}

export function ButtonGroupSeparator({
    className,
    orientation = "vertical",
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="button-group-separator"
            orientation={orientation}
            className={cn(
                "bg-border relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
                className
            )}
            {...props}
        />
    );
}

type ButtonToggleGroupVariants = VariantProps<typeof buttonToggleGroupItemStyles>;
type IconType = React.ComponentType<{ className?: string }> | React.ReactNode;

type ButtonToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
    size?: ButtonToggleGroupVariants["size"];
    items: ButtonToggleGroupItemProps[];
};

export function ButtonToggleGroup({ className, items, ...props }: ButtonToggleGroupProps) {
    return (
        <ButtonToggleGroupRoot className={cn(className)} {...props}>
            {items.map(item => (
                <ButtonToggleGroupItem key={item.value} {...item} />
            ))}
        </ButtonToggleGroupRoot>
    );
}

const ButtonToggleGroupContext = React.createContext<Partial<ButtonToggleGroupProps>>({
    size: "md",
});

function ButtonToggleGroupRoot({
    className,
    children,
    size,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
    size?: ButtonToggleGroupVariants["size"];
}) {
    return (
        <ToggleGroupPrimitive.Root
            data-slot="button-toggle-group"
            className={cn(
                "inline-flex w-max -space-x-px rounded-lg shadow-xs relative z-0",
                className
            )}
            {...props}
        >
            <ButtonToggleGroupContext.Provider value={{ size }}>
                {children}
            </ButtonToggleGroupContext.Provider>
        </ToggleGroupPrimitive.Root>
    );
}

export interface ButtonToggleGroupItemProps
    extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {
    label: React.ReactNode;
    leftIcon?: IconType;
    rightIcon?: IconType;
    size?: ButtonToggleGroupVariants["size"];
}

const buttonToggleGroupItemStyles = cva(
    [
        "group inline-flex h-max cursor-pointer items-center font-semibold whitespace-nowrap shadow-skeumorphic ring-1 ring-primary outline-brand transition duration-100 ease-linear ring-inset focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed [&_svg]:size-5",
        "bg-primary text-secondary hover:bg-primary_hover hover:text-secondary_hover data-[state=on]:bg-active data-[state=on]:text-secondary_hover data-[state=on]:disabled:bg-disabled_subtle disabled:bg-primary disabled:text-disabled",
    ],
    {
        variants: {
            size: {
                sm: "gap-1.5 px-3.5 py-2 text-sm",
                md: "gap-1.5 px-4 py-2.5 text-sm",
                lg: "gap-2 px-4.5 py-2.5 text-md",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

function ButtonToggleGroupItem({
    className,
    label,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
}: ButtonToggleGroupItemProps) {
    const { size } = React.useContext(ButtonToggleGroupContext);
    return (
        <ToggleGroupPrimitive.Item
            className={cn(
                buttonToggleGroupItemStyles({ size }),
                "first:rounded-l-lg last:rounded-r-lg data-[state=on]:relative data-[state=on]:z-10",
                className
            )}
            {...props}
        >
            {isReactComponent(LeftIcon) && <LeftIcon className="shrink-0" />}
            {React.isValidElement(LeftIcon) && LeftIcon}

            {label}

            {isReactComponent(RightIcon) && <RightIcon className="shrink-0" />}
            {React.isValidElement(RightIcon) && RightIcon}
        </ToggleGroupPrimitive.Item>
    );
}

export const ButtonToggleGroupCustom = {
    Root: ButtonToggleGroupRoot,
    Item: ButtonToggleGroupItem,
};
