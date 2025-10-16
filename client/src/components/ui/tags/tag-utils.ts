import { cn } from "@/lib/utils/cn";

export type TagSize = "sm" | "md" | "lg";
type PaddingDirection = "left" | "right";
type LeftModifier = "selectable" | "avatar" | "dot";
type RightModifier = "count" | "close";

interface PaddingConfig {
    base: Record<PaddingDirection, string>;
    left: Record<LeftModifier, string>;
    right: Record<RightModifier, string>;
}

const PADDING_CONFIG: Record<TagSize, PaddingConfig> = {
    sm: {
        base: { left: "pl-2", right: "pr-2" },
        left: { selectable: "pl-1.25", avatar: "pl-1", dot: "pl-1.5" },
        right: { count: "pr-1", close: "pr-1" },
    },
    md: {
        base: { left: "pl-2.25", right: "pr-2.25" },
        left: { selectable: "pl-1", avatar: "pl-1.25", dot: "pl-1.75" },
        right: { count: "pr-0.75", close: "pr-1" },
    },
    lg: {
        base: { left: "pl-2.5", right: "pr-2.5" },
        left: { selectable: "pl-1.25", avatar: "pl-1.75", dot: "pl-2.25" },
        right: { count: "pr-1", close: "pr-1" },
    },
} as const;

/**
 * Calcule la classe de padding à gauche (pl) basée sur la taille et le contenu principal.
 * Les priorités sont : Selectable > Avatar > Dot > Base.
 */
export function getTagLeftPadding(
    size: TagSize,
    isSelectable: boolean,
    hasAvatar: boolean,
    hasDot: boolean
): string {
    const config = PADDING_CONFIG[size];

    if (isSelectable) return config.left.selectable;
    if (hasAvatar) return config.left.avatar;
    if (hasDot) return config.left.dot;

    return config.base.left;
}

export function getTagRightPadding(size: TagSize, hasCount: boolean, hasClose: boolean): string {
    const config = PADDING_CONFIG[size];

    if (hasClose) return config.right.close;
    if (hasCount) return config.right.count;

    return config.base.right;
}

interface TagPaddingOptions {
    size: TagSize;
    isSelectable: boolean;
    hasAvatar: boolean;
    hasDot: boolean;
    hasCount: boolean;
    showCloseButton: boolean;
}

/**
 * Calcule toutes les classes de padding/margin pour le Tag.
 */
export function getTagPaddingClasses(options: TagPaddingOptions): string {
    const { size, isSelectable, hasAvatar, hasDot, hasCount, showCloseButton } = options;

    const left = getTagLeftPadding(size, isSelectable, hasAvatar, hasDot);
    const right = getTagRightPadding(size, hasCount, showCloseButton);

    return cn(left, right);
}
export { PADDING_CONFIG };
