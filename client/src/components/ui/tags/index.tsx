"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { TagCheckbox } from "./tag-checkbox";
import { TagCloseButton } from "./tag-close-button";

// ============================================================================
// Types
// ============================================================================

type TagSize = "sm" | "md" | "lg";
type SelectionMode = "none" | "single" | "multiple";

interface TagGroupContextValue {
    selectionMode: SelectionMode;
    size: TagSize;
    selectedIds: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
}

interface TagGroupProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string;
    size?: TagSize;
    selectionMode?: SelectionMode;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    disallowEmptySelection?: boolean;
}

// Suppression de l'interface TagListProps vide (simplification)
type TagListProps = React.ComponentPropsWithoutRef<"div">;

// Définir les types d'éléments fusionnés pour les gestionnaires d'événements
type TagElement = HTMLButtonElement | HTMLDivElement;

interface TagProps
    extends Omit<React.ComponentPropsWithoutRef<"div">, "id" | "onClick" | "onKeyDown"> {
    id: string;
    avatarSrc?: string;
    avatarContrastBorder?: boolean;
    dot?: boolean;
    dotClassName?: string;
    count?: number;
    isDisabled?: boolean;
    onClose?: (id: string) => void;
    allowsRemoving?: boolean;
    // Types fusionnés pour éviter les conflits lors du rendu conditionnel de <button> ou <div>
    onClick?: React.MouseEventHandler<TagElement>;
    onKeyDown?: React.KeyboardEventHandler<TagElement>;
}

export interface TagItem extends Omit<TagProps, "children"> {
    label: React.ReactNode;
}

interface TagsProps extends Omit<TagGroupProps, "children"> {
    items: TagItem[];
    listClassName?: string;
}

// ============================================================================
// Context
// ============================================================================

const TagGroupContext = React.createContext<TagGroupContextValue>({
    selectionMode: "none",
    size: "sm",
    selectedIds: new Set(),
});

const useTagGroup = () => React.useContext(TagGroupContext);

// ============================================================================
// CVA Variants (Simplifiés)
// ============================================================================

const tagVariants = cva(
    "flex items-center gap-0.75 rounded-md text-secondary ring-1 ring-inset transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    {
        variants: {
            size: {
                sm: "py-0.75 text-xs font-medium",
                md: "py-0.5 text-sm font-medium",
                lg: "py-1 text-sm font-medium",
            },
            isSelectable: {
                true: "bg-primary hover:bg-primary_hover focus-visible:bg-primary_hover cursor-pointer",
                false: "bg-primary cursor-default",
            },
            isDisabled: {
                true: "cursor-not-allowed opacity-60",
                false: "",
            },
            isSelected: {
                true: "bg-brand-subtle ring-brand-solid",
                false: "ring-primary",
            },
        },
        defaultVariants: {
            size: "sm",
            isSelectable: false,
            isDisabled: false,
            isSelected: false,
        },
    }
);

const tagContentVariants = cva("flex items-center", {
    variants: {
        size: {
            sm: "gap-1",
            md: "gap-1.25",
            lg: "gap-1.5",
        },
    },
    defaultVariants: {
        size: "sm",
    },
});

