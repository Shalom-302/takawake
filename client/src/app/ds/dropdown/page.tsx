"use client";

import React from "react";
import Link from "next/link";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { DropdownDotsButton } from "@/components/ui/dropdown-menu";

export default function DropdownPage() {
    const [theme, setTheme] = React.useState("light");
    const [showNotifications, setShowNotifications] = React.useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Retour au Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Dropdown</h1>
                <p className="text-muted-foreground mt-2">
                    Un menu déroulant qui s&apos;affiche au clic, avec une API simplifiée pour une
                    utilisation plus facile.
                </p>
            </div>

            {/* Exemple de base */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Exemple de base</h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <div className="mb-4">
                        <DropdownMenu
                            trigger={<Button>Menu</Button>}
                            items={[
                                { id: "edit", label: "Modifier" },
                                { id: "duplicate", label: "Dupliquer" },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        code={`
<DropdownMenu
  trigger={<Button>Menu</Button>}
  items={[
    { id: "edit", label: "Modifier" },
    { id: "duplicate", label: "Dupliquer" },
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Exemple avec séparateur */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                    Avec séparateur et action destructive
                </h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <DropdownMenu
                        trigger={<Button variant="secondary">Actions</Button>}
                        contentClassName="min-w-[120px]"
                        items={[
                            { id: "edit", label: "Edit", onClick: () => console.log("Edit") },
                            {
                                id: "duplicate",
                                label: "Duplicate",
                                onClick: () => console.log("Duplicate"),
                            },
                            { id: "sep1", type: "separator" },
                            {
                                id: "delete",
                                label: "Delete",
                                variant: "destructive",
                                onClick: () => console.log("Delete"),
                            },
                        ]}
                    />
                    <CodeBlock
                        code={`
<DropdownMenu
    trigger={<Button variant="secondary">Actions</Button>}
    contentClassName="min-w-[120px]"
    items={[
        { id: "edit", label: "Edit", onClick: () => console.log("Edit") },
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "sep1", type: "separator" },
        { id: "delete", label: "Delete", variant: "destructive", onClick: () => console.log("Delete") },
    ]}
/>`}
                    />
                </div>
            </div>

            {/* Exemple radio group */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Avec radio group</h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <DropdownMenu
                        trigger={<Button>Theme</Button>}
                        contentClassName="min-w-[120px]"
                        radioGroupValue={theme}
                        onRadioValueChange={setTheme}
                        items={[
                            { id: "light", type: "radio", label: "Light", value: "light" },
                            { id: "dark", type: "radio", label: "Dark", value: "dark" },
                            { id: "system", type: "radio", label: "System", value: "system" },
                        ]}
                    />
                    <CodeBlock
                        code={`
<DropdownMenu
  trigger={<Button>Theme</Button>}
  contentClassName="min-w-[120px]"
  radioGroupValue={theme}
  onRadioValueChange={setTheme}
  items={[
      { id: "light", type: "radio", label: "Light", value: "light" },
      { id: "dark", type: "radio", label: "Dark", value: "dark" },
      { id: "system", type: "radio", label: "System", value: "system" },
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Exemple checkboxes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Avec checkboxes</h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <DropdownMenu
                        trigger={<Button>Options</Button>}
                        contentClassName="min-w-[180px]"
                        items={[
                            {
                                id: "notifications",
                                type: "checkbox",
                                label: "Show notifications",
                                checked: showNotifications,
                                onClick: () => setShowNotifications(!showNotifications),
                            },
                            {
                                id: "darkmode",
                                type: "checkbox",
                                label: "Enable dark mode",
                                checked: darkModeEnabled,
                                onClick: () => setDarkModeEnabled(!darkModeEnabled),
                            },
                        ]}
                    />
                    <CodeBlock
                        code={`
<DropdownMenu
  trigger={<Button>Options</Button>}
  contentClassName="min-w-[180px]"
  items={[
      {
          id: "notifications",
          type: "checkbox",
          label: "Show notifications",
          checked: showNotifications,
          onClick: () => setShowNotifications(!showNotifications),
      },
      {
          id: "darkmode",
          type: "checkbox",
          label: "Enable dark mode",
          checked: darkModeEnabled,
          onClick: () => setDarkModeEnabled(!darkModeEnabled),
      },
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Exemple groupes et sous-menus */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Avec groupes et sous-menus</h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <DropdownMenu
                        trigger={<Button variant="secondary">Open</Button>}
                        contentClassName="w-56"
                        align="start"
                        contentLabel="My Account"
                        groups={[
                            {
                                id: "account",
                                items: [
                                    { id: "profile", label: "Profile", shortcut: "⇧⌘P" },
                                    { id: "billing", label: "Billing", shortcut: "⌘B" },
                                    { id: "settings", label: "Settings", shortcut: "⌘S" },
                                    {
                                        id: "shortcuts",
                                        label: "Keyboard shortcuts",
                                        shortcut: "⌘K",
                                    },
                                ],
                            },
                            {
                                id: "team",
                                items: [
                                    { id: "team", label: "Team" },
                                    {
                                        id: "invite",
                                        type: "sub",
                                        label: "Invite users",
                                        items: [
                                            { id: "email", label: "Email" },
                                            { id: "message", label: "Message" },
                                            { id: "sep2", type: "separator" },
                                            { id: "more", label: "More..." },
                                        ],
                                    },
                                    { id: "newteam", label: "New Team", shortcut: "⌘+T" },
                                ],
                            },
                            {
                                id: "external",
                                items: [
                                    { id: "github", label: "GitHub" },
                                    { id: "support", label: "Support" },
                                    { id: "api", label: "API", disabled: true },
                                ],
                            },
                            {
                                id: "logout",
                                items: [{ id: "logout", label: "Log out", shortcut: "⇧⌘Q" }],
                            },
                        ]}
                    />
                    <CodeBlock
                        code={`
<DropdownMenu
  trigger={<Button variant="secondary">Open</Button>}
  contentClassName="w-56"
  align="start"
  contentLabel="My Account"
  groups={[
      {
          id: "account",
          items: [
              { id: "profile", label: "Profile", shortcut: "⇧⌘P" },
              { id: "billing", label: "Billing", shortcut: "⌘B" },
              { id: "settings", label: "Settings", shortcut: "⌘S" },
              { id: "shortcuts", label: "Keyboard shortcuts", shortcut: "⌘K" },
          ],
      },
      {
          id: "team",
          items: [
              { id: "team", label: "Team" },
              {
                  id: "invite",
                  type: "sub",
                  label: "Invite users",
                  items: [
                      { id: "email", label: "Email" },
                      { id: "message", label: "Message" },
                      { id: "sep2", type: "separator" },
                      { id: "more", label: "More..." },
                  ],
              },
              { id: "newteam", label: "New Team", shortcut: "⌘+T" },
          ],
      },
      {
          id: "external",
          items: [
              { id: "github", label: "GitHub" },
              { id: "support", label: "Support" },
              { id: "api", label: "API", disabled: true },
          ],
      },
      { id: "logout", items: [{ id: "logout", label: "Log out", shortcut: "⇧⌘Q" }] },
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Exemple dots button */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Avec bouton dots</h2>
                <div className="p-4 border  border-tertiary rounded-lg">
                    <DropdownMenu
                        trigger={<DropdownDotsButton />}
                        align="end"
                        contentClassName="min-w-[100px]"
                        items={[
                            { id: "view", label: "View details" },
                            { id: "archive", label: "Archive" },
                            { id: "remove", label: "Remove", variant: "destructive" },
                        ]}
                    />
                    <CodeBlock
                        code={`
<DropdownMenu
  trigger={<DropdownDotsButton />}
  align="end"
  contentClassName="min-w-[100px]"
  items={[
      { id: "view", label: "View details" },
      { id: "archive", label: "Archive" },
      { id: "remove", label: "Remove", variant: "destructive" },
  ]}
/>`}
                    />
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto space-y-8">
                    {/* --- DropdownMenu Props --- */}
                    <table className="w-full">
                        <thead>
                            <tr className="border-b  border-tertiary ">
                                <th className="text-left py-2 px-4">Props</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">trigger</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Élément déclencheur du menu</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">items?</td>
                                <td className="py-2 px-4 text-sm">DropdownMenuItemData[]</td>
                                <td className="py-2 px-4 text-sm">[]</td>
                                <td className="py-2 px-4 text-sm">Liste des éléments</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">groups?</td>
                                <td className="py-2 px-4 text-sm">DropdownMenuGroupData[]</td>
                                <td className="py-2 px-4 text-sm">[]</td>
                                <td className="py-2 px-4 text-sm">
                                    Groupes d’éléments avec séparateur
                                </td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">contentLabel?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Label global affiché en haut</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">contentClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Classe appliquée au contenu</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">itemClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Classe appliquée aux items</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">
                                    radioGroupValue?(requis dans radiio group)
                                </td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    Valeur sélectionnée pour radio
                                </td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">
                                    onRadioValueChange?(requis dans radiio group)
                                </td>
                                <td className="py-2 px-4 text-sm">{`(value: string) => void`}</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    Callback lors du changement radio
                                </td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">side?</td>
                                <td className="py-2 px-4 text-sm">{`"top" | "right" | "bottom" | "left"`}</td>
                                <td className="py-2 px-4 text-sm">{"bottom"}</td>
                                <td className="py-2 px-4 text-sm">Position du menu</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">sideOffset?</td>
                                <td className="py-2 px-4 text-sm">number</td>
                                <td className="py-2 px-4 text-sm">4</td>
                                <td className="py-2 px-4 text-sm">
                                    Décalage entre trigger et menu
                                </td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">align?</td>
                                <td className="py-2 px-4 text-sm">{`"start" | "center" | "end"`}</td>
                                <td className="py-2 px-4 text-sm">{"center"}</td>
                                <td className="py-2 px-4 text-sm">Alignement horizontal</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">alignOffset?</td>
                                <td className="py-2 px-4 text-sm">number</td>
                                <td className="py-2 px-4 text-sm">0</td>
                                <td className="py-2 px-4 text-sm">Décalage d’alignement</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">defaultOpen?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">État initial ouvert/fermé</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">open?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Mode contrôlé (open/close)</td>
                            </tr>
                            <tr className="border-b  border-tertiary ">
                                <td className="py-2 px-4 font-medium">onOpenChange?</td>
                                <td className="py-2 px-4 text-sm">{`(open: boolean) => void`}</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">Callback ouverture/fermeture</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-medium">modal?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">true</td>
                                <td className="py-2 px-4 text-sm">Capture le focus (mode modal)</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* --- DropdownMenuItemData --- */}
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenuitemdata">
                            DropdownMenuItemData
                        </h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b  border-tertiary ">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>id</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">Identifiant unique de l’élément</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>type?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`"item" | "checkbox" | "radio" | "separator" | "label" | "sub"`}</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{"item"}</code>
                                    </td>
                                    <td className="py-2 px-4">Type d’élément de menu</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>label</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>React.ReactNode</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">Contenu affiché de l’élément</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>shortcut?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">
                                        Texte d’un raccourci clavier (ex: ⌘C)
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>onClick?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`() => void`}</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">Callback déclenché lors du clic</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>disabled?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>false</code>
                                    </td>
                                    <td className="py-2 px-4">Désactive l’élément</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>variant?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`"default" | "destructive"`}</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{"default"}</code>
                                    </td>
                                    <td className="py-2 px-4">Style visuel de l’élément</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>checked?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>false</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        État pour les <code>checkbox</code>
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>value</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">
                                        Valeur pour les <code>radio</code>
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>inset?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>false</code>
                                    </td>
                                    <td className="py-2 px-4">Ajoute une indentation visuelle</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>href?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">
                                        Si présent, rend l’item cliquable comme un lien
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>asChild?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>false</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        Permet d’utiliser un autre composant via{" "}
                                        <code>asChild</code>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4">
                                        <code>items?(requis pour les sous-menus)</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>DropdownMenuItemData[]</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">
                                        Liste de sous-éléments (uniquement pour <code>sub</code>)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* --- DropdownMenuGroupData --- */}
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenugroupdata">
                            DropdownMenuGroupData
                        </h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b  border-tertiary ">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>id</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">Identifiant unique du groupe</td>
                                </tr>
                                <tr className="border-b  border-tertiary ">
                                    <td className="py-2 px-4">
                                        <code>label?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">-</td>
                                    <td className="py-2 px-4">
                                        Label affiché en en-tête du groupe
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4">
                                        <code>items</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>DropdownMenuItemData[]</code>
                                    </td>
                                    <td className="py-2 px-4">[]</td>
                                    <td className="py-2 px-4">Liste des items du groupe</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
