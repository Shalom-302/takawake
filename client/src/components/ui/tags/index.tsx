"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "../avatar";
import { Dot } from "@/components/icons/dot-icon";
import { getTagPaddingClasses } from "./tag-utils";
import { TagCheckbox } from "./tag-checkbox";
import { TagCloseButton } from "./tag-close-button";
import { useControlledState } from "@/lib/hooks/use-controlled-sate";

// ============================================================================
// Types
// ============================================================================

export type TagSize = "sm" | "md" | "lg";
type SelectionMode = "none" | "single" | "multiple";
type TagElement = HTMLButtonElement | HTMLDivElement;

interface TagGroupContextValue {
    selectionMode: SelectionMode;
    size: TagSize;
    selectedIds: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    registerTag: (id: string, ref: HTMLElement | null) => void;
    unregisterTag: (id: string) => void;
    tagIdsOrder: string[];
    focusTag: (id: string) => void;
}

export interface TagGroupProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string;
    size?: TagSize;
    selectionMode?: SelectionMode;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    disallowEmptySelection?: boolean;
}

type TagListProps = React.ComponentPropsWithoutRef<"div">;

export interface TagProps
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
    className?: string;
    onClick?: React.MouseEventHandler<TagElement>;
    onKeyDown?: React.KeyboardEventHandler<TagElement>;
}

export interface TagItem extends Omit<TagProps, "children"> {
    label: React.ReactNode;
}

export interface TagsProps extends Omit<TagGroupProps, "children"> {
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
    registerTag: () => {},
    unregisterTag: () => {},
    tagIdsOrder: [],
    focusTag: () => {},
});

const useTagGroup = () => React.useContext(TagGroupContext);

// ============================================================================
// CVA Variants
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
// TagGroup Component
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

    const [tagIdsOrder, setTagIdsOrder] = React.useState<string[]>([]);
    const tagRefsMap = React.useRef<Map<string, HTMLElement>>(new Map());

    const registerTag = React.useCallback((id: string, ref: HTMLElement | null) => {
        if (ref && !tagRefsMap.current.has(id)) {
            tagRefsMap.current.set(id, ref);
            setTagIdsOrder(prev => {
                if (!prev.includes(id)) {
                    // Maintient l'ordre d'apparition
                    return [...prev, id];
                }
                return prev;
            });
        }
    }, []);

    const unregisterTag = React.useCallback((id: string) => {
        tagRefsMap.current.delete(id);
        setTagIdsOrder(prev => prev.filter(tagId => tagId !== id));
    }, []);

    const focusTag = React.useCallback((id: string) => {
        const ref = tagRefsMap.current.get(id);
        ref?.focus();
    }, []);

    const handleSelectionChange = React.useCallback(
        (newIds: Set<string>) => {
            if (disallowEmptySelection && newIds.size === 0 && selectedIds.size > 0) {
                return;
            }
            setSelectedIds(newIds);
        },
        [setSelectedIds, disallowEmptySelection, selectedIds]
    );

    const contextValue = React.useMemo(
        () => ({
            selectionMode,
            size,
            selectedIds,
            onSelectionChange: handleSelectionChange,
            registerTag,
            unregisterTag,
            tagIdsOrder,
            focusTag,
        }),
        [
            selectionMode,
            size,
            selectedIds,
            handleSelectionChange,
            registerTag,
            unregisterTag,
            tagIdsOrder,
            focusTag,
        ]
    );

    return (
        <TagGroupContext.Provider value={contextValue}>
            <div role="group" aria-label={label} className={className} {...props}>
                {children}
            </div>
        </TagGroupContext.Provider>
    );
}

TagGroup.displayName = "TagGroup";

// ============================================================================
// TagList Component
// ============================================================================

function TagList({ children, className, ...props }: TagListProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)} {...props}>
            {children}
        </div>
    );
}

TagList.displayName = "TagList";

