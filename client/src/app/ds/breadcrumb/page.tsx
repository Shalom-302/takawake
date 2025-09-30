"use client";
import * as React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
// Assurez-vous que ce chemin d'importation est correct

import { CodeBlock } from "@/ds/components";

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
                    la réduction des éléments (**ellipsis interactive**) pour les chemins longs,
                    ainsi que les **menus déroulants** dans les items.
                </p>
            </div>

            {/* Exemple de base simple */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Exemple de base</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <SimpleBaseBreadcrumbExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`// Sans collapse
<Breadcrumb 
    items={[        
        { href: "/home", label: "Home" },        
        { href: "/docs", label: "Documentation" },        
        { label: "Breadcrumb" }
    ]}    
    variant="text"    
    separator="icon"
    showHomeIcon={false}
/>`}
                    />
                </div>
            </div>

            {/* Ellipsis example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Avec Ellipsis (Chemin long)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <LongPathBreadcrumbExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const longItems = [/* ... 6 éléments */];

<Breadcrumb 
    items={longItems} // 6 éléments > maxItems=4
    maxItems={4} 
    separator="icon" 
/>
`}
                    />
                </div>
            </div>

            {/* Dropdown in Item example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                    Breadcrumb avec Menu Déroulant (Dropdown)
                </h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <DropdownBreadcrumbDemo />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`// Ceci doit être dans un fichier marqué "use client"
const itemsWithDropdown = [
    { href: "/home", label: "Accueil" },
    { 
        label: "Sections",
        dropdown: { 
            items: [
                { href: "/produits", label: "Tous les produits" },
                { label: "Promotions", onClick: () => console.log(...) }, // Fonction
            ]
        },
    },
    // ... suite du chemin
];
<Breadcrumb items={itemsWithDropdown} showHomeIcon={false} />
`}
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variantes de Style et Séparateur</h2>
                <div className="grid grid-cols-1 gap-6">
                    {/* Variant Text / Icon */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <DefaultBreadcrumbExample />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Breadcrumb items={items} variant="text" separator="icon" />`}
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
                            code={`<Breadcrumb items={items} variant="button" separator="slash" />`}
                        />
                    </div>
                    {/* Variant Text-Line / Icon */}
                    <div className="p-4 border border-tertiary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            <strong>Type: text-line, Separator: icon</strong>
                        </p>
                        <div className="mb-4">
                            <TextLineBreadcrumbExample />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Breadcrumb items={items} variant="text-line" separator="icon" />`}
                        />
                    </div>
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Breadcrumb Props</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Prop</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">items</td>
                                    <td className="py-2 px-4 text-sm">BreadcrumbItemData[]</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        The array of navigation elements.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">maxItems?</td>
                                    <td className="py-2 px-4 text-sm">number</td>
                                    <td className="py-2 px-4 text-sm">4</td>
                                    <td className="py-2 px-4 text-sm">
                                        The maximum number of `items` to display before activating
                                        the reduction ellipsis.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">variant?</td>
                                    <td className="py-2 px-4 text-sm">{`'text' | 'text-line' | 'button'`}</td>
                                    <td className="py-2 px-4 text-sm">{`'text'`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        The style of the items: text link (`text`), text with
                                        separator line (`text-line`), or button (`button`).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">separator?</td>
                                    <td className="py-2 px-4 text-sm">{`'icon' | 'slash' | React.ReactNode`}</td>
                                    <td className="py-2 px-4 text-sm">{`'icon'`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        The separator variant between items.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">showHomeIcon?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">true</td>
                                    <td className="py-2 px-4 text-sm">
                                        Displays or hides the Home icon at the beginning of the
                                        breadcrumb trail.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">showEllipsisDropdown?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">true</td>
                                    <td className="py-2 px-4 text-sm">
                                        If `true`, the ellipsis is a clickable dropdown menu
                                        displaying hidden links.
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
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">label</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        The text displayed for the item.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">href?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        The destination URL. If omitted and there is no `dropdown`,
                                        the item is rendered as the current page (non-clickable).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">dropdown?</td>
                                    <td className="py-2 px-4 text-sm">{`{ items: Array<{ label: string; href?: string; onClick?: () => void }> }`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        Object to create an integrated dropdown menu for this item.
                                        The item becomes clickable to open this menu.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Custom Components */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                        Custom Components with BreadcrumbCustom
                    </h3>
                    <p className="text-sm text-seconary mb-4">For advanced customization:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                            <code className="bg-gray-100 px-1 rounded">BreadcrumbCustom.Root</code>-
                            Container wrapper
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">BreadcrumbCustom.List</code>-
                            Items wrapper
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">BreadcrumbCustom.Item</code>-
                            Individual breadcrumb item container
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">BreadcrumbCustom.Link</code>-
                            Breadcrumb item component used to display a link
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">BreadcrumbCustom.Page</code>-
                            Breadcrumb item component used to display the current/last item
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">
                                BreadcrumbCustom.Separator
                            </code>
                            - Breadcrumb separator component
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">
                                BreadcrumbCustom.Ellipsis
                            </code>
                            - Breadcrumb ellipsis component used when reducing the number of shown
                            items
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function DropdownBreadcrumbDemo() {
    // Les fonctions onClick sont définies ici, dans le Client Component
    const dropdownItems = [
        { href: "/produits", label: "Tous les produits" },
        { label: "Promotions", onClick: () => alert("Promotion cliquée!") },
    ];

    const itemsWithDropdown = [
        { href: "/home", label: "Accueil" },
        {
            label: "Sections",
            dropdown: { items: dropdownItems },
        },
        { href: "/services", label: "Services" },
        { label: "Détails du service" },
    ];

    return (
        <Breadcrumb items={itemsWithDropdown} maxItems={4} separator="icon" showHomeIcon={false} />
    );
}

// Exemple de base simple (court, sans collapsage)
function SimpleBaseBreadcrumbExample() {
    return (
        <Breadcrumb
            items={[
                { href: "/home", label: "Home" },
                { href: "/docs", label: "Documentation" },
                { label: "Breadcrumb" },
            ]}
            variant="text"
            separator="icon"
            showHomeIcon={false}
        />
    );
}

// Données standard pour les variantes et le collapsage
const demoItems = [
    { href: "/produits", label: "Produits" },
    { href: "/categories/electronique", label: "Électronique" },
    { href: "/laptops", label: "Ordinateurs Portables" },
    { label: "Modèle UltraSlim Pro X1" }, // Page actuelle
];

// Exemple utilisé dans la section Variantes
function DefaultBreadcrumbExample() {
    return <Breadcrumb items={demoItems} maxItems={4} separator="icon" />;
}

// Exemple de variante Button / Slash
function ButtonSeparatorBreadcrumbExample() {
    return <Breadcrumb items={demoItems} maxItems={5} variant="button" separator="slash" />;
}

// Exemple de variante Text-Line
function TextLineBreadcrumbExample() {
    return <Breadcrumb items={demoItems} maxItems={5} variant="text-line" separator="icon" />;
}

// Exemple de chemin long avec Ellipsis (Dropdown par défaut)
function LongPathBreadcrumbExample() {
    const longItems = [
        { href: "/a", label: "Niveau A" },
        { href: "/b", label: "Niveau B" },
        { href: "/c", label: "Niveau C" },
        { href: "/d", label: "Niveau D" },
        { href: "/e", label: "Niveau E" },
        { label: "Niveau Final" },
    ];
    return <Breadcrumb items={longItems} maxItems={4} separator="icon" />;
}
