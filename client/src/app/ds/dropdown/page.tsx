import React from "react";
import Link from "next/link";
import { 
  Dropdown,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/ds/components/dropdown";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { Button } from "@/ds/components/button";
import { Check, ChevronDown, Copy, CreditCard, Github, LifeBuoy, LogOut, Mail, MessageSquare, Plus, Settings, User } from "lucide-react";

export default function DropdownPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Retour au Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Dropdown</h1>
        <p className="text-muted-foreground mt-2">
          Un menu déroulant qui s&apos;affiche au clic, avec une API simplifiée pour une utilisation plus facile.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>API simplifiée</CardTitle>
            <CardDescription>
              Le composant Dropdown offre une API simplifiée pour créer des menus déroulants sans avoir à définir séparément les sous-composants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Exemple d'utilisation de Dropdown
<Dropdown
  trigger={<Button>Ouvrir le menu</Button>}
  items={[
    { id: "edit", label: "Modifier", onClick: () => console.log("Modifier") },
    { id: "duplicate", label: "Dupliquer", onClick: () => console.log("Dupliquer") },
    { id: "delete", label: "Supprimer", variant: "destructive" }
  ]}
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Exemple de base */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Exemple de base</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Dropdown
              trigger={<Button variant="outline">Menu <ChevronDown className="ml-2 h-4 w-4" /></Button>}
              items={[
                { id: "edit", label: "Modifier", onClick: () => {} },
                { id: "duplicate", label: "Dupliquer", onClick: () => {} },
                { id: "delete", label: "Supprimer", variant: "destructive" }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dropdown
  trigger={<Button variant="outline">Menu <ChevronDown className="ml-2 h-4 w-4" /></Button>}
  items={[
    { id: "edit", label: "Modifier", onClick: () => {} },
    { id: "duplicate", label: "Dupliquer", onClick: () => {} },
    { id: "delete", label: "Supprimer", variant: "destructive" }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* Avec icônes et raccourcis */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Avec icônes et raccourcis</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Dropdown
              trigger={<Button>Profil <ChevronDown className="ml-2 h-4 w-4" /></Button>}
              items={[
                { 
                  id: "profile", 
                  label: "Mon profil", 
                  icon: <User className="h-4 w-4" />,
                  shortcut: "⇧⌘P",
                  onClick: () => {} 
                },
                { 
                  id: "settings", 
                  label: "Paramètres", 
                  icon: <Settings className="h-4 w-4" />,
                  shortcut: "⌘S",
                  onClick: () => {} 
                },
                { 
                  id: "logout", 
                  label: "Déconnexion", 
                  icon: <LogOut className="h-4 w-4" />,
                  variant: "destructive",
                  onClick: () => {} 
                }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dropdown
  trigger={<Button>Profil <ChevronDown className="ml-2 h-4 w-4" /></Button>}
  items={[
    { 
      id: "profile", 
      label: "Mon profil", 
      icon: <User className="h-4 w-4" />,
      shortcut: "⇧⌘P",
      onClick: () => {} 
    },
    { 
      id: "settings", 
      label: "Paramètres", 
      icon: <Settings className="h-4 w-4" />,
      shortcut: "⌘S",
      onClick: () => {} 
    },
    { 
      id: "logout", 
      label: "Déconnexion", 
      icon: <LogOut className="h-4 w-4" />,
      variant: "destructive",
      onClick: () => {} 
    }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* Avec groupes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Avec groupes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Dropdown
              trigger={<Button variant="outline">Options <ChevronDown className="ml-2 h-4 w-4" /></Button>}
              groups={[
                {
                  id: "account",
                  label: "Mon compte",
                  items: [
                    { id: "profile", label: "Profil", icon: <User className="h-4 w-4" /> },
                    { id: "billing", label: "Facturation", icon: <CreditCard className="h-4 w-4" /> },
                    { id: "settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> }
                  ]
                },
                {
                  id: "help",
                  label: "Aide",
                  items: [
                    { id: "docs", label: "Documentation", icon: <MessageSquare className="h-4 w-4" /> },
                    { id: "support", label: "Support", icon: <LifeBuoy className="h-4 w-4" /> }
                  ]
                },
                {
                  id: "actions",
                  items: [
                    { id: "logout", label: "Déconnexion", icon: <LogOut className="h-4 w-4" />, variant: "destructive" }
                  ]
                }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dropdown
  trigger={<Button variant="outline">Options <ChevronDown className="ml-2 h-4 w-4" /></Button>}
  groups={[
    {
      id: "account",
      label: "Mon compte",
      items: [
        { id: "profile", label: "Profil", icon: <User className="h-4 w-4" /> },
        { id: "billing", label: "Facturation", icon: <CreditCard className="h-4 w-4" /> },
        { id: "settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> }
      ]
    },
    {
      id: "help",
      label: "Aide",
      items: [
        { id: "docs", label: "Documentation", icon: <MessageSquare className="h-4 w-4" /> },
        { id: "support", label: "Support", icon: <LifeBuoy className="h-4 w-4" /> }
      ]
    },
    {
      id: "actions",
      items: [
        { id: "logout", label: "Déconnexion", icon: <LogOut className="h-4 w-4" />, variant: "destructive" }
      ]
    }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["default", "bordered", "elevated"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-3 capitalize">{variant}</h3>
              <div className="flex justify-center mb-4">
                <Dropdown
                  trigger={<Button variant="outline">Variant {variant}</Button>}
                  variant={variant as any}
                  items={[
                    { id: "item1", label: "Option 1" },
                    { id: "item2", label: "Option 2" },
                    { id: "item3", label: "Option 3" }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dropdown
  trigger={<Button variant="outline">Variant ${variant}</Button>}
  variant="${variant}"
  items={[
    { id: "item1", label: "Option 1" },
    { id: "item2", label: "Option 2" },
    { id: "item3", label: "Option 3" }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tailles */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Tailles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["sm", "default", "lg"].map(size => (
            <div key={size} className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-3 capitalize">{size}</h3>
              <div className="flex justify-center mb-4">
                <Dropdown
                  trigger={<Button variant="outline">Taille {size}</Button>}
                  size={size as any}
                  items={[
                    { id: "item1", label: "Option 1" },
                    { id: "item2", label: "Option 2" },
                    { id: "item3", label: "Option 3" }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dropdown
  trigger={<Button variant="outline">Taille ${size}</Button>}
  size="${size}"
  items={[
    { id: "item1", label: "Option 1" },
    { id: "item2", label: "Option 2" },
    { id: "item3", label: "Option 3" }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Arrondi */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Arrondi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["sm", "default", "lg", "full"].map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-3 capitalize">Arrondi {rounded}</h3>
              <div className="flex justify-center mb-4">
                <Dropdown
                  trigger={<Button variant="outline">Arrondi {rounded}</Button>}
                  rounded={rounded as any}
                  items={[
                    { id: "item1", label: "Option 1" },
                    { id: "item2", label: "Option 2" },
                    { id: "item3", label: "Option 3" }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dropdown
  trigger={<Button variant="outline">Arrondi ${rounded}</Button>}
  rounded="${rounded}"
  items={[
    { id: "item1", label: "Option 1" },
    { id: "item2", label: "Option 2" },
    { id: "item3", label: "Option 3" }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Alignement */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Alignement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["start", "center", "end"].map(align => (
            <div key={align} className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-3 capitalize">Alignement {align}</h3>
              <div className="flex justify-center mb-4">
                <Dropdown
                  trigger={<Button variant="outline">Alignement {align}</Button>}
                  align={align as any}
                  items={[
                    { id: "item1", label: "Option 1" },
                    { id: "item2", label: "Option 2" },
                    { id: "item3", label: "Option 3" }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dropdown
  trigger={<Button variant="outline">Alignement ${align}</Button>}
  align="${align}"
  items={[
    { id: "item1", label: "Option 1" },
    { id: "item2", label: "Option 2" },
    { id: "item3", label: "Option 3" }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contrôlé */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Mode contrôlé</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <CodeBlock 
              code={`import React from "react";
import { Dropdown } from "@/ds/components/dropdown";
import { Button } from "@/ds/components/button";

export function ControlledDropdown() {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Button onClick={() => setOpen(true)}>Ouvrir le menu</Button>
        <Button variant="outline" onClick={() => setOpen(false)}>Fermer le menu</Button>
      </div>
      
      <Dropdown
        trigger={<Button variant="outline">Menu contrôlé</Button>}
        open={open}
        onOpenChange={setOpen}
        items={[
          { id: "item1", label: "Option 1", onClick: () => console.log("Option 1") },
          { id: "item2", label: "Option 2", onClick: () => console.log("Option 2") },
          { id: "item3", label: "Option 3", onClick: () => console.log("Option 3") }
        ]}
      />
    </div>
  );
}`} 
            />
          </div>
        </div>
      </div>

      {/* Utilisation avancée */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Utilisation avancée</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <CodeBlock 
              code={`// Utilisation des composants de base pour des cas plus complexes
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options avancées</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      <span>Profil</span>
      <span className="ml-auto">⇧⌘P</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <CreditCard className="mr-2 h-4 w-4" />
      <span>Facturation</span>
      <span className="ml-auto">⌘B</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      <span>Paramètres</span>
      <span className="ml-auto">⌘S</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Déconnexion</span>
      <span className="ml-auto">⇧⌘Q</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`} 
            />
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Props</CardTitle>
            <CardDescription>
              Propriétés du composant Dropdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Prop</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">trigger</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Élément déclencheur du menu déroulant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">items</td>
                    <td className="py-2 px-4 text-sm">DropdownItemData[]</td>
                    <td className="py-2 px-4 text-sm">Liste des éléments du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">groups</td>
                    <td className="py-2 px-4 text-sm">DropdownGroupData[]</td>
                    <td className="py-2 px-4 text-sm">Liste des groupes d&apos;éléments</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">label</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Libellé du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">"default" | "sm" | "lg" | "auto"</td>
                    <td className="py-2 px-4 text-sm">Taille du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">variant</td>
                    <td className="py-2 px-4 text-sm">"default" | "bordered" | "elevated"</td>
                    <td className="py-2 px-4 text-sm">Variante du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">rounded</td>
                    <td className="py-2 px-4 text-sm">"default" | "sm" | "lg" | "full"</td>
                    <td className="py-2 px-4 text-sm">Niveau d&apos;arrondi des coins</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">itemSize</td>
                    <td className="py-2 px-4 text-sm">"default" | "sm" | "lg"</td>
                    <td className="py-2 px-4 text-sm">Taille des éléments du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">align</td>
                    <td className="py-2 px-4 text-sm">"start" | "center" | "end"</td>
                    <td className="py-2 px-4 text-sm">Alignement horizontal du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">side</td>
                    <td className="py-2 px-4 text-sm">"top" | "right" | "bottom" | "left"</td>
                    <td className="py-2 px-4 text-sm">Côté d&apos;affichage du menu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">sideOffset</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Décalage par rapport au côté</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">alignOffset</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Décalage par rapport à l&apos;alignement</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">open</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">État d&apos;ouverture du menu (mode contrôlé)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onOpenChange</td>
                    <td className="py-2 px-4 text-sm">(open: boolean) => void</td>
                    <td className="py-2 px-4 text-sm">Fonction appelée lors du changement d&apos;état</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">className</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classe CSS pour le déclencheur</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">contentClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classe CSS pour le contenu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">itemClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classe CSS pour les éléments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