const tagCountVariants = cva(
    "flex items-center justify-center rounded-[3px] bg-tertiary text-center font-medium",
    {
        variants: {
            size: {
                sm: "px-1 text-xs",
                md: "px-1.25 text-xs",
                lg: "px-1.5 text-sm",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

// ============================================================================
// Hooks
// ============================================================================

function useControlledState<T>(
    controlledValue: T | undefined,
    defaultValue: T,
    onChange?: (value: T) => void
) {
    const [internalValue, setInternalValue] = React.useState<T>(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const setValue = React.useCallback(
        (newValue: T) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        },
        [isControlled, onChange]
    );

    return [value, setValue] as const;
}

// ============================================================================
// Utils (Calcul de Padding)
// ============================================================================

/**
 * Calcule le padding à gauche (pl) basé sur la taille et le contenu principal.
 */
function getTagLeftPadding(
    size: TagSize,
    isSelectable: boolean,
    hasAvatar: boolean,
    hasDot: boolean
): string {
    if (isSelectable) {
        return size === "sm" ? "pl-1.25" : size === "md" ? "pl-1" : "pl-1.25";
    }
    if (hasAvatar) {
        return size === "sm" ? "pl-1" : size === "md" ? "pl-1.25" : "pl-1.75";
    }
    if (hasDot) {
        return size === "sm" ? "pl-1.5" : size === "md" ? "pl-1.75" : "pl-2.25";
    }
    // Padding par défaut
    return size === "sm" ? "pl-2" : size === "md" ? "pl-2.25" : "pl-2.5";
}

/**
 * Calcule le padding à droite (pr) basé sur la taille et la présence du count/close button.
 */
function getTagRightPadding(size: TagSize, hasCount: boolean, hasClose: boolean): string {
    if (hasClose) {
        return size === "sm" ? "pr-1" : size === "md" ? "pr-1" : "pr-1";
    }
    if (hasCount) {
        return size === "sm" ? "pr-1" : size === "md" ? "pr-0.75" : "pr-1";
    }
    // Padding par défaut
    return size === "sm" ? "pr-2" : size === "md" ? "pr-2.25" : "pr-2.5";
}

// ============================================================================
// Main Components
// ============================================================================

function TagGroup({
    label,
    selectionMode = "none",
    size = "sm",
    selectedIds: controlledSelectedIds,
    onSelectionChange,
    disallowEmptySelection = false,
    children,
    className,
    ...props
}: TagGroupProps) {
    const [selectedIds, setSelectedIds] = useControlledState(
        controlledSelectedIds,
        new Set<string>(),
        onSelectionChange
    );

    const handleSelectionChange = React.useCallback(
        (newIds: Set<string>) => {
            // Logique de disallowEmptySelection AJUSTÉE
            const isDeselectingLastItem = newIds.size === 0 && selectedIds.size === 1;

            if (disallowEmptySelection && selectionMode !== "none" && isDeselectingLastItem) {
                return;
            }
            setSelectedIds(newIds);
        },
        [setSelectedIds, disallowEmptySelection, selectionMode, selectedIds]
    );

    const contextValue = React.useMemo(
        () => ({ selectionMode, size, selectedIds, onSelectionChange: handleSelectionChange }),
        [selectionMode, size, selectedIds, handleSelectionChange]
    );

    return (
        <TagGroupContext.Provider value={contextValue}>
            <div role="group" aria-label={label} className={className} {...props}>
                {children}
            </div>
        </TagGroupContext.Provider>
    );
}

function TagList({ children, className, ...props }: TagListProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)} {...props}>
            {children}
        </div>
    );
}

export function Tag({
    id,
    avatarSrc,
    avatarContrastBorder,
    dot,
    dotClassName,
    count,
    isDisabled,
    onClose,
    allowsRemoving = false,
    className,
    children,
    onClick,
    onKeyDown,
    ...props
}: TagProps) {
    const { selectionMode, size, selectedIds, onSelectionChange } = useTagGroup();
    const isSelected = selectedIds.has(id);
    const isSelectable = selectionMode !== "none";

    // CORRECTION: Utilisation de la double négation pour s'assurer que le type est boolean
    const showCloseButton = !!onClose || allowsRemoving;

    // Calculer les classes de padding/margin
    const hasAvatar = !!avatarSrc;
    const hasDot = !!dot;
    const hasCount = typeof count === "number";

    const tagPaddingClasses = cn(
        getTagLeftPadding(size, isSelectable, hasAvatar, hasDot),
        getTagRightPadding(size, hasCount, showCloseButton)
    );

    const handleSelectionClick = React.useCallback(
        (e: React.MouseEvent<TagElement>) => {
            onClick?.(e);
            if (isDisabled || !isSelectable) return;

            const newSelectedIds = new Set(selectedIds);

            if (selectionMode === "single") {
                if (isSelected) {
                    newSelectedIds.delete(id);
                } else {
                    newSelectedIds.clear();
                    newSelectedIds.add(id);
                }
            } else if (selectionMode === "multiple") {
                if (isSelected) {
                    newSelectedIds.delete(id);
                } else {
                    newSelectedIds.add(id);
                }
            }

            onSelectionChange?.(newSelectedIds);
        },
        [
            onClick,
            isDisabled,
            isSelectable,
            selectedIds,
            selectionMode,
            isSelected,
            id,
            onSelectionChange,
        ]
    );

    const Element = isSelectable ? "button" : "div";

    return (
        <Element
            id={id}
            role={isSelectable ? "button" : undefined}
            aria-pressed={isSelectable ? isSelected : undefined}
            tabIndex={isDisabled || !isSelectable ? undefined : 0}
            onClick={handleSelectionClick}
            // onKeyDown n'est plus nécessaire pour Enter/Space, mais on peut le garder pour des actions custom.
            onKeyDown={onKeyDown}
            // 'disabled' n'est valide que sur un <button>
            disabled={isSelectable ? isDisabled : undefined}
            className={cn(
                tagVariants({
                    size,
                    isSelectable,
                    isDisabled,
                    isSelected,
                }),
                tagPaddingClasses,
                className
            )}
            // CORRECTION: Assertion de type pour les props restantes (résout le conflit de type Element)
            {...(props as React.ComponentProps<typeof Element>)}
        >
            <div className={tagContentVariants({ size })}>
                {isSelectable && (
                    <TagCheckbox size={size} isSelected={isSelected} isDisabled={isDisabled} />
                )}
                {leadingContent}
                {children}
                {hasCount && <span className={tagCountVariants({ size })}>{count}</span>}
            </div>

            {showCloseButton && (
                // CORRECTION: Passer une fonction sans argument pour le TagCloseButton
                <TagCloseButton
                    size={size}
                    onClose={e => {
                        // La fonction doit intercepter l'événement du bouton pour stopper la propagation
                        e.stopPropagation();
                        onClose?.(id);
                    }}
                    isDisabled={isDisabled}
                />
            )}
        </Element>
    );
}

// ============================================================================
// Tags Wrapper Component
// ============================================================================

export function Tags({ items, listClassName, ...tagGroupProps }: TagsProps) {
    return (
        <TagGroup {...tagGroupProps}>
            <TagList className={listClassName}>
                {items.map(({ id, label, ...tagProps }) => (
                    <Tag key={id} id={id} {...tagProps}>
                        {label}
                    </Tag>
                ))}
            </TagList>
        </TagGroup>
    );
}

export const TagsCustom = {
    Group: TagGroup,
    List: TagList,
    Tag: Tag,
};
