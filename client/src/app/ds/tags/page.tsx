"use client";

import { CodeBlock } from "@/components/ui/code-block";
import { Tags, TagsCustom } from "@/components/ui/tags";
import React, { useState } from "react";
import Link from "next/link";

export default function TagsDocumentationPage() {
    const [selectedMultiple, setSelectedMultiple] = useState(new Set(["1", "3"]));
    const [selectedSingle, setSelectedSingle] = useState(new Set(["2"]));
    const [uncontrolledTags, setUncontrolledTags] = useState([
        { id: "1", label: "Design" },
        { id: "2", label: "Marketing" },
        { id: "3", label: "Development" },
    ]);

    const handleRemoveTag = (id: string) => {
        setUncontrolledTags(prev => prev.filter(tag => tag.id !== id));
    };

    // Définitions des items pour les exemples
    const baseItems = [
        { id: "1", label: "Design" },
        { id: "2", label: "Marketing" },
        { id: "3", label: "Development" },
        { id: "4", label: "Sales" },
    ];

    const itemsWithVisuals = [
        { id: "1", label: "John Doe", avatarSrc: "/avatars/john.jpg" },
        { id: "2", label: "Jane Smith", avatarSrc: "/avatars/jane.jpg" },
        { id: "3", label: "Active", dot: true },
        { id: "4", label: "Marketing", count: 24 },
    ];

    const { Group, List, Tag } = TagsCustom;

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Retour au Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Tags</h1>
                <p className="text-muted-foreground mt-2">
                    Composant flexible pour afficher des étiquettes (labels, filtres, membres) avec
                    support de sélection, avatars, compteurs et actions.
                </p>
            </div>

            {/* Base example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Exemple de base</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Tags label="Catégories" size="md" items={baseItems} />
                    </div>
                    <CodeBlock
                        code={`<Tags
  label="Catégories"
  size="md"
  items={[
    { id: "1", label: "Design" },
    { id: "2", label: "Marketing" },
    { id: "3", label: "Development" },
    { id: "4", label: "Sales" }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Tailles</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Le composant Tags supporte trois tailles : <strong>sm</strong>,{" "}
                        <strong>md</strong>, <strong>lg</strong>
                    </p>
                    <div className="space-y-4 mb-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-muted-foreground">Small :</span>
                            <Tags label="Small tags" size="sm" items={baseItems.slice(0, 3)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-muted-foreground">Medium :</span>
                            <Tags label="Medium tags" size="md" items={baseItems.slice(0, 3)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-muted-foreground">Large :</span>
                            <Tags label="Large tags" size="lg" items={baseItems.slice(0, 3)} />
                        </div>
                    </div>
                    <CodeBlock
                        code={`<Tags label="Small" size="sm" items={[...]} />
<Tags label="Medium" size="md" items={[...]} />
<Tags label="Large" size="lg" items={[...]} />`}
                    />
                </div>
            </div>

            {/* With Avatar, Dot, Count */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Contenu visuel & compteur</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Les tags peuvent afficher des avatars, des points de statut et des badges de
                        compteur.
                    </p>
                    <div className="mb-4">
                        <Tags label="Tags visuels" size="md" items={itemsWithVisuals} />
                    </div>
                    <CodeBlock
                        code={`<Tags
  label="Tags visuels"
  size="md"
  items={[
    { id: "1", label: "John Doe", avatarSrc: "/avatars/john.jpg" },
    { id: "2", label: "Jane Smith", avatarSrc: "/avatars/jane.jpg" },
    { id: "3", label: "Active", dot: true },
    { id: "4", label: "Marketing", count: 24 }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* With Close Button */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Bouton de fermeture</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Le bouton de fermeture apparaît lorsque <code>onClose</code> ou{" "}
                        <code>allowsRemoving</code> est défini.
                    </p>
                    <div className="mb-4">
                        <Tags
                            label="Tags amovibles"
                            size="md"
                            items={uncontrolledTags.map(tag => ({
                                ...tag,
                                onClose: handleRemoveTag,
                            }))}
                        />
                    </div>
                    <CodeBlock
                        code={`const [tags, setTags] = useState([
  { id: "1", label: "Design" },
  { id: "2", label: "Marketing" },
  { id: "3", label: "Development" }
]);

const handleRemove = (id: string) => {
  setTags(prev => prev.filter(tag => tag.id !== id));
};

<Tags
  label="Tags amovibles"
  size="md"
  items={tags.map(tag => ({
    ...tag,
    onClose: handleRemove
  }))}
/>`}
                    />
                </div>
            </div>

            {/* Selection Mode - Multiple */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sélection multiple (contrôlée)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>Mode: multiple</strong> - IDs sélectionnés:{" "}
                        <strong>{Array.from(selectedMultiple).join(", ") || "Aucun"}</strong>
                    </p>
                    <div className="mb-4">
                        <Tags
                            label="Catégories multi-sélection"
                            size="md"
                            selectionMode="multiple"
                            selectedIds={selectedMultiple}
                            onSelectionChange={setSelectedMultiple}
                            items={baseItems}
                        />
                    </div>
                    <CodeBlock
                        code={`const [selected, setSelected] = useState(new Set(["1", "3"]));

<Tags
  label="Catégories"
  size="md"
  selectionMode="multiple"
  selectedIds={selected}
  onSelectionChange={setSelected}
  items={[
    { id: "1", label: "Design" },
    { id: "2", label: "Marketing" },
    { id: "3", label: "Development" },
    { id: "4", label: "Sales" }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Selection Mode - Single */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sélection unique (contrôlée)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>Mode: single</strong> - ID sélectionné:{" "}
                        <strong>{Array.from(selectedSingle).join("") || "Aucun"}</strong>
                    </p>
                    <div className="mb-4">
                        <Tags
                            label="Options mono-sélection"
                            size="md"
                            selectionMode="single"
                            selectedIds={selectedSingle}
                            onSelectionChange={setSelectedSingle}
                            disallowEmptySelection
                            items={[
                                { id: "1", label: "Option 1" },
                                { id: "2", label: "Option 2" },
                                { id: "3", label: "Option 3" },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        code={`const [selected, setSelected] = useState(new Set(["2"]));

<Tags
  label="Options"
  size="md"
  selectionMode="single"
  selectedIds={selected}
  onSelectionChange={setSelected}
  disallowEmptySelection // Empêche la désélection
  items={[
    { id: "1", label: "Option 1" },
    { id: "2", label: "Option 2" },
    { id: "3", label: "Option 3" }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Uncontrolled Mode */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Mode non contrôlé</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Le composant peut gérer son propre état sans <code>selectedIds</code>/
                        <code>onSelectionChange</code>.
                    </p>
                    <div className="mb-4">
                        <Tags
                            label="Sélection non contrôlée"
                            size="md"
                            selectionMode="multiple"
                            items={baseItems}
                        />
                    </div>
                    <CodeBlock
                        code={`// Pas besoin de useState pour la sélection
<Tags
  label="Sélection non contrôlée"
  size="md"
  selectionMode="multiple"
  items={[
    { id: "1", label: "Design" },
    { id: "2", label: "Marketing" },
    { id: "3", label: "Development" }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">États désactivés</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Tags
                            label="Tags désactivés"
                            size="md"
                            items={[
                                { id: "1", label: "Actif" },
                                { id: "2", label: "Désactivé", isDisabled: true },
                                { id: "3", label: "Actif" },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        code={`<Tags
  label="Catégories"
  size="md"
  items={[
    { id: "1", label: "Actif" },
    { id: "2", label: "Désactivé", isDisabled: true },
    { id: "3", label: "Actif" }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Usage Avancé (TagsCustom) */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Utilisation avancée (TagsCustom)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Utilisez les composants individuels exportés via{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">TagsCustom</code>{" "}
                        pour une composition sur mesure.
                    </p>
                    <div className="mb-4">
                        <Group label="Exemple custom" size="md" selectionMode="multiple">
                            <List className="gap-4">
                                <Tag id="1" count={5}>
                                    Design
                                </Tag>
                                <Tag id="2" avatarSrc="/avatar.jpg">
                                    John Doe
                                </Tag>
                                <Tag id="3" dot onClose={id => console.log(id)}>
                                    Actif
                                </Tag>
                            </List>
                        </Group>
                    </div>
                    <CodeBlock
                        code={`import { TagsCustom } from "@/components/ui/tags";
const { Group, List, Tag } = TagsCustom;

<Group label="Catégories" size="md" selectionMode="multiple">
  <List className="gap-4">
    <Tag id="1" count={5}>Design</Tag>
    <Tag id="2" avatarSrc="/avatar.jpg">John Doe</Tag>
    <Tag id="3" dot onClose={(id) => console.log(id)}>
      Actif
    </Tag>
  </List>
</Group>`}
                    />
                </div>
            </div>

            {/* API Reference - Tags */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="text-left py-2 px-4">Props</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">label</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Label accessible pour le groupe de tags
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">items</td>
                                <td className="py-2 px-4 text-sm font-mono">TagItem[]</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Tableau d&apos;objets définissant les tags
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">size?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;
                                </td>
                                <td className="py-2 px-4 text-sm">&quot;sm&quot;</td>
                                <td className="py-2 px-4 text-sm">Taille des tags</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">selectionMode?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    &quot;none&quot; | &quot;single&quot; | &quot;multiple&quot;
                                </td>
                                <td className="py-2 px-4 text-sm">&quot;none&quot;</td>
                                <td className="py-2 px-4 text-sm">Mode de sélection des tags</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">selectedIds?</td>
                                <td className="py-2 px-4 text-sm font-mono">Set&lt;string&gt;</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    IDs des tags sélectionnés (mode contrôlé)
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onSelectionChange?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    (ids: Set&lt;string&gt;) =&gt; void
                                </td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Callback appelé lors du changement de sélection
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">disallowEmptySelection?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Empêche la désélection du dernier élément
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">listClassName?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Classes CSS pour la liste de tags
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Reference - TagItem */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold mb-3">TagItem</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="text-left py-2 px-4">Props</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">id</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Identifiant unique du tag</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">label</td>
                                <td className="py-2 px-4 text-sm font-mono">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Contenu principal du tag</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">avatarSrc?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    URL de l&apos;avatar à afficher
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">avatarContrastBorder?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Bordure de contraste pour l&apos;avatar
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">dot?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">Affiche un point de statut</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">dotClassName?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Classes CSS pour le point</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">count?</td>
                                <td className="py-2 px-4 text-sm font-mono">number</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Badge de compteur</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">isDisabled?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">Désactive l&apos;interaction</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onClose?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    (id: string) =&gt; void
                                </td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Callback appelé lors de la fermeture
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">allowsRemoving?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Affiche le bouton de fermeture sans callback
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Keyboard Navigation */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Navigation au clavier</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        Le composant est entièrement navigable et interactif via le clavier,
                        conformément aux standards ARIA.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Touche</th>
                                    <th className="text-left py-2 px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">Tab</td>
                                    <td className="py-2 px-4 text-sm">
                                        Déplace le focus vers le prochain tag
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">Shift + Tab</td>
                                    <td className="py-2 px-4 text-sm">
                                        Déplace le focus vers le tag précédent
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">Flèche droite</td>
                                    <td className="py-2 px-4 text-sm">
                                        Navigue vers le tag suivant (circulaire)
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">Flèche gauche</td>
                                    <td className="py-2 px-4 text-sm">
                                        Navigue vers le tag précédent (circulaire)
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">Enter / Espace</td>
                                    <td className="py-2 px-4 text-sm">
                                        Sélectionne/désélectionne le tag (en mode sélection)
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-mono text-sm">
                                        Delete / Backspace
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        Ferme le tag si <code>onClose</code> est défini
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
