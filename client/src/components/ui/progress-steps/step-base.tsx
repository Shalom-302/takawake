"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StepIcon, type StepIconStatus, type StepIconSize } from "./step-icon";
import type { FC, ReactNode } from "react";
import { FeaturedIcon } from "@/components/icons/featured-icons";

// ============ Types ============

export type StepBaseType =
    | "icon-left"
    | "icon-top"
    | "number-left"
    | "number-top"
    | "featured-icon-left"
    | "featured-icon-top"
    | "text-line";

interface StepBaseProps extends React.ComponentProps<"div"> {
    type: StepBaseType;
    status: StepIconStatus;
    size?: StepIconSize;
    title: string;
    description?: string;
    connector?: boolean;
    number?: number;
    // Utilisation de FC et ReactNode importés pour la prop icon
    icon?: FC<{ className?: string }> | ReactNode;
}

// ============ Component Principal ============

export function StepBase({
    type,
    status,
    size = "sm",
    title,
    description,
    connector = false,
    number = 1,
    icon,
    className,
    ...props
}: StepBaseProps) {
    const commonProps = { status, size, type, title, description, className, ...props };

    switch (type) {
        case "icon-left":
            return <StepIconLeft connector={connector} {...commonProps} />;
        case "icon-top":
            return <StepIconTop {...commonProps} />;
        case "number-left":
            return <StepNumberLeft connector={connector} number={number} {...commonProps} />;
        case "number-top":
            return <StepNumberTop number={number} {...commonProps} />;
        case "featured-icon-left":
            return <StepFeaturedIconLeft connector={connector} icon={icon} {...commonProps} />;
        case "featured-icon-top":
            return <StepFeaturedIconTop icon={icon} {...commonProps} />;
        case "text-line":
            return <StepTextLine {...commonProps} />;
        default:
            return null;
    }
}

// =======================================================
// SOUS-COMPOSANTS VARIATIONS
// =======================================================

// --- Styles Utilitaires Répétés ---
const LEFT_GAP_CLASS = {
    sm: "gap-3",
    md: "gap-4",
};
const TEXT_SIZE_CLASS = {
    sm: "text-sm",
    md: "text-base",
};
const TEXT_PADDING_LEFT_CLASS = {
    sm: "pt-0.5 pb-6", // Alignement vertical fin
    md: "pt-1 pb-8",
};

const Connector = ({
    size,
    status,
    type,
}: {
    size: StepIconSize;
    status: StepIconStatus;
    type: StepBaseType;
}) => (
    <div
        className={cn(
            size === "sm" && type === "icon-left" && "h-[34px] border-l-2 border-secondary",
            size === "md" && type === "icon-left" && "h-10 border-l-2 border-secondary",
            size === "sm" &&
                type === "number-left" &&
                "h-[30px] border-l-2 border-dotted border-primary",
            size === "md" &&
                type === "number-left" &&
                "h-9  border-l-2 border-dotted border-primary",
            size === "sm" && type === "featured-icon-left" && "h-3 border-l-2 border-secondary",
            size === "md" && type === "featured-icon-top" && "h-6 border-l-2 border-secondary",
            status === "complete" && type === "icon-left" && "bg-fg-brand-primary"
        )}
    />
);

// ============ Icon Left Variant ============

function StepIconLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    connector,
    className,
    ...props
}: Omit<StepBaseProps, "number" | "icon">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                <StepIcon type="radio" status={status} size={size} />
                {connector && <Connector size={size} status={status} type={type} />}
            </div>

            {/* Text Column */}
            <div
                className={cn(
                    "flex-1 inline-flex flex-col justify-start items-start",
                    TEXT_PADDING_LEFT_CLASS[size]
                )}
            >
                <div
                    className={cn(
                        "self-stretch justify-start text-text-secondary font-semibold",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch justify-start text-text-tertiary font-normal",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Icon Top Variant ============

function StepIconTop({
    status,
    size = "sm",
    title,
    description,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "connector" | "number" | "icon">) {
    const textGapClass = size === "sm" ? "gap-0.5" : "gap-1";
    const titleColorClass = status === "current" ? "text-brand-primary" : "text-text-secondary";

    return (
        <div
            className={cn(
                "w-80 inline-flex flex-col justify-start items-center",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            {/* Icon */}
            <StepIcon type="radio" status={status} size={size} />

            {/* Text */}
            <div
                className={cn(
                    "self-stretch flex flex-col justify-start items-center",
                    textGapClass
                )}
            >
                <div
                    className={cn(
                        "self-stretch text-center font-semibold",
                        TEXT_SIZE_CLASS[size],
                        titleColorClass
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch text-center font-normal text-text-tertiary",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Number Left Variant ============

function StepNumberLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    connector,
    number,
    className,
    ...props
}: Omit<StepBaseProps, "icon">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            {/* Icon + Connector Column - Ajout de h-full pour s'assurer que le connecteur s'étire */}
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                <StepIcon type="number" status={status} size={size} number={number} />
                {connector && <Connector size={size} status={status} type={type} />}
            </div>

            {/* Text Column */}
            <div
                className={cn(
                    "flex-1 inline-flex flex-col justify-start items-start",
                    TEXT_PADDING_LEFT_CLASS[size]
                )}
            >
                <div
                    className={cn(
                        "self-stretch justify-start text-text-secondary font-semibold",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch justify-start text-text-tertiary font-normal",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Number Top Variant ============

function StepNumberTop({
    status,
    size = "sm",
    title,
    description,
    number,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "connector" | "icon">) {
    const textGapClass = size === "sm" ? "gap-0.5" : "gap-1";
    const titleColorClass = status === "current" ? "text-brand-primary" : "text-text-secondary";

    return (
        <div
            className={cn(
                "w-80 inline-flex flex-col justify-start items-center",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            {/* Icon */}
            <StepIcon type="number" status={status} size={size} number={number} />

            {/* Text */}
            <div
                className={cn(
                    "self-stretch flex flex-col justify-start items-center",
                    textGapClass
                )}
            >
                <div
                    className={cn(
                        "self-stretch text-center font-semibold",
                        TEXT_SIZE_CLASS[size],
                        titleColorClass
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch text-center font-normal text-text-tertiary",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Featured Icon Left Variant ============

function StepFeaturedIconLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    connector,
    icon: IconComponent,
    className,
    ...props
}: Omit<StepBaseProps, "number">) {
    // Opacité appliquée au niveau du conteneur pour tout l'élément
    const statusClass = status === "incomplete" ? "opacity-60" : "opacity-100";

    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                statusClass,
                className
            )}
            {...props}
        >
            {/* Featured Icon + Connector Column - Ajout de h-full pour s'assurer que le connecteur s'étire */}
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                {/* Utilise le composant FeaturedIcon importé */}
                <FeaturedIcon size="lg" variant="modern" color="gray" icon={IconComponent} />
                {connector && <Connector size={size} status={status} type={type} />}
            </div>

            {/* Text Column */}
            <div
                className={cn(
                    "flex-1 inline-flex flex-col justify-start items-start",
                    TEXT_PADDING_LEFT_CLASS[size]
                )}
            >
                <div
                    className={cn(
                        "self-stretch justify-start text-text-secondary font-semibold",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch justify-start text-text-tertiary font-normal",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Featured Icon Top Variant ============

function StepFeaturedIconTop({
    status,
    size = "sm",
    title,
    description,
    icon: IconComponent,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "connector" | "number">) {
    const statusClass = status === "incomplete" ? "opacity-60" : "opacity-100";
    const textGapClass = size === "sm" ? "gap-0.5" : "gap-1";
    const titleColorClass = status === "current" ? "text-brand-primary" : "text-text-secondary";

    return (
        <div
            className={cn(
                "w-80 inline-flex flex-col justify-start items-center",
                statusClass,
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            {/* Utilise le composant FeaturedIcon importé */}
            <FeaturedIcon size="lg" variant="modern" color="gray" icon={IconComponent} />

            {/* Text */}
            <div
                className={cn(
                    "self-stretch flex flex-col justify-start items-center",
                    textGapClass
                )}
            >
                <div
                    className={cn(
                        "self-stretch text-center font-semibold",
                        TEXT_SIZE_CLASS[size],
                        titleColorClass
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch text-center font-normal text-text-tertiary",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Text Line Variant ============

function StepTextLine({
    status,
    size = "sm",
    title,
    description,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "connector" | "number" | "icon">) {
    const paddingClass = size === "sm" ? "pt-3" : "pt-4";
    const borderClass = size === "sm" ? "border-t-4" : "border-t-[5px]";

    const borderColorClass =
        status === "complete" || status === "current"
            ? "border-brand-primary"
            : "border-border-secondary";

    return (
        <div
            className={cn(
                "w-80 inline-flex flex-col justify-start items-start",
                paddingClass,
                borderClass,
                borderColorClass,
                className
            )}
            {...props}
        >
            <div className="self-stretch flex flex-col justify-start items-start">
                <div
                    className={cn(
                        "self-stretch justify-start text-text-secondary font-semibold",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    {title}
                </div>
                {description && (
                    <div
                        className={cn(
                            "self-stretch justify-start text-text-tertiary font-normal",
                            TEXT_SIZE_CLASS[size]
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ Exemples d'utilisation ============

/*
import { User } from "@untitled-ui/icons-react";

// Icon Left avec connector
<StepBase
    type="icon-left"
    status="incomplete"
    size="sm"
    title="Your details"
    description="Please provide your name and email"
    connector={true}
/>

// Icon Top
<StepBase
    type="icon-top"
    status="current"
    size="md"
    title="Your details"
    description="Please provide your name and email"
/>

// Number Left avec connector
<StepBase
    type="number-left"
    status="complete"
    size="sm"
    title="Company details"
    description="A few details about your company"
    number={2}
    connector={true}
/>

// Number Top
<StepBase
    type="number-top"
    status="current"
    size="md"
    title="Invite your team"
    description="Start collaborating with your team"
    number={3}
/>

// Featured Icon Left
<StepBase
    type="featured-icon-left"
    status="incomplete"
    size="sm"
    title="Add your socials"
    description="Share posts to your social accounts"
    icon={User}
    connector={true}
/>

// Featured Icon Top
<StepBase
    type="featured-icon-top"
    status="current"
    size="md"
    title="Review"
    description="Radio everything before submitting"
    icon={User}
/>

// Text Line
<StepBase
    type="text-line"
    status="complete"
    size="sm"
    title="Your details"
    description="Please provide your name and email"
/>

// Exemple d'une séquence complète (icon-left avec connectors)
<div className="flex flex-col">
    <StepBase
        type="icon-left"
        status="complete"
        size="sm"
        title="Your details"
        description="Name and email"
        connector={true}
    />
    <StepBase
        type="icon-left"
        status="current"
        size="sm"
        title="Company details"
        description="Website and location"
        connector={true}
    />
    <StepBase
        type="icon-left"
        status="incomplete"
        size="sm"
        title="Invite your team"
        description="Start collaborating"
        connector={false}
    />
</div>
*/
