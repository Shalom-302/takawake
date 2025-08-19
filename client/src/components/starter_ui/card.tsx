import { cn } from "@/lib/utils/cn";
import * as React from "react";

type CardProps = {
    className?: string;
} & React.ComponentPropsWithRef<"div">;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, className, ...props }) => {
        return (
            <>
                <div
                    className={cn(
                        "border border-primary/10 bg-white rounded-xl shadow-xs py-4 sm:py-5 px-4 sm:px-6",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </>
        );
    }
);
Card.displayName = "Card";

export { Card };
