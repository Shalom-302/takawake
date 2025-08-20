import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Input as ShadcnInput } from "@/components/ui/input";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        success: "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]",
        warning: "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/50 focus-visible:ring-[3px]",
        error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]",
        info: "border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[3px]",
      },
      size: {
        default: "h-9",
        sm: "h-7 text-xs px-2 py-0.5",
        lg: "h-11 text-lg px-4 py-2",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ShadcnInput>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, size, rounded }), className)}
        ref={ref}
        data-slot="input"
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
