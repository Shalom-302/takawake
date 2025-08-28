import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";

const textareaVariants = cva(
    "border-input placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    {
        variants: {
            variant: {
                default:
                    "dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                outline:
                    "border-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                ghost: "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                underline:
                    "border-0 border-b-2 rounded-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                filled: "bg-secondary/50 border-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                success:
                    "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]",
                warning:
                    "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/50 focus-visible:ring-[3px]",
                error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]",
                info: "border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[3px]",
            },
            size: {
                default: "min-h-16",
                sm: "min-h-12 text-xs px-2 py-1",
                md: "min-h-16 text-sm px-3 py-2",
                lg: "min-h-24 text-lg px-4 py-3",
                xl: "min-h-32 text-xl px-5 py-4",
            },
            rounded: {
                default: "rounded-md",
                full: "rounded-xl",
                none: "rounded-none",
                sm: "rounded-sm",
                lg: "rounded-lg",
            },
            resize: {
                none: "resize-none",
                default: "resize",
                vertical: "resize-y",
                horizontal: "resize-x",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
            resize: "default",
        },
    }
);

export interface TextareaProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnTextarea>,
        VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, size, rounded, resize, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaVariants({ variant, size, rounded, resize }), className)}
                ref={ref}
                data-slot="textarea"
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
