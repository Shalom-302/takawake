"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { isReactComponent } from "@/lib/utils/is-react-component";

const buttonGroupItemStyles = cva(
    [
        "group inline-flex h-max cursor-pointer items-center font-semibold whitespace-nowrap shadow-skeumorphic ring-1 ring-primary outline-brand transition duration-100 ease-linear ring-inset focus:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed [&_svg]:size-5",
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

type ButtonGroupVariants = VariantProps<typeof buttonGroupItemStyles>;
type IconType = React.ComponentType<{ className?: string }> | React.ReactNode;

type ButtonGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
    size?: ButtonGroupVariants["size"];
    items?: ButtonGroupItemProps[];
};

// === Context ===
const ButtonGroupContext = React.createContext<Partial<ButtonGroupVariants>>({});

// === Group ===
export function ButtonGroup({ className, size, items, children, ...props }: ButtonGroupProps) {
    const content = items
        ? items.map(item => <ButtonGroupItem key={item.value} {...item} />)
        : children;

    return (
        <ToggleGroupPrimitive.Root
            data-slot="button-group"
            className={cn(
                "inline-flex w-max -space-x-px rounded-lg shadow-xs relative z-0",
                className
            )}
            {...props}
        >
            <ButtonGroupContext.Provider value={{ size }}>{content}</ButtonGroupContext.Provider>
        </ToggleGroupPrimitive.Root>
    );
}

export interface ButtonGroupItemProps
    extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {
    label: React.ReactNode;
    leftIcon?: IconType;
    rightIcon?: IconType;
}

export function ButtonGroupItem({
    className,
    label,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
}: ButtonGroupItemProps) {
    const context = React.useContext(ButtonGroupContext);

    return (
        <ToggleGroupPrimitive.Item
            className={cn(
                buttonGroupItemStyles({ size: context.size }),
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
