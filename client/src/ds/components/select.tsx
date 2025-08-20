"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Select as ShadcnSelect,
  SelectGroup,
  SelectValue,
  SelectTrigger as ShadcnSelectTrigger,
  SelectContent as ShadcnSelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";

const selectTriggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "border-input",
        outline: "border-2",
        ghost: "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground",
        underline: "border-0 border-b-2 rounded-none",
        filled: "bg-secondary/50 border-transparent",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
      state: {
        default: "",
        error: "border-red-500 focus:ring-red-500/50",
        success: "border-green-500 focus:ring-green-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      state: "default",
    },
  }
);

const selectContentVariants = cva(
  "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg",
        bordered: "border-2",
        minimal: "border-0 shadow-sm",
      },
      contentAlign: {
        default: "",
        center: "text-center [&>div>div]:flex [&>div>div]:flex-col [&>div>div]:items-center",
        end: "text-right [&>div>div]:flex [&>div>div]:flex-col [&>div>div]:items-end",
      },
    },
    defaultVariants: {
      variant: "default",
      contentAlign: "default",
    },
  }
);

// Composants de base personnalisés pour les sous-composants
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof ShadcnSelectTrigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof ShadcnSelectTrigger>,
  SelectTriggerProps
>(({ className, variant, size, rounded, state, ...props }, ref) => (
  <ShadcnSelectTrigger
    className={cn(selectTriggerVariants({ variant, size, rounded, state }), className)}
    ref={ref}
    {...props}
  />
));
SelectTrigger.displayName = "SelectTrigger";

// Créer un type pour les props de ShadcnSelectContent sans la prop align native
type SelectContentBaseProps = Omit<React.ComponentPropsWithoutRef<typeof ShadcnSelectContent>, 'align'>;  

export interface SelectContentProps
  extends SelectContentBaseProps,
    Omit<VariantProps<typeof selectContentVariants>, 'contentAlign'> {
  align?: "default" | "center" | "end";
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof ShadcnSelectContent>,
  SelectContentProps
>(({ className, variant, align, ...props }, ref) => {
  // Convertir align en contentAlign pour éviter le conflit avec la prop native align
  const contentAlign = align as "default" | "center" | "end" | undefined;
  
  return (
    <ShadcnSelectContent
      className={cn(selectContentVariants({ variant, contentAlign }), className)}
      ref={ref}
      {...props}
    />
  );
});
SelectContent.displayName = "SelectContent";

// Type pour l'option du select
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

// Type pour le groupe d'options
export type SelectOptionGroup = {
  label: string;
  options: SelectOption[];
};

// Interface pour le composant Select avec API simplifiée
export interface SelectProps extends Omit<React.ComponentPropsWithoutRef<typeof ShadcnSelect>, 'children'> {
  // Props de style
  variant?: VariantProps<typeof selectTriggerVariants>["variant"];
  size?: VariantProps<typeof selectTriggerVariants>["size"];
  rounded?: VariantProps<typeof selectTriggerVariants>["rounded"];
  state?: VariantProps<typeof selectTriggerVariants>["state"];
  contentVariant?: VariantProps<typeof selectContentVariants>["variant"];
  contentAlign?: "default" | "center" | "end";
  className?: string;
  
  // Props fonctionnelles
  options?: (SelectOption | SelectOptionGroup)[];
  placeholder?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

// Composant Select avec API simplifiée
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    variant,
    size,
    rounded,
    state,
    contentVariant,
    contentAlign,
    className,
    options = [],
    placeholder,
    label,
    value,
    defaultValue,
    onValueChange,
    ...props
  }, ref) => {
    // Fonction pour déterminer si une option est un groupe
    const isOptionGroup = (option: SelectOption | SelectOptionGroup): option is SelectOptionGroup => {
      return 'options' in option;
    };

    return (
      <ShadcnSelect 
        value={value} 
        defaultValue={defaultValue} 
        onValueChange={onValueChange}
        {...props}
      >
        <SelectTrigger ref={ref} variant={variant} size={size} rounded={rounded} state={state} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent variant={contentVariant} align={contentAlign}>
          {label && (
            <SelectGroup>
              <SelectLabel>{label}</SelectLabel>
            </SelectGroup>
          )}
          
          {options.map((option, index) => {
            if (isOptionGroup(option)) {
              // C'est un groupe d'options
              return (
                <SelectGroup key={index}>
                  <SelectLabel>{option.label}</SelectLabel>
                  {option.options.map((subOption, subIndex) => (
                    <SelectItem 
                      key={`${index}-${subIndex}`} 
                      value={subOption.value}
                      disabled={subOption.disabled}
                    >
                      {subOption.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            } else {
              // C'est une option simple
              return (
                <SelectItem 
                  key={index} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              );
            }
          })}
        </SelectContent>
      </ShadcnSelect>
    );
  }
);
Select.displayName = "Select";

// Export du composant principal et des sous-composants pour une utilisation avancée si nécessaire
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
