"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "@untitled-ui/icons-react";
import { type SelectHTMLAttributes, useId } from "react";

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    selectClassName?: string;
    options: { label: string; value: string; disabled?: boolean }[];
}

export const NativeSelect = ({
    options,
    className,
    selectClassName,
    ...props
}: NativeSelectProps) => {
    const id = useId();

    return (
        // Utilisation de w-max seulement si vous voulez que le select s'ajuste à son contenu
        <div className={cn("w-full", className)}>
            <div className="relative flex w-full items-center">
                <select
                    {...props}
                    id={`select-native-${id}`}
                    aria-labelledby={`select-native-${id}`}
                    className={cn(
                        // Style par défaut (lorsqu'il est seul)
                        "appearance-none rounded-lg bg-primary px-3.5 py-2.5 text-md font-medium text-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled",

                        // Style d'intégration dans un InputGroupCustom.Addon (ciblé par [data-slot=input-group-addon])
                        // L'addon s'occupera du coin arrondi et du ring. Ici, on s'assure qu'il prend toute la place
                        "[data-slot=input-group-addon]:h-full [data-slot=input-group-addon]:flex-1 [data-slot=input-group-addon]:!rounded-r-none",
                        "[data-slot=input-group-addon]:bg-inherit [data-slot=input-group-addon]:px-3 [data-slot=input-group-addon]:py-2 [data-slot=input-group-addon]:font-normal [data-slot=input-group-addon]:text-tertiary [data-slot=input-group-addon]:shadow-none [data-slot=input-group-addon]:ring-transparent",

                        // Réinitialiser les styles de l'addon pour le select lui-même
                        "group/input-group-addon:p-0", // L'Addon a son propre padding, le Select doit s'y adapter
                        "group/input-group-addon:bg-transparent", // Rendre l'arrière-plan transparent dans l'addon

                        // Rendre le select aussi large que possible à l'intérieur de l'addon
                        "[data-slot=input-group-addon]:w-full",

                        selectClassName
                    )}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* L'icône est positionnée à l'intérieur, mais nous devons ajuster sa position */}
                <ChevronDown
                    aria-hidden="true"
                    // Style par défaut
                    className="pointer-events-none absolute right-3.5 size-5 text-fg-quaternary"
                    // Ajustement si dans un addon (le sélecteur est maintenant 'group/input-group-addon')
                    // Nous nous appuyons sur le fait que l'Addon a un padding.
                    // L'addon doit appliquer : [data-slot=input-group-addon] relative
                />
            </div>
        </div>
    );
};
