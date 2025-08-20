import * as React from "react";
import { Alert as ShadcnAlert, AlertDescription as ShadcnAlertDescription, AlertTitle as ShadcnAlertTitle } from "@/components/ui/alert";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Extension des variants d'alert de shadcn
export const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // Nouveaux variants personnalisés
        success: "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 [&>svg]:text-green-500",
        warning: "border-yellow-500/50 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 [&>svg]:text-yellow-500",
        info: "border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 [&>svg]:text-blue-500",
        neutral: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
      size: {
        default: "p-4",
        sm: "p-3 text-sm",
        lg: "p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Définition des types pour les variantes
export type AlertVariant = "default" | "destructive" | "success" | "warning" | "info" | "neutral";

export interface AlertProps
  extends React.ComponentProps<typeof ShadcnAlert>,
    VariantProps<typeof alertVariants> {
  // Props supplémentaires pour l'API simplifiée
  title?: string;
  description?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function Alert({
  className,
  variant,
  size,
  title,
  description,
  showIcon = true,
  children,
  ...props
}: AlertProps): React.ReactElement {
  // Déterminer l'icône en fonction de la variante
  const getIcon = () => {
    if (!showIcon) return null;
    
    // Utilisation de la vérification de type pour éviter les erreurs TypeScript
    const variantString = variant as string;
    if (variantString === "success") return <CheckCircle className="h-4 w-4" />;
    if (variantString === "warning") return <AlertTriangle className="h-4 w-4" />;
    if (variantString === "info") return <Info className="h-4 w-4" />;
    if (variantString === "destructive") return <AlertCircle className="h-4 w-4" />;
    return null;
  };

  // Si des enfants sont fournis, utiliser le mode composant normal
  if (children) {
    return (
      <ShadcnAlert
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {showIcon && getIcon()}
        {children}
      </ShadcnAlert>
    );
  }

  // Sinon, utiliser l'API simplifiée avec title et description
  return (
    <ShadcnAlert
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      {showIcon && getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </ShadcnAlert>
  );
}

// Composants AlertTitle et AlertDescription personnalisés
export const AlertTitle = ShadcnAlertTitle;
export const AlertDescription = ShadcnAlertDescription;
