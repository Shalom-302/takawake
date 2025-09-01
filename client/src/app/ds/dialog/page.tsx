"use client";

import React from "react";
import Link from "next/link";
import { 
  Dialog
} from "@/ds/components/dialog";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { Button } from "@/ds/components/button";
import { InfoIcon, Settings2Icon, HelpCircleIcon } from "lucide-react";

// Component with state and auto-close management
function FormWithAutoClose() {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", email: "" });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = () => {
    // Simulate form submission
    console.log("Submitted data:", formData);
    
    // Show success message
    setSubmitted(true);
    
    // Close dialog after 1 second
    setTimeout(() => {
      setOpen(false);
      // Reset state after closing
      setTimeout(() => setSubmitted(false), 500);
    }, 1000);
  };

  return (
    <>
      {submitted && <div className="text-green-600 mb-2">✓ Registered successfully!</div>}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="destructive">Delete element</Button>}
        title="Confirmation"
        description="Are you sure you want to delete this element?"
        content={
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-name" className="text-right">Name</label>
                <input 
                  id="form-name" 
                  className="col-span-3 p-2 border rounded" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-email" className="text-right">Email</label>
                <input 
                  id="form-email" 
                  className="col-span-3 p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>
        }
        confirmLabel="Register"
        cancelLabel="Cancel"
        onConfirm={handleSubmit}
      />
    </>
  );
}

export default function DialogPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Dialog</h1>
        <p className="text-muted-foreground mt-2">
          API simplified for the Dialog component, allowing to create modal dialogues with minimal configuration.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>API simplified</CardTitle>
            <CardDescription>
              The Dialog component offers a simplified API for creating modal dialogues without having to define separate sub-components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example usage of Dialog
<Dialog
  trigger={<Button>Open dialog</Button>}
  title="Dialog title"
  description="Description or instructions for the user."
  content={<div>Dialog content</div>}
  confirmLabel="Confirm"
  cancelLabel="Cancel"
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Exemple de base */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex flex-wrap gap-4">
            <Dialog
              trigger={<Button>Open dialog</Button>}
              title="Dialog title"
              description="Description or instructions for the user."
              content={<div className="py-4">Dialog content</div>}
              confirmLabel="Confirm"
              cancelLabel="Cancel"
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dialog
  trigger={<Button>Open dialog</Button>}
  title="Dialog title"
  description="Description or instructions for the user."
  content={<div className="py-4">Dialog content</div>}
  confirmLabel="Confirm"
  cancelLabel="Cancel"
