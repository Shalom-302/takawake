"use client";
import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import {
    Badge,
    BadgeVariants,
    BadgeWithDot,
    BadgeWithIcon,
    BadgeWithFlag,
    BadgeWithImage,
    BadgeWithButton,
    BadgeIcon,
    BadgeGroup,
} from "@/components/ui/badge";
import { Sizes } from "@/components/ui/badge/badge-types";
import {
    ArrowDown,
    Globe01,
    Mail01,
    Settings01,
    ShieldDollar,
    User01,
    X,
} from "@untitled-ui/icons-react";

export default function BadgePage() {
    const variants = [
        { name: "pill-color", description: "Fully rounded badge with background color." },
        { name: "color", description: "Rectangular badge with slightly rounded corners." },
        { name: "modern", description: "Rectangular badge with a subtle shadow (modern style)." },
    ];

    const colors: BadgeVariants["color"][] = [
        "gray",
        "brand",
        "error",
        "warning",
        "success",
        "blue",
    ];
    const sizes: Sizes[] = ["sm", "md", "lg"];

    const defaultColor = "brand";
    const defaultVariant = "pill-color";

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Retour au Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Badge</h1>
                <p className="text-muted-foreground mt-2">
                    Les badges sont utilisés pour afficher des statuts, des étiquettes ou des
                    notifications de manière concise. Notre système supporte différentes
                    combinaisons d&apos;éléments visuels (point, icône, bouton, image, etc.).
                </p>
            </div>

            {/* COMPOSANTS DE BASE (BADGE) */}
            <h2 className="text-2xl font-bold mt-10 mb-6">1. Badge Simple & Couleurs</h2>
            <p className="text-muted-foreground mb-4">
                La couleur, la taille et la variante (forme) sont les props de base.
            </p>

            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Formes (Variant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border border-tertiary rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={variant.name as BadgeVariants["variant"]}>
                                    {variant.name}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <CodeBlock
                                className="mt-2"
                                code={`<Badge variant="${variant.name}">${variant.name}</Badge>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Tailles (Size)</h3>
                <div className="flex flex-wrap gap-4 p-4 border border-tertiary rounded-lg">
                    {sizes.map(size => (
                        <Badge
                            key={size}
                            size={size as BadgeVariants["size"]}
                            variant={defaultVariant}
                            color={defaultColor}
                        >
                            Badge {size}
                        </Badge>
                    ))}
                </div>
                <CodeBlock className="mt-2" code={`<Badge size="sm|md|lg">Badge</Badge>`} />
            </div>

            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Couleurs (Color)</h3>
                <div className="flex flex-wrap gap-4 p-4 border border-tertiary rounded-lg">
                    {colors.map(color => (
                        <Badge key={color} color={color!} variant={defaultVariant} size="md">
                            {color}
                        </Badge>
                    ))}
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<Badge color="gray|brand|error|warning|success|blue">Color</Badge>`}
                />
            </div>

            {/* VARIANTES RICHES */}
            <h2 className="text-2xl font-bold mt-10 mb-6">2. Composants Complexes</h2>
            <p className="text-muted-foreground mb-4">
                Ces composants utilisent la même API de base mais encapsulent des éléments
                spécifiques pour un usage plus riche.
            </p>

            {/* BadgeWithDot */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeWithDot (Statut)</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <BadgeWithDot color="success" size="md">
                        En Ligne
                    </BadgeWithDot>
                    <BadgeWithDot color="warning" size="md" variant="color">
                        En Attente
                    </BadgeWithDot>
                    <BadgeWithDot color="error" size="md">
                        Hors Ligne
                    </BadgeWithDot>
                </div>
                <CodeBlock
                    code={`<BadgeWithDot color="success">En Ligne</BadgeWithDot>\n<BadgeWithDot color="warning" variant="color">En Attente</BadgeWithDot>\n<BadgeWithDot color="error" size="md">Hors Ligne</BadgeWithDot>`}
                />
            </div>

            {/* BadgeWithIcon */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeWithIcon</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <BadgeWithIcon leftIcon={User01} color="blue" size="md">
                        Profil
                    </BadgeWithIcon>
                    <BadgeWithIcon rightIcon={ArrowDown} color="gray" size="md" variant="color">
                        Télécharger
                    </BadgeWithIcon>
                    <BadgeWithIcon
                        leftIcon={ShieldDollar}
                        color="success"
                        size="md"
                        variant="modern"
                    >
                        Payé
                    </BadgeWithIcon>
                </div>
                <CodeBlock
                    code={`<BadgeWithIcon leftIcon={UserIcon} color="blue">Profil</BadgeWithIcon>\n<BadgeWithIcon rightIcon={ArrowDown} variant="color">Télécharger</BadgeWithIcon>\n<BadgeWithIcon leftIcon={ShieldDollar} variant="modern">Payé</BadgeWithIcon>`}
                />
            </div>

            {/* BadgeWithFlag & BadgeWithImage */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeWithFlag / BadgeWithImage</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <BadgeWithFlag flag="FR" color="brand" size="md">
                        France
                    </BadgeWithFlag>
                    <BadgeWithImage imgSrc="/images/avatar-1.png" color="gray" size="md">
                        Utilisateur
                    </BadgeWithImage>
                </div>
                <CodeBlock
                    code={`<BadgeWithFlag flag="FR">France</BadgeWithFlag>\n<BadgeWithImage imgSrc="/images/avatar-1.png">Utilisateur</BadgeWithImage>`}
                />
            </div>

            {/* BadgeWithButton */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeWithButton (Jetons/Filtres)</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <BadgeWithButton
                        color="warning"
                        size="md"
                        icon={X}
                        onButtonClick={() => alert("Retiré!")}
                    >
                        Filtre: Urgent
                    </BadgeWithButton>
                    <BadgeWithButton
                        color="error"
                        size="md"
                        variant="color"
                        onButtonClick={() => alert("Supprimé!")}
                    >
                        Erreur #233
                    </BadgeWithButton>
                </div>
                <CodeBlock
                    code={`<BadgeWithButton color="warning" onButtonClick={handleRemove}>Filtre: "Urgent"</BadgeWithButton>`}
                />
            </div>

            {/* BadgeIcon */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeIcon (Icône seule)</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <BadgeIcon icon={Settings01} color="gray" size="md" />
                    <BadgeIcon icon={Mail01} color="brand" size="md" />
                    <BadgeIcon icon={Globe01} color="success" size="md" variant="color" />
                </div>
                <CodeBlock
                    code={`<BadgeIcon icon={Settings} color="gray" size="md" />\n<BadgeIcon icon={Mail} color="brand" size="md" />\n<BadgeIcon icon={Globe01} color="success" size="md" variant="color" />`}
                />
            </div>

            {/* BadgeGroup */}
            <div className="mb-10 p-4 border border-tertiary rounded-lg">
                <h3 className="text-xl font-semibold mb-4">BadgeGroup (Badge avec Addon)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Badge composite avec un élément addon (compteur, action) et alignement
                    configurable.
                </p>

                <div className="space-y-6">
                    {/* Light Theme - Left Align */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Light Theme </h4>
                        <div className="flex flex-col items-start gap-4">
                            <BadgeGroup
                                addonText="New feature"
                                color="gray"
                                theme="light"
                                align="left"
                                size="md"
                            >
                                {"We've just released a new feature"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="New feature"
    color="gray"
    theme="light"
    align="left"
    size="md"
>
    {"We've just released a new feature"}
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="Error"
                                color="error"
                                theme="light"
                                align="left"
                                size="md"
                            >
                                There was a problem with that action
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="Error"
    color="error"
    theme="light"
    align="left"
    size="md"
>
    There was a problem with that action
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="Warning"
                                color="warning"
                                theme="light"
                                align="right"
                                size="lg"
                            >
                                Just to let you know this might be a problem
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="Warning"
    color="warning"
    theme="light"
    align="right"
    size="lg"
>
    Just to let you know this might be a problem
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="Success"
                                color="success"
                                theme="light"
                                align="right"
                                size="lg"
                            >
                                {"You've updated your profile and details"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="Success"
    color="success"
    theme="light"
    align="right"
    size="lg"
>
    {"You've updated your profile and details"}
</BadgeGroup>`}
                            />
                        </div>
                    </div>

                    {/* Modern Theme - Left Align */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Modern Theme</h4>
                        <div className="flex flex-col items-start gap-4">
                            <BadgeGroup
                                addonText="New feature"
                                color="gray"
                                theme="modern"
                                align="left"
                                size="md"
                            >
                                {"We've just released a new feature"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="New feature"
    color="gray"
    theme="modern"
    align="left"
    size="md"
>
    {"We've just released a new feature"}
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="New feature"
                                color="brand"
                                theme="modern"
                                align="left"
                                size="md"
                            >
                                {"We've just released a new feature"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="New feature"
    color="brand"
    theme="modern"
    align="left"
    size="md"
>
    {"We've just released a new feature"}
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="Error"
                                color="error"
                                theme="modern"
                                align="right"
                                size="lg"
                            >
                                {"There was a problem with that action"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="Error"
    color="error"
    theme="modern"
    align="right"
    size="lg"
>
    {"There was a problem with that action"}
</BadgeGroup>`}
                            />
                            <BadgeGroup
                                addonText="Success"
                                color="success"
                                theme="modern"
                                align="right"
                                size="lg"
                            >
                                {" You've updated your profile and details"}
                            </BadgeGroup>
                            <CodeBlock
                                code={`
<BadgeGroup
    addonText="Success"
    color="success"
    theme="modern"
    align="right"
    size="lg"
>
    {" You've updated your profile and details"}
</BadgeGroup>`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* API REFERENCE */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mt-10 mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Component</th>
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Universal Props */}
                            <tr className="border-b border-tertiary bg-secondary/20">
                                <td className="py-2 px-4 font-mono font-medium text-lg" colSpan={4}>
                                    Universal Props (valid for all badges):
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">All</td>
                                <td className="py-2 px-4 font-mono text-sm">variant?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'pill-color' | 'color' | 'modern'`}
                                </td>
                                <td className="py-2 px-4">Badge shape/style variant.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">All</td>
                                <td className="py-2 px-4 font-mono text-sm">color?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'gray' | 'brand' | 'error' | 'warning' | 'success' | 'blue' `}
                                </td>
                                <td className="py-2 px-4">The badge thematic color.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">All</td>
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'sm' | 'md' | 'lg'`}</td>
                                <td className="py-2 px-4">The badge size.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">All</td>
                                <td className="py-2 px-4 font-mono text-sm">asChild?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`boolean`}</td>
                                <td className="py-2 px-4">
                                    Allows using a different component as the root element.
                                </td>
                            </tr>

                            {/* Specific Props */}
                            <tr className="border-b border-tertiary bg-secondary/20">
                                <td className="py-2 px-4 font-mono font-medium text-lg" colSpan={4}>
                                    Variant-Specific Props:
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithIcon</td>
                                <td className="py-2 px-4 font-mono text-sm">iconLeading?</td>
                                <td className="py-2 px-4 font-mono text-sm">IconComponentType</td>
                                <td className="py-2 px-4">Icon displayed before the text.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithIcon</td>
                                <td className="py-2 px-4 font-mono text-sm">iconTrailing?</td>
                                <td className="py-2 px-4 font-mono text-sm">IconComponentType</td>
                                <td className="py-2 px-4">Icon displayed after the text.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeIcon</td>
                                <td className="py-2 px-4 font-mono text-sm">icon</td>
                                <td className="py-2 px-4 font-mono text-sm">IconComponentType</td>
                                <td className="py-2 px-4">Central icon (required).</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithFlag</td>
                                <td className="py-2 px-4 font-mono text-sm">flag?</td>
                                <td className="py-2 px-4 font-mono text-sm">FlagTypes</td>
                                <td className="py-2 px-4">
                                    Country code to display a flag (e.g., &quot;FR&quot;).
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithImage</td>
                                <td className="py-2 px-4 font-mono text-sm">imgSrc</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4">
                                    URL of the image (avatar, logo) to display.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithButton</td>
                                <td className="py-2 px-4 font-mono text-sm">onButtonClick?</td>
                                <td className="py-2 px-4 font-mono text-sm">MouseEventHandler</td>
                                <td className="py-2 px-4">Click handler for the removal button.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeWithButton</td>
                                <td className="py-2 px-4 font-mono text-sm">buttonLabel?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4">(Accessible) label for the button.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeGroup</td>
                                <td className="py-2 px-4 font-mono text-sm">addonText</td>
                                <td className="py-2 px-4 font-mono text-sm">string | ReactNode</td>
                                <td className="py-2 px-4">
                                    Content of the addon section (required).
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeGroup</td>
                                <td className="py-2 px-4 font-mono text-sm">theme?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'light' | 'modern'`}</td>
                                <td className="py-2 px-4">Visual theme of the badge group.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeGroup</td>
                                <td className="py-2 px-4 font-mono text-sm">align?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'left' | 'right'`}</td>
                                <td className="py-2 px-4">Position of the addon section.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">BadgeGroup</td>
                                <td className="py-2 px-4 font-mono text-sm">rightIcon?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    IconComponentType | ReactNode
                                </td>
                                <td className="py-2 px-4">Optional trailing icon.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
