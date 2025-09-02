// "use client";

// import * as React from "react";
// import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// import { cn } from "@/lib/utils/cn";

// function TooltipProvider({
//     delayDuration = 0,
//     ...props
// }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
//     return (
//         <TooltipPrimitive.Provider
//             data-slot="tooltip-provider"
//             delayDuration={delayDuration}
//             {...props}
//         />
//     );
// }

// function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
//     return (
//         <TooltipProvider>
//             <TooltipPrimitive.Root data-slot="tooltip" {...props} />
//         </TooltipProvider>
//     );
// }

// function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
//     return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
// }

// function TooltipContent({
//     className,
//     sideOffset = 0,
//     children,
//     ...props
// }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
//     return (
//         <TooltipPrimitive.Portal>
//             <TooltipPrimitive.Content
//                 data-slot="tooltip-content"
//                 sideOffset={sideOffset}
//                 className={cn(
//                     "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
//                     className
//                 )}
//                 {...props}
//             >
//                 {children}
//                 <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
//             </TooltipPrimitive.Content>
//         </TooltipPrimitive.Portal>
//     );
// }

// export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

"use client";

import type { ReactNode } from "react";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

// Variantes CVA pour le Content
const tooltipContentVariants = cva(
    [
        "z-50 overflow-hidden rounded-lg shadow-lg will-change-transform",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    ],
    {
        variants: {
            variant: {
                default: "bg-primary-solid text-white",
                secondary: "bg-secondary text-secondary-foreground",
                outline: "bg-background text-foreground border border-border",
            },
            size: {
                sm: "px-2 py-1 text-xs",
                md: "px-3 py-2 text-sm",
                lg: "px-4 py-3 text-base",
            },
            maxWidth: {
                xs: "max-w-xs",
                sm: "max-w-sm",
                md: "max-w-md",
                lg: "max-w-lg",
                none: "max-w-none",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
            maxWidth: "xs",
        },
    }
);

// Variantes CVA pour l'Arrow
const tooltipArrowVariants = cva("", {
    variants: {
        variant: {
            default: "fill-primary-solid",
            secondary: "fill-secondary",
            outline: "fill-background stroke-border",
        },
        size: {
            sm: "size-2",
            md: "size-2.5",
            lg: "size-3",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "sm",
    },
});

// Provider avec configuration
type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider>;

function TooltipProvider({ delayDuration = 300, children, ...props }: TooltipProviderProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
            {children}
        </TooltipPrimitive.Provider>
    );
}

// Interface pour le tooltip complet
interface TooltipProps
    extends React.ComponentProps<typeof TooltipPrimitive.Root>,
        VariantProps<typeof tooltipContentVariants>,
        VariantProps<typeof tooltipArrowVariants> {
    trigger: ReactNode;
    /** Content to display in the tooltip */
    content: ReactNode;
    /** Side where the tooltip should appear */
    side?: "top" | "right" | "bottom" | "left";
    /** Alignment of the tooltip relative to the trigger */
    align?: "start" | "center" | "end";
    /** Offset from the trigger element */
    sideOffset?: number;
    /** Offset along the alignment axis */
    alignOffset?: number;
    /** Whether to show the arrow */
    arrow?: boolean;
    /** Custom class for the content */
    contentClassName?: string;
    /** Custom class for the arrow */
    arrowClassName?: string;
    /** Delay before showing tooltip */
    delayDuration?: number;
}

export const Tooltip = ({
    trigger,
    content,
    side = "top",
    align = "center",
    sideOffset = 6,
    alignOffset,
    arrow = false,
    variant = "default",
    size = "sm",
    maxWidth = "xs",
    contentClassName,
    arrowClassName,
    delayDuration = 300,
    open,
    onOpenChange,
    defaultOpen,
    ...props
}: TooltipProps) => {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipPrimitive.Root
                open={open}
                onOpenChange={onOpenChange}
                defaultOpen={defaultOpen}
                {...props}
            >
                <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        alignOffset={alignOffset}
                        className={tooltipContentVariants({
                            variant,
                            size,
                            maxWidth,
                            className: contentClassName,
                        })}
                    >
                        {content}

                        {arrow && (
                            <TooltipPrimitive.Arrow
                                className={tooltipArrowVariants({
                                    variant,
                                    size,
                                    className: arrowClassName,
                                })}
                            />
                        )}
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipProvider>
    );
};

// Tooltip avec title et description (votre cas d'usage original)
// interface TooltipWithDescriptionProps extends TooltipProps {
//     /** Title of the tooltip */
//     title: ReactNode;
//     /** Optional description */
//     description?: ReactNode;
// }

// export const TooltipWithDescription = ({
//     title,
//     description,
//     ...props
// }: TooltipWithDescriptionProps) => {
//     const content = (
//         <div className="flex flex-col gap-1">
//             <span className="font-semibold">{title}</span>
//             {description && (
//                 <span className="text-xs opacity-90 text-tooltip-supporting-text">
//                     {description}
//                 </span>
//             )}
//         </div>
//     );

//     return <Tooltip content={content} {...props} />;
// };

// Composants de base exportés pour usage avancé
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;
export const TooltipArrow = TooltipPrimitive.Arrow;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipPortal = TooltipPrimitive.Portal;

export { TooltipProvider, tooltipContentVariants, tooltipArrowVariants };