/>`} 
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["sm", "default", "lg", "xl"].map(size => (
            <div key={size} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Size: {size}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Dialog
                  trigger={<Button variant="outline">Size {size}</Button>}
                  title={`Dialog size ${size}`}
                  description={`Example of modal dialog with size ${size}`}
                  content={<div className="py-4">Dialog content</div>}
                  confirmLabel="OK"
                  size={size as any}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dialog
  trigger={<Button variant="outline">Size ${size}</Button>}
  title="Dialog size ${size}"
  description="Example of modal dialog with size ${size}"
  content={<div className="py-4">Dialog content</div>}
  confirmLabel="OK"
  size="${size}"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounded */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rounded</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["none", "default", "lg"].map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Rounded: {rounded}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Dialog
                  trigger={<Button variant="outline">Rounded {rounded}</Button>}
                  title={`Dialog rounded ${rounded}`}
                  description={`Example of modal dialog with rounded ${rounded}`}
                  content={<div className="py-4">Dialog content</div>}
                  confirmLabel="OK"
                  rounded={rounded as any}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Dialog
  trigger={<Button variant="outline">Rounded ${rounded}</Button>}
  title="Dialog rounded ${rounded}"
  description="Example of modal dialog with rounded ${rounded}"
  content={<div className="py-4">Dialog content</div>}
  confirmLabel="OK"
  rounded="${rounded}"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Usage examples */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Usage examples</h2>
        
        {/* Confirmation */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Confirmation</h3>
          <div className="mb-4 flex justify-center">
            <Dialog
              trigger={<Button variant="destructive">Delete element</Button>}
              title="Confirm deletion"
              description="Are you sure you want to delete this element? This action is irreversible."
              confirmLabel="Supprimer"
              cancelLabel="Annuler"
              contentClassName="text-destructive"
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dialog
  trigger={<Button variant="destructive">Delete element</Button>}
  title="Confirm deletion"
  description="Are you sure you want to delete this element? This action is irreversible."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  contentClassName="text-destructive"
/>`} 
          />
        </div>
        
        {/* Form */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Form</h3>
          <div className="mb-4 flex justify-center">
            <Dialog
              trigger={<Button variant="outline"><Settings2Icon className="h-4 w-4 mr-2" />Settings</Button>}
              title="Settings"
              description="Configurez vos préférences"
              content={
                <div className="py-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">Name</label>
                      <input id="name" className="col-span-3 p-2 border rounded" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="email" className="text-right">Email</label>
                      <input id="email" className="col-span-3 p-2 border rounded" />
                    </div>
                  </div>
                </div>
              }
              confirmLabel="Enregistrer"
              cancelLabel="Annuler"
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Dialog
  trigger={<Button variant="outline"><Settings2Icon className="h-4 w-4 mr-2" />Settings</Button>}
  title="Settings"
  description="Configure your preferences"
  content={
    <div className="py-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="name" className="text-right">Name</label>
          <input id="name" className="col-span-3 p-2 border rounded" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="email" className="text-right">Email</label>
          <input id="email" className="col-span-3 p-2 border rounded" />
        </div>
      </div>
    </div>
  }
  confirmLabel="Enregistrer"
  cancelLabel="Annuler"
/>`} 
          />
        </div>

        {/* Form with action and auto-close */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Form with action and auto-close</h3>
          <div className="mb-4 flex justify-center">
            <FormWithAutoClose />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`// Component with state and closure management
function FormWithAutoClose() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Simulate form submission
    console.log("Données soumises:", formData);
    
    // Show success message
    setSubmitted(true);
    
    // Close dialog after 1 second
    setTimeout(() => {
      setOpen(false);
      // Reset state after closing
      setTimeout(() => setSubmitted(false), 500);
    }, 1000);
  };

  return (
    <>
      {submitted && <div className="text-green-600 mb-2">✓ Registered successfully!</div>}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="destructive">Delete element</Button>}
        title="Confirmation"
        description="Are you sure you want to delete this element?"
        content={
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-name" className="text-right">Name</label>
                <input 
                  id="form-name" 
                  className="col-span-3 p-2 border rounded" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-email" className="text-right">Email</label>
                <input 
                  id="form-email" 
                  className="col-span-3 p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>
        }
        confirmLabel="Register"
        cancelLabel="Cancel"
        onConfirm={handleSubmit}
      />
    </>
  );
}`} 
          />
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Dialog Props</CardTitle>
            <CardDescription>
              Accepted properties by the Dialog component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Prop</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">title</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Dialog title</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">description</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Dialog description</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">content</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Contenu principal</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">trigger</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Trigger element</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">confirmLabel</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Text of the confirm button</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">cancelLabel</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Text of the cancel button</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size (sm, default, lg, xl, 2xl, etc.)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">rounded</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Rounded (none, default, lg, etc.)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">open</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">Controlled open state</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onOpenChange</td>
                    <td className="py-2 px-4 text-sm">(open: boolean) => void</td>
                    <td className="py-2 px-4 text-sm">Function called on state change</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onConfirm</td>
                    <td className="py-2 px-4 text-sm">() => void</td>
                    <td className="py-2 px-4 text-sm">Function called on confirmation</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onCancel</td>
                    <td className="py-2 px-4 text-sm">() => void</td>
                    <td className="py-2 px-4 text-sm">Function called on cancellation</td>
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
