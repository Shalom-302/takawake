"use client";

import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings02 } from "@untitled-ui/icons-react";

// Component with state and open-close contrôle
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
        <Dialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button variant="secondary" leftIcon={<Settings02 />}>
                    Settings
                </Button>
            }
            title="Edit profile"
            description="Make changes to your profile here. Click save when you're done."
            content={
                <div className="py-4">
                    <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="form-name" className="text-right">
                                Name
                            </label>
                            <input
                                id="form-name"
                                className="col-span-3 p-2 border rounded"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="form-email" className="text-right">
                                Email
                            </label>
                            <input
                                id="form-email"
                                className="col-span-3 p-2 border rounded"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            }
            footer={
                <>
                    <Button variant={"secondary"} onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} type="submit" isLoading={submitted}>
                        Register
                    </Button>
                </>
            }
        />
    );
}

export default function DialogPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Dialog</h1>
                <p className="text-tertiary mt-2">
                    API simplified for the Dialog component, allowing to create modal dialogues with
                    minimal configuration.
                </p>
            </div>

            {/* Exemple de base */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Dialog
                            trigger={<Button>Open dialog</Button>}
                            title="Dialog title"
                            description="Description or instructions for the user."
                            content={<div className="py-4">Dialog content</div>}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Dialog
  trigger={<Button>Open dialog</Button>}
  title="Dialog title"
  description="Description or instructions for the user."
  content={<div className="py-4">Dialog content</div>}
 
/>`}
                    />
                </div>
            </div>

            {/* Usage examples */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Usage examples</h2>

                {/* Confirmation */}
                <div className="mb-6 p-4 border border-tertiary rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Confirmation</h3>
                    <div className="mb-4 ">
                        <Dialog
                            trigger={
                                <Button variant="secondary-destructive">Delete element</Button>
                            }
                            title="Confirm deletion"
                            description="Are you sure you want to delete this element? This action is irreversible."
                            footer={
                                <>
                                    <Button variant={"secondary"}>Annuler</Button>
                                    <Button variant={"primary-destructive"}>Supprimer</Button>
                                </>
                            }
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Dialog
  trigger={<Button variant="destructive">Delete element</Button>}
  title="Confirm deletion"
  description="Are you sure you want to delete this element? This action is irreversible."
  footer={
    <>
    <Button variant={'secondary'}>Annuler</Button>
    <Button variant={'primary-destructive'} >Supprimer</Button>
    </>
  }
/>`}
                    />
                </div>

                {/* Form with action and open-close contrôle */}
                <div className="mb-6 p-4 border border-tertiary rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                        Form with action and open-close contrôle
                    </h3>
                    <div className="mb-4 ">
                        <FormWithAutoClose />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
// Component with state and closure management
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

      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="secondary" leftIcon={<Settings02/>}>Settings</Button>}
        title="Edit profile"
        description="Make changes to your profile here. Click save when you're done."
        content={
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-name" className="text-right">Name</label>
                <input 
                  id="form-name" 
                  className="col-span-3 p-2 border border-tertiary rounded" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="form-email" className="text-right">Email</label>
                <input 
                  id="form-email" 
                  className="col-span-3 p-2 border border-tertiary rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>
        }
        footer={
          <>
          <Button variant={'secondary'} onClick={()=>setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} type="submit" isLoading={submitted}>Register</Button>
          </>
          
        }
      />
  );
}`}
                    />
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
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
                                <td className="py-2 px-4 font-medium">trigger</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Trigger element to open the dialog
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">title?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Dialog title</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">description?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Dialog description</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">content?</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Principal content</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">footer?</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Footer content</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">open?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    The controlled open state of the dialog. Must be used in
                                    conjunction with onOpenChange.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onOpenChange?</td>
                                <td className="py-2 px-4 text-sm">{"(open: boolean) => void"}</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Event handler called when the open state of the dialog changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">showCloseButton?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">true</td>
                                <td className="py-2 px-4 text-sm">
                                    Whether to show a close button in the top-right corner.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">className?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the dialog content container.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">dialogContentClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">
                                    {"flex flex-col gap-2 text-center sm:text-left"}
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the global content(header,
                                    content and footer).
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">headerClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">
                                    {"flex flex-col gap-2 text-center sm:text-left"}
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the header containing title and
                                    description.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">titleClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">
                                    {"text-lg text-secondary leading-none font-semibold"}
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the title.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">descriptionClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">{"text-tertiary text-sm"}</td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the description.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">footerClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">
                                    {"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"}
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    Additional classes to apply to the footer.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
