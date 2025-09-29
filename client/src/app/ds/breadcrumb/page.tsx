import * as React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CodeBlock } from "@/ds/components";

const demoItems = [
    { href: "/produits", label: "Produits" },
    { href: "/categories/electronique", label: "Électronique" },
    { href: "/laptops", label: "Ordinateurs Portables" },
    { label: "Modèle UltraSlim Pro X1" }, // Page actuelle
];

const BaseBreadcrumbExample = () => <Breadcrumb items={demoItems} maxItems={4} separator="icon" />;

const ButtonSeparatorBreadcrumbExample = () => (
    <Breadcrumb items={demoItems} maxItems={5} type="button" separator="slash" />
);

const LongPathBreadcrumbExample = () => {
    const longItems = [
        { href: "/a", label: "Niveau A" },
        { href: "/b", label: "Niveau B" },
        { href: "/c", label: "Niveau C" },
        { href: "/d", label: "Niveau D" },
        { href: "/e", label: "Niveau E" },
        { label: "Niveau Final" },
    ];
    return <Breadcrumb items={longItems} maxItems={4} separator="icon" />;
};

export default function BreadcrumbPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Breadcrumb</h1>
                <p className="text-muted-foreground mt-2">
                    Un composant de navigation hiérarchique qui indique la position de
                    l&apos;utilisateur. Il inclut automatiquement l&apos;icône **Home** et supporte
                    la réduction des éléments (ellipsis) pour les chemins longs.
                </p>
            </div>

            {/* Base example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Exemple de base et avec Ellipsis</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <LongPathBreadcrumbExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const items = [
    { href: "/a", label: "Niveau A" },
    { href: "/b", label: "Niveau B" },
    { href: "/c", label: "Niveau C" },
    { href: "/d", label: "Niveau D" },
    { href: "/e", label: "Niveau E" },
    { label: "Niveau Final" }, // 6 éléments
];

<Breadcrumb 
    items={items} // 6 éléments > maxItems=4
    maxItems={4} 
    separator="icon" 
/>

`}
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variantes de Style et Séparateur</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Variant Text / Icon */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            <strong>Type: text, Separator: icon</strong> (Défaut)
                        </p>
                        <div className="mb-4">
                            <BaseBreadcrumbExample />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Breadcrumb items={items} type="text" separator="icon" />`}
                        />
                    </div>
                    {/* Variant Button / Slash */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            <strong>Type: button, Separator: slash</strong>
                        </p>
                        <div className="mb-4">
                            <ButtonSeparatorBreadcrumbExample />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Breadcrumb items={items} type="button" separator="slash" />`}
                        />
                    </div>
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>

                {/* Breadcrumb Props */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Breadcrumb Props</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Prop</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Défaut</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">items</td>
                                    <td className="py-2 px-4 text-sm">BreadcrumbItemData[]</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        **Requis.** Le tableau des éléments de navigation. Le lien
                                        Home est géré en interne.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">maxItems?</td>
                                    <td className="py-2 px-4 text-sm">number</td>
                                    <td className="py-2 px-4 text-sm">4</td>
                                    <td className="py-2 px-4 text-sm">
                                        Le nombre maximum d'éléments de `items` à afficher avant
                                        d'activer l'ellipse.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">type?</td>
                                    <td className="py-2 px-4 text-sm">{`'text' | 'button'`}</td>
                                    <td className="py-2 px-4 text-sm">{`'text'`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        Le style des éléments : lien texte (`text`) ou bouton
                                        (`button`).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">separator?</td>
                                    <td className="py-2 px-4 text-sm">{`'icon' | 'slash'`}</td>
                                    <td className="py-2 px-4 text-sm">{`'icon'`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        Le type de séparateur entre les éléments (`icon` pour
                                        ChevronRight ou `slash` pour `/`).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onEllipsisClick?</td>
                                    <td className="py-2 px-4 text-sm">{`() => React.ReactNode`}</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Fonction appelée pour rendre l'élément d'ellipse (`...`)
                                        lorsque le chemin est réduit.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BreadcrumbItemData Type */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Type: BreadcrumbItemData</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Clé</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">label</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        **Requis.** Le texte affiché pour l'élément.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">href?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        L'URL de destination. Si elle est omise, l'élément est rendu
                                        comme la page actuelle (non cliquable).
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BreadcrumbComposition Type */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                        Composition (BreadcrumbComposition)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Composant</th>
                                    <th className="text-left py-2 px-4">Rôle</th>
                                    <th className="text-left py-2 px-4">Élément Rendu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Root</td>
                                    <td className="py-2 px-4 text-sm">
                                        Conteneur sémantique principal
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`<nav aria-label="breadcrumb">`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">List</td>
                                    <td className="py-2 px-4 text-sm">Liste des éléments</td>
                                    <td className="py-2 px-4 text-sm">{`<ol>`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Item</td>
                                    <td className="py-2 px-4 text-sm">
                                        Conteneur d'un élément (prend la prop `type`)
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`<li>`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Link</td>
                                    <td className="py-2 px-4 text-sm">Lien cliquable</td>
                                    <td className="py-2 px-4 text-sm">{`<a> (ou Link avec asChild)`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Page</td>
                                    <td className="py-2 px-4 text-sm">
                                        Page actuelle (non cliquable)
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`<span>`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Separator</td>
                                    <td className="py-2 px-4 text-sm">Séparateur d'éléments</td>
                                    <td className="py-2 px-4 text-sm">{`<li> (avec icône ou /)`}</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">Ellipsis</td>
                                    <td className="py-2 px-4 text-sm">
                                        Icône par défaut de réduction (`...`)
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`<span> (avec DotsHorizontal)`}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
