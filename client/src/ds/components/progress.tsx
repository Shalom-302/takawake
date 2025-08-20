import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define variants for the progress component
const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        primary: "bg-primary/20",
        success: "bg-green-100 dark:bg-green-900/20",
        warning: "bg-yellow-100 dark:bg-yellow-900/20",
        error: "bg-red-100 dark:bg-red-900/20",
        info: "bg-blue-100 dark:bg-blue-900/20",
      },
      size: {
        sm: "h-2",
        default: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define variants for the progress indicator
const indicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      primary: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500",
    },
    animated: {
      true: "transition-transform duration-500",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    animated: true,
  },
});

// Define the props interface for the Progress component
export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  animated?: boolean;
}

/**
 * Progress Component
 * 
 * A customizable progress bar component with different variants, sizes, and animation options.
 * 
 * @example
 * ```tsx
 * <Progress
 *   variant="primary"
 *   size="default"
 *   value={75}
 *   animated={true}
 * />
 * ```
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, variant, size, value, animated = true, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ variant, size }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorVariants({ variant, animated }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

export { Progress };
