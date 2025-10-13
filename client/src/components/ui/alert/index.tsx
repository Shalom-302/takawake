"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { CheckCircle, InfoCircle, XClose } from "@untitled-ui/icons-react";
import { Button } from "../button";

export type AlertVariants = "default" | "brand" | "gray" | "error" | "warning" | "success";
export type AlertSizes = "floating" | "with-full";
interface AlertProps extends React.ComponentProps<"div"> {
    icon?: React.ReactElement;
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
                "relative bg-primary_alt p-4 rounded-xl border-primary text-sm flex flex-col md:flex-row  gap-y-4 md:gap-x-4 [&_svg]:size-5",
                size === "floating" &&
                    "items-start max-w-[calc(100%-4rem)] max-w-[calc(100%-8rem)] border shadow-xs",
                size === "with-full" &&
                    "w-full items-center border-t md:border-t-0 md:border-b rounded-none ",
                className
            )}
            {...props}
        >
            <AlertIcon variant={variant} icon={icon} />
            <div
                className={`${size === "floating" && "flex-1"} ${size === "with-full" && "flex flex-1 items-center justify-between"} `}
            >
                <div className={` ${size === "with-full" && "flex items-center gap-[6px]"}`}>
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>{description}</AlertDescription>
                </div>
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
                    className={`${size === "floating" && "absolute right-2 top-2"} rounded-lg inline-flex justify-center items-center text-fg-quaternary`}
                    leftIcon={<XClose />}
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

function AlertIcon({ variant, icon: Icon }: { variant: AlertVariants; icon?: React.ReactElement }) {
    switch (variant) {
        case "default":
            if (!Icon)
                return (
                    <div
                        data-slot="alert-icon"
                        className="size-10 flex items-center justify-center p-2.5 border border-primary bg-primary rounded-md shadow-xs-skeuomorphic [&>svg]:text-fg-secondary"
                    >
                        <InfoCircle />
                    </div>
                );
            return (
                <div
                    data-slot="alert-icon"
                    className="size-10 flex items-center justify-center p-2.5 border border-primary bg-primary rounded-md shadow-xs-skeuomorphic [&>svg]:text-fg-secondary"
                >
                    {React.isValidElement(Icon) && Icon}
                </div>
            );
        case "brand":
            return (
                <>
                    <div data-slot="alert-icon" className="text-fg-brand-primary ">
                        <InfoCircle />
                    </div>
                    <div className="size-[38px] border-2 border-fg-brand-primary/10 rounded-3xl absolute top-[7px] left-[7px]" />
                    <div className="size-[28px] border-2 border-fg-brand-primary/30 rounded-3xl absolute top-[12px] left-[12px]" />
                </>
            );
        case "gray":
            return (
                <>
                    <div data-slot="alert-icon" className="text-fg-tertiary ">
                        <InfoCircle />
                    </div>
                    <div className="size-[38px] border-2 border-fg-tertiary/10 rounded-3xl absolute top-[7px] left-[7px]" />
                    <div className="size-[28px] border-2 border-fg-tertiary/30 rounded-3xl absolute top-[12px] left-[12px]" />
                </>
            );
        case "error":
            return (
                <>
                    <div data-slot="alert-icon" className="text-fg-error-primary ">
                        <InfoCircle />
                    </div>
                    <div className="size-[38px] border-2 border-fg-error-primary/10 rounded-3xl absolute top-[7px] left-[7px]" />
                    <div className="size-[28px] border-2 border-fg-error-primary/30 rounded-3xl absolute top-[12px] left-[12px]" />
                </>
            );
        case "warning":
            return (
                <>
                    <div data-slot="alert-icon" className="text-fg-warning-primary ">
                        <InfoCircle />
                    </div>
                    <div className="size-[38px] border-2 border-fg-warning-primary/10 rounded-3xl absolute top-[7px] left-[7px]" />
                    <div className="size-[28px] border-2 border-fg-warning-primary/30 rounded-3xl absolute top-[12px] left-[12px]" />
                </>
            );
        case "success":
            return (
                <>
                    <div data-slot="alert-icon" className="text-fg-success-primary ">
                        <CheckCircle />
                    </div>
                    <div className="size-[38px] border-2 border-fg-success-primary/10 rounded-3xl absolute top-[7px] left-[7px]" />
                    <div className="size-[28px] border-2 border-fg-success-primary/30 rounded-3xl absolute top-[12px] left-[12px]" />
                </>
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
                <div data-slot="alert-actions" className="flex items-center gap-2 mt-3 md:mt-0">
                    <Button variant={"secondary"}>{firstActionLabel}</Button>
                    <Button>{secondActionLabel}</Button>
                </div>
            );
    }
}

export { Alert, AlertTitle, AlertDescription, Actions };
