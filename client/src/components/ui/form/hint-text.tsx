import { cn } from "@/lib/utils/cn";
import * as React from "react";

interface HintTextProps extends React.ComponentProps<"p"> {
    isInvalid?: boolean;
}

export function HintText({ isInvalid, className, ...props }: HintTextProps) {
    return (
        <p
            data-slot={"hint"}
            className={cn(
                "text-sm text-tertiary",
                isInvalid && "text-error-primary",
                "group-invalid:text-error-primary",
                className
            )}
            {...props}
        />
    );
}