// ============================================================================
// Tag Component
// ============================================================================

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
    const {
        selectionMode,
        size = "sm",
        selectedIds,
        onSelectionChange,
        registerTag,
        unregisterTag,
        tagIdsOrder,
        focusTag,
    } = useTagGroup();
    const isSelected = selectedIds.has(id);
    const isSelectable = selectionMode !== "none";
    const isInteractive = isSelectable || !!onClose || allowsRemoving;

    const showCloseButton = !!onClose || allowsRemoving;

    const hasAvatar = !!avatarSrc;
    const hasDot = !!dot;
    const hasCount = typeof count === "number";

    // Calcul des classes de padding
    const tagPaddingClasses = getTagPaddingClasses({
        size,
        isSelectable,
        hasAvatar,
        hasDot,
        hasCount,
        showCloseButton,
    });

    // CORRECTION: Référence unique et fonction d'enregistrement (pour le clavier)
    const elementRef = React.useRef<HTMLElement | null>(null);
    const setRef = React.useCallback(
        (node: HTMLElement | null) => {
            elementRef.current = node;
            registerTag(id, node);
        },
        [id, registerTag]
    );

    // Désenregistrement au démontage
    React.useEffect(() => {
        return () => unregisterTag(id);
    }, [id, unregisterTag]);

    // Logique de sélection simplifiée
    const handleSelectionLogic = React.useCallback(() => {
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
    }, [isDisabled, isSelectable, selectedIds, selectionMode, isSelected, id, onSelectionChange]);

    const handleSelectionClick = React.useCallback(
        (e: React.MouseEvent<TagElement>) => {
            onClick?.(e);
            handleSelectionLogic();
        },
        [onClick, handleSelectionLogic]
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLElement>) => {
            onKeyDown?.(e as React.KeyboardEvent<TagElement>);
            if (isDisabled) return;

            const tagIds = tagIdsOrder;
            const currentIndex = tagIds.indexOf(id);

            // Navigation (Flèches)
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();

                let nextIndex = currentIndex;
                if (e.key === "ArrowRight") {
                    nextIndex = currentIndex + 1;
                    if (nextIndex >= tagIds.length) nextIndex = 0;
                } else {
                    nextIndex = currentIndex - 1;
                    if (nextIndex < 0) nextIndex = tagIds.length - 1;
                }

                if (tagIds[nextIndex]) {
                    focusTag(tagIds[nextIndex]);
                }
                return;
            }

            // Sélection (Enter/Space)
            if ((e.key === "Enter" || e.key === " ") && isSelectable) {
                e.preventDefault();
                handleSelectionLogic();
            }

            // Suppression (Delete/Backspace)
            if ((e.key === "Delete" || e.key === "Backspace") && onClose) {
                e.preventDefault();

                const nextId = tagIds[currentIndex + 1] || tagIds[currentIndex - 1];

                if (nextId) {
                    focusTag(nextId);
                }
                onClose(id);
            }
        },
        [
            onKeyDown,
            isDisabled,
            isSelectable,
            handleSelectionLogic,
            onClose,
            id,
            tagIdsOrder,
            focusTag,
        ]
    );

    const handleClose = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            const tagIds = tagIdsOrder;
            const currentIndex = tagIds.indexOf(id);
            const nextId = tagIds[currentIndex + 1] || tagIds[currentIndex - 1];

            if (nextId) {
                focusTag(nextId);
            }

            onClose?.(id);
        },
        [onClose, id, focusTag, tagIdsOrder]
    );

    const leadingContent = hasAvatar ? (
        <Avatar size="xxs" src={avatarSrc} alt="Avatar" contrastBorder={avatarContrastBorder} />
    ) : hasDot ? (
        <Dot className={cn("text-fg-success-secondary", dotClassName)} size="sm" />
    ) : null;

    const isFocused = elementRef.current === document.activeElement;
    const tabIndex = isSelectable ? (isDisabled ? undefined : 0) : isInteractive ? 0 : undefined;

    const commonProps = {
        id,
        ref: setRef,
        role: isSelectable ? "button" : isInteractive ? "listitem" : undefined,
        "aria-pressed": isSelectable ? isSelected : undefined,
        "aria-label": typeof children === "string" ? children : undefined,
        tabIndex: tabIndex,
        onClick: handleSelectionClick,
        onKeyDown: handleKeyDown,
        className: cn(
            tagVariants({ size, isSelectable, isDisabled, isSelected }),
            tagPaddingClasses,
            className
        ),
    };

    const content = (
        <>
            <div className={tagContentVariants({ size })}>
                {isSelectable && (
                    <TagCheckbox
                        size={size}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        isFocused={isFocused}
                    />
                )}
                {leadingContent}
                {children}
                {hasCount && <span className={tagCountVariants({ size })}>{count}</span>}
            </div>

            {showCloseButton && (
                <TagCloseButton size={size} onClose={handleClose} isDisabled={isDisabled} />
            )}
        </>
    );

    if (isSelectable) {
        return (
            <button
                type="button"
                disabled={isDisabled}
                {...commonProps}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
                {content}
            </button>
        );
    }

    return (
        <div {...commonProps} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
            {content}
        </div>
    );
}

Tag.displayName = "Tag";

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

Tags.displayName = "Tags";

// ============================================================================
// Export composé pour usage personnalisé
// ============================================================================

export const TagsCustom = {
    Group: TagGroup,
    List: TagList,
    Tag: Tag,
};
