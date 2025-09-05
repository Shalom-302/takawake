"use client";

import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import { BaseInputVariants, Input, InputForm, InputAffix, InputGroup } from "@/components/ui/input";
import { Mail01, Mail02, User02 } from "@untitled-ui/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { NativeSelect } from "@/components/ui/select";

export default function InputPage() {
    const sizes = ["sm", "md"];

    const FormSchema = z.object({
        username: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        email: z.email(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
            email: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <div className="container mx-auto py-10 px-4">
            {/* HEADER */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Input</h1>
                <p className="text-tertiary mt-2">
                    Inputs with sizes, icons, tooltip, addons and form integration.
                </p>
            </div>

            {/* =========================
           SIZES
         ========================= */}
            <section className="mb-10" id="sizes">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sizes.map(size => (
                        <div key={size} className="p-4 border border-tertiary rounded-lg">
                            <div className="mb-4">
                                <Input
                                    size={size as BaseInputVariants["size"]}
                                    placeholder={`Size ${size}`}
                                    className="w-full"
                                />
                            </div>
                            <CodeBlock
                                code={`<Input size="${size}" placeholder="Size ${size}" />`}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================
           ICONS
         ========================= */}
            <section className="mb-10" id="icons">
                <h2 className="text-xl font-semibold mb-4">Input with icons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Input
                            type="email"
                            placeholder="email"
                            leftIcon={Mail01}
                            className="w-full"
                        />
                        <CodeBlock
                            code={`<Input 
  type="email" 
  placeholder="email" 
  leftIcon={Mail01}
/>`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Input
                            type="email"
                            placeholder="email"
                            rightIcon={Mail01}
                            className="w-full"
                        />
                        <CodeBlock
                            code={`<Input 
  type="email" 
  placeholder="email" 
  rightIcon={Mail01}
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* =========================
           TOOLTIP
         ========================= */}
            <section className="mb-10" id="tooltip">
                <h2 className="text-xl font-semibold mb-4">Input with tooltip</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Input
                            type="text"
                            placeholder="Input with tooltip"
                            tooltip="Input with tooltip"
                            className="w-full"
                        />
                        <CodeBlock
                            code={`<Input 
  type="text" 
  placeholder="Input with tooltip" 
  tooltip="Input with tooltip"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* =========================
           INPUT GROUP
         ========================= */}
            <section className="space-y-8 my-10" id="input-group">
                <h2 className="text-xl font-semibold">InputGroup</h2>

                {/* Addons left & right */}
                <div className="p-4 border border-tertiary rounded-lg space-y-3">
                    <InputGroup
                        type="text"
                        leftAddon={<InputAffix>https://</InputAffix>}
                        rightAddon={<InputAffix>.com</InputAffix>}
                        size="sm"
                        tooltip="This is a tooltip"
                    />
                    <CodeBlock
                        code={`<InputGroup
  type="text"
  leftAddon={<InputAffix>https://</InputAffix>}
  rightAddon={<InputAffix>.com</InputAffix>}
  size="sm"
  tooltip="This is a tooltip"
/>`}
                    />
                </div>

                {/* Select + phone */}
                <div className="p-4 border border-tertiary rounded-lg space-y-3">
                    <InputGroup
                        leftAddon={
                            <NativeSelect
                                aria-label="Country"
                                options={[
                                    { value: "US", label: "US" },
                                    { value: "CA", label: "CA" },
                                    { value: "EU", label: "EU" },
                                ]}
                            />
                        }
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                    />
                    <CodeBlock
                        code={`<InputGroup
  leftAddon={
    <NativeSelect
      aria-label="Country"
      options={[
        { value: "US", label: "US" },
        { value: "CA", label: "CA" },
        { value: "EU", label: "EU" },
      ]}
    />
  }
  type="tel"
  placeholder="+1 (555) 000-0000"
/>`}
                    />
                </div>

                {/* Prefix + select (—> le prop prefix manquait) */}
                <div className="p-4 border border-tertiary rounded-lg space-y-3">
                    <InputGroup
                        prefix="$"
                        rightAddon={
                            <NativeSelect
                                aria-label="Currency"
                                options={[
                                    { value: "USD", label: "US" },
                                    { value: "CAD", label: "CA" },
                                    { value: "EUR", label: "EU" },
                                ]}
                            />
                        }
                        type="tel"
                        placeholder="1,000.00"
                    />
                    <CodeBlock
                        code={`<InputGroup
  prefix="$"
  rightAddon={
    <NativeSelect
      aria-label="Currency"
      options={[
        { value: "USD", label: "US" },
        { value: "CAD", label: "CA" },
        { value: "EUR", label: "EU" },
      ]}
    />
  }
  type="tel"
  placeholder="1,000.00"
/>`}
                    />
                </div>
            </section>

            {/* =========================
                FORM (InputForm)
         ========================= */}
            <section className="my-12" id="form">
                <h2 className="text-xl font-semibold mb-4">Form</h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                        <InputForm
                            control={form.control}
                            name="username"
                            label="Username"
                            placeholder="shadcn"
                            description="This is your public display name."
                            leftIcon={User02}
                            tooltip="This is a tooltip"
                            isRequired
                        />
                        <InputForm
                            control={form.control}
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="Your email"
                            description="This is your login email."
                            leftIcon={Mail02}
                            tooltip="This is a tooltip"
                            isRequired
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>

                <CodeBlock
                    className="mt-4"
                    code={`import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const FormSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.email(),
});

const form = useForm<z.infer<typeof FormSchema>>({
  resolver: zodResolver(FormSchema),
  defaultValues: { username: "", email: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
    <InputForm
      control={form.control}
      name="username"
      label="Username"
      placeholder="shadcn"
      description="This is your public display name."
      leftIcon={User02}
      tooltip="This is a tooltip"
      isRequired
    />
    <InputForm
      control={form.control}
      type="email"
      name="email"
      label="Email"
      placeholder="Your email"
      description="This is your login email."
      leftIcon={Mail02}
      tooltip="This is a tooltip"
      isRequired
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>`}
                />
            </section>

            {/* =========================
                API REFERENCE
         ========================= */}
            <section className="my-16">
                <h2 className="text-2xl font-bold mb-6">API Reference</h2>
                {/* INPUT */}
                <div className="overflow-x-auto space-y-16">
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenugroupdata">
                            INPUT
                        </h3>
                        <table className="w-full text-left">
                            <thead className="">
                                <tr className="border-b  border-tertiary">
                                    <th className="px-4 py-2">Props</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Default</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">size?</td>
                                    <td className="px-4 py-2">{`"sm" | "md"`}</td>
                                    <td className="px-4 py-2">{`"sm"`}</td>
                                    <td className="px-4 py-2">Controls input padding.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">leftIcon?</td>
                                    <td className="px-4 py-2">
                                        React.ComponentType&lt;SVGProps&gt;
                                    </td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Icon displayed on the left.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">rightIcon?</td>
                                    <td className="px-4 py-2">
                                        React.ComponentType&lt;SVGProps&gt;
                                    </td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Icon displayed on the right.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltip?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Tooltip message on hover/focus.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">wrapperClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the outer wrapper.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the native input.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">iconClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for icons.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltipClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for tooltip content.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* INPUT GROUP */}
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenugroupdata">
                            INPUT GROUP
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
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">prefix?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Inline text prefix inside the input (e.g. {"$"}).
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">leftAddon?</td>
                                    <td className="px-4 py-2">ReactNode</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Addon before input (e.g., <code>&lt;InputAffix/&gt;</code>{" "}
                                        or <code>&lt;NativeSelect/&gt;</code>).
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">rightAddon?</td>
                                    <td className="px-4 py-2">ReactNode</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Addon after input.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">containerClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the group container.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">wrapperClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Styles passed to the inner <code>Input</code> wrapper.
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Extra classes applied to the native input.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* INPUT AFFIX */}
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenugroupdata">
                            INPUT AFFIX
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
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">isDisabled?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">
                                        Visual disabled state for the addon.
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">children</td>
                                    <td className="px-4 py-2">ReactNode</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Addon content.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* INPUT FORM */}
                    <div>
                        <h3 className="text-md font-semibold mb-2" id="dropdownmenugroupdata">
                            INPUT FORM
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
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">control</td>
                                    <td className="px-4 py-2">Control&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">React Hook Form control instance.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">name</td>
                                    <td className="px-4 py-2">FieldPath&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field name registered in the form schema.
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">label?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field label displayed above input.
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">description?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Helper text under the input.</td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">isRequired?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">
                                        Adds “required” indicator on label.
                                    </td>
                                </tr>
                                <tr className="border-b  border-tertiary">
                                    <td className="px-4 py-2 font-mono">…inputProps</td>
                                    <td className="px-4 py-2">
                                        All <code>Input</code> props (except <code>name</code>)
                                    </td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Pass-through to the inner <code>Input</code>.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
