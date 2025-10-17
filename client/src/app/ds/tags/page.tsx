"use client";
import { CodeBlock } from "@/components/ui/code-block";
import { Tags, TagsCustom } from "@/components/ui/tags";
import React, { useState } from "react";

// ----------------------------------------------------------------------
// DÉBUT DE LA PAGE DE DOCUMENTATION
// ----------------------------------------------------------------------

const TagsDocumentationPage = () => {
    const [selectedMultiple, setSelectedMultiple] = useState(new Set(["1", "3"]));
    const [selectedSingle, setSelectedSingle] = useState(new Set(["2"]));

    // Définitions des items pour les exemples
    const baseItems = [
        { id: "1", label: "Design" },
        { id: "2", label: "Marketing" },
        { id: "3", label: "Development" },
        { id: "4", label: "Sales" },
    ];

    const itemsWithVisuals = [
        { id: "1", label: "John Doe", avatarSrc: "/avatars/john.jpg", hasAvatar: true },
        { id: "2", label: "Jane Smith", avatarSrc: "/avatars/jane.jpg", hasAvatar: true },
        { id: "3", label: "Active", dot: true },
        { id: "4", label: "Marketing", count: 24 },
    ];

    const removableItems = [
        { id: "1", label: "Design", onClose: id => console.log("Remove", id) },
        { id: "2", label: "Marketing", onClose: id => console.log("Remove", id) },
        { id: "3", label: "Development", onClose: id => console.log("Remove", id) },
    ];

    // Pour l'exemple TagsCustom
    const { Group, List, Tag } = TagsCustom;

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-8">
                <a href="/ds" className="hover:underline mb-4 inline-block">
                    ← Retour au Design System
                </a>
                <h1 className="text-3xl font-bold mt-2">Composant Tags</h1>
                <p className="text-secondary mt-2">
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
    // ...
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Tailles</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-secondary mb-4">
                        Le composant Tags supporte trois tailles :
                    </p>
                    <div className="space-y-4 mb-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500">Small :</span>
                            <Tags label="Small tags" size="sm" items={baseItems.slice(0, 3)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500">Medium :</span>
                            <Tags label="Medium tags" size="md" items={baseItems.slice(0, 3)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500">Large :</span>
                            <Tags label="Large tags" size="lg" items={baseItems.slice(0, 3)} />
                        </div>
                    </div>
                    <CodeBlock
                        code={`
<Tags label="Small" size="sm" items={[...]} />
<Tags label="Medium" size="md" items={[...]} />
<Tags label="Large" size="lg" items={[...]} />`}
                    />
                </div>
            </div>

            {/* With Avatar, Dot, Count */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Contenu Visuel & Compteur</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Tags label="Tags visuels" size="md" items={itemsWithVisuals} />
                    </div>
                    <CodeBlock
                        code={`<Tags
  label="Tags visuels"
  size="md"
  items={[
    { id: "1", label: "John Doe", avatarSrc: "/avatars/john.jpg" },
    { id: "3", label: "Active", dot: true },
    { id: "4", label: "Marketing", count: 24 }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* With Close Button */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Bouton de Fermeture</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Tags label="Tags amovibles" size="md" items={removableItems} />
                    </div>
                    <CodeBlock
                        code={`<Tags
  label="Tags amovibles"
  size="md"
  items={[
    { id: "1", label: "Design", onClose: (id) => console.log('Remove', id) },
    // ...
  ]}
/>
// Note : Le bouton de fermeture apparaît si 'onClose' ou 'allowsRemoving' est défini.`}
                    />
                </div>
            </div>

            {/* Selection Mode - Multiple */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sélection Multiple (Contrôlée)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-secondary mb-4">
                        **Mode: multiple** — IDs sélectionnés: **
                        {Array.from(selectedMultiple).join(", ")}**
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
  selectionMode="multiple"
  selectedIds={selected}
  onSelectionChange={setSelected}
  items={[...]}
/>`}
                    />
                </div>
            </div>

            {/* Selection Mode - Single */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sélection Unique (Contrôlée)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-secondary mb-4">
                        **Mode: single** — ID sélectionné: **
                        {Array.from(selectedSingle).join("") || "Aucun"}**
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
  selectionMode="single"
  selectedIds={selected}
  onSelectionChange={setSelected}
  disallowEmptySelection // Empêche la désélection
  items={[...]}
/>`}
                    />
                </div>
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">États Désactivés</h2>
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
  items={[
    { id: "2", label: "Désactivé", isDisabled: true },
    // ...
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Usage Avancé (TagsCustom) */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Utilisation Avancée (TagsCustom)</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-secondary mb-4">
                        Utilisez les composants individuels exportés via{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">TagsCustom</code>{" "}
                        pour une composition sur mesure.
                    </p>
                    <div className="mb-4 flex flex-wrap gap-4">
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

            {/* --- */}

            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Référence API / API Reference</h2>

                <h3 className="text-xl font-semibold mb-3">Tags (Composant Wrapper)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="text-left py-2 px-4">Propriété / Prop</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Défaut / Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">label</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    **Obligatoire** : Label accessible pour le groupe de tags. /
                                    **Required**: Accessible label for the tag group.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">items</td>
                                <td className="py-2 px-4 text-sm font-mono">TagItem[]</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Tableau d&apos;objets définissant les tags. / Array of objects
                                    defining the tags to display.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">size?</td>
                                <td className="py-2 px-4 text-sm font-mono">{`"sm" | "md" | "lg"`}</td>
                                <td className="py-2 px-4 text-sm">{`"sm"`}</td>
                                <td className="py-2 px-4 text-sm">
                                    Taille des tags. / Size of the tags.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">selectionMode?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    {`"none" | "single" | "multiple"`}
                                </td>
                                <td className="py-2 px-4 text-sm">{`"none"`}</td>
                                <td className="py-2 px-4 text-sm">
                                    Mode de sélection des tags. / Tag selection mode.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">selectedIds?</td>
                                <td className="py-2 px-4 text-sm font-mono">Set&lt;string&gt;</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    IDs des tags sélectionnés (mode contrôlé). / Selected tag IDs
                                    (controlled mode).
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">onSelectionChange?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    (ids: Set&lt;string&gt;) =&gt; void
                                </td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Callback appelé lors du changement de sélection. / Callback
                                    fired when selection changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">disallowEmptySelection?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Empêche la désélection du dernier élément. / Prevents
                                    deselection of the last item.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">listClassName?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Classes CSS pour la flexbox qui enveloppe les tags. / CSS
                                    classes for the tag list wrapper.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                    TagItem (Propriétés pour chaque Tag)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="text-left py-2 px-4">Propriété / Prop</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Défaut / Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">id</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    **Obligatoire** : Identifiant unique du tag. / **Required**:
                                    Unique identifier for the tag.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">label</td>
                                <td className="py-2 px-4 text-sm font-mono">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Contenu principal du tag. / Main content of the tag.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">avatarSrc?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    URL de l&apos;avatar à afficher à gauche. / URL of the avatar to
                                    display on the left.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">avatarContrastBorder?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Ajoute une bordure contrastée autour de l&apos;avatar. / Adds a
                                    contrast border around the avatar.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">dot?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Affiche un point de statut à gauche. / Displays a status dot on
                                    the left.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">dotClassName?</td>
                                <td className="py-2 px-4 text-sm font-mono">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Classes CSS pour le point (ex: couleur). / CSS classes for the
                                    dot (e.g., color).
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">count?</td>
                                <td className="py-2 px-4 text-sm font-mono">number</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Valeur à afficher dans le badge de compteur à droite. / Value to
                                    display in the count badge on the right.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">isDisabled?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Désactive l&apos;interaction pour ce tag spécifique. / Disables
                                    interaction for this specific tag.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">onClose?</td>
                                <td className="py-2 px-4 text-sm font-mono">
                                    (id: string) =&gt; void
                                </td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Callback appelé lorsque le bouton de fermeture est cliqué.
                                    Affiche le bouton &apos;X&apos;. / Callback fired when the close
                                    button is clicked. Displays the &apos;X&apos; button.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-bold">allowsRemoving?</td>
                                <td className="py-2 px-4 text-sm font-mono">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Affiche le bouton de fermeture sans fonction `onClose` si la
                                    suppression est gérée par le parent. / Displays the close button
                                    without `onClose` if removal is parent-controlled.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TagsDocumentationPage;
