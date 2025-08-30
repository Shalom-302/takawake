"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { XClose } from "@untitled-ui/icons-react";
import { Button } from "../buttons";

export type AlertVariants = "default" | "destructive";
export type AlertSizes = "floating" | "with-full";
interface AlertProps extends React.ComponentProps<"div"> {
    icon: React.ReactElement;
    title: string;
    description?: React.ReactNode;
    variant?: AlertVariants;
    size?: AlertSizes;
    firstActionLabel?: string;
    firstActionClick?: () => void;
    secondActionLabel?: string;
    secondActionClick?: () => void;
    dismissible?: boolean;
}

function Alert({
    className,
    variant = "default",
    size = "floating",
    title,
    description,
    icon,
    firstActionLabel,
    firstActionClick,
    secondActionLabel,
    secondActionClick,
    dismissible = false,
    ...props
}: AlertProps) {
    const [visible, setVisible] = React.useState(true);
    function handleClose() {
        setVisible(false);
    }

    if (!visible) return null;
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(
                "relative bg-primary_alt p-4 rounded-xl border border-primary shadow-xs text-sm flex flex-col md:flex-row items-start gap-y-4 md:gap-x-4 [&_svg]:size-4",
                size === "floating" && "max-w-[calc(100vw-8rem)]",
                size === "with-full" && "w-full",
                className
            )}
            {...props}
        >
            <AlertIcon variant={variant} icon={icon} />
            <div className="flex-1">
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{description}</AlertDescription>
                {(firstActionLabel || secondActionLabel) && (
                    <Actions
                        size={size}
                        firstActionLabel={firstActionLabel}
                        secondActionLabel={secondActionLabel}
                        firstActionClick={firstActionClick}
                        secondActionClick={secondActionClick}
                    />
                )}
            </div>

            {dismissible && (
                <Button
                    aria-label="Close alert"
                    variant={"tertiary"}
                    onClick={handleClose}
                    className="absolute right-2 top-2 rounded-lg inline-flex justify-center items-center text-fg-quaternary"
                    iconLeft={<XClose />}
                />
            )}
        </div>
    );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-title"
            className={cn(
                "line-clamp-1 min-h-4 text-secondary font-semibold tracking-tight ",
                className
            )}
            {...props}
        />
    );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                "text-tertiary grid justify-items-start gap-1 [&_p]:leading-relaxed",
                className
            )}
            {...props}
        />
    );
}

function AlertIcon({ variant, icon: Icon }: { variant: AlertVariants; icon: React.ReactElement }) {
    if (!Icon) return null;

    switch (variant) {
        case "default":
            return (
                <div
                    data-slot="alert-icon"
                    className="size-10 flex items-center justify-center p-2.5 border border-primary bg-primary rounded-md shadow-xs-skeuomorphic [&>svg]:text-fg-secondary"
                >
                    {React.isValidElement(Icon) && Icon}
                </div>
            );

        case "destructive":
            return (
                <div
                    data-slot="alert-icon"
                    className="size-[38px] flex items-center justify-center rounded-md bg-destructive/10 text-destructive"
                >
                    {React.isValidElement(Icon) && Icon}
                </div>
            );
    }
}

function Actions({
    size,
    firstActionLabel,
    firstActionClick,
    secondActionLabel,
    secondActionClick,
}: {
    size: AlertSizes;
    firstActionLabel?: string;
    firstActionClick?: () => void;
    secondActionLabel?: string;
    secondActionClick?: () => void;
}) {
    switch (size) {
        case "floating":
            return (
                <div data-slot="alert-actions" className="flex items-start gap-3 mt-3">
                    {firstActionLabel && (
                        <Button variant={"link-gray"} onClick={firstActionClick} className="">
                            {firstActionLabel}
                        </Button>
                    )}
                    {secondActionLabel && (
                        <Button variant={"link-color"} onClick={secondActionClick} className="">
                            {secondActionLabel}
                        </Button>
                    )}
                </div>
            );

        case "with-full":
            return (
                <div data-slot="alert-actions" className="flex items-center gap-2 mt-3">
                    <Button variant={"secondary"}>{firstActionLabel}</Button>
                    <Button>{secondActionLabel}</Button>
                </div>
            );
    }
}

export { Alert, AlertTitle, AlertDescription, Actions };
