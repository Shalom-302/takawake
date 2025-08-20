import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define variants for the slider component
const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      size: {
        default: "h-5",
        sm: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Define variants for the slider track
const trackVariants = cva(
  "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
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
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Define variants for the slider range
const rangeVariants = cva("absolute h-full", {
  variants: {
    variant: {
      default: "bg-primary",
      primary: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Define variants for the slider thumb
const thumbVariants = cva(
  "block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary",
        primary: "border-primary",
        success: "border-green-500",
        warning: "border-yellow-500",
        error: "border-red-500",
        info: "border-blue-500",
      },
      size: {
        default: "h-5 w-5",
        sm: "h-3.5 w-3.5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define the props interface for the Slider component
export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants>,
    VariantProps<typeof trackVariants> {
  thumbSize?: VariantProps<typeof thumbVariants>["size"];
}

/**
 * Slider Component
 * 
 * A customizable slider component with different variants and sizes.
 * 
 * @example
 * ```tsx
 * <Slider
 *   variant="primary"
 *   size="default"
 *   defaultValue={[50]}
 *   max={100}
 *   step={1}
 * />
 * ```
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant, size, thumbSize, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderVariants({ size }), className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn(trackVariants({ variant }))}>
      <SliderPrimitive.Range className={cn(rangeVariants({ variant }))} />
    </SliderPrimitive.Track>
    {props.defaultValue?.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className={cn(thumbVariants({ variant, size: thumbSize || size }))}
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };
