import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Tooltip } from "./tooltip";
import { AlertCircleIcon } from "@/components/icons";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex items-center min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        success: "border-green-500 focus-within:border-green-500 focus-within:ring-green-500/50 focus-within:ring-[3px]",
        warning: "border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-500/50 focus-within:ring-[3px]",
        error: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/50 focus-within:ring-[3px]",
        info: "border-blue-500 focus-within:border-blue-500 focus-within:ring-blue-500/50 focus-within:ring-[3px]",
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
    VariantProps<typeof inputVariants> {
      icon?: null | { position: "left" | "right"; icon: React.ReactNode };
      info?: null | { position: "left" | "right"; description?: string };
    }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, rounded, icon, info, ...props }, ref) => {
    return (
      <div className={cn(
        inputVariants({ variant, size, rounded }),
        {
          "flex-row-reverse": ((icon && icon.position === "right") || (info && info.position === "left")),
        },
        className
      )}
      >
        {/* Simple Icon */}
        {icon && (
          <div
            className={cn(
              "h-full text-muted-foreground flex items-center justify-center shrink-0",
              {
                "mr-[8px]": icon.position === "left",
                "ml-[8px]": icon.position === "right",
              }
            )}
          >
            {icon?.icon}
          </div>
        )}

        {/* input */}
        <input
          className={cn(
            "h-full w-full focus:outline border-0",
          )}
          ref={ref}
          data-slot="input"
          {...props}
        />

        {/* Tooltip */}
        {
          info && (
          <div
            className={cn(
              'h-full flex items-center',
              {
                "mr-[8px]": info.position === "left",
                "ml-[8px]": info.position === "right",
              }
            )}
          >
            <Tooltip content={info.description}>
              <div className="text-muted-foreground">
                <AlertCircleIcon size={16} />
              </div>
            </Tooltip>
          </div>
            
          )
        }
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
