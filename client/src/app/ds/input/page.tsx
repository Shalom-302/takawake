"use client";

import React, { useState } from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import {
    BaseInputVariants,
    Input,
    InputForm,
    InputAffix,
    InputGroup,
    PaymentInput,
    PaymentInputForm,
} from "@/components/ui/input";
import { Check, Copy01, Mail01, Mail02, User02 } from "@untitled-ui/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { NativeSelect } from "@/components/ui/select";
import { useClipboard } from "@/lib/hooks/use-clipboard";
import { cn } from "@/lib/utils/cn";

// Définition du schéma Zod
const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.email(),
    cardNumber: z.string().min(13, {
        message: "Card number must be at least 13 digits.",
    }),
});

// Définition du composant de page
export default function InputPage() {
    const sizes = ["sm", "md"];

    // Initialisation du formulaire avec React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            cardNumber: "",
        },
    });

    // Fonction de soumission de formulaire
    function onSubmit(data: z.infer<typeof formSchema>) {
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    const { copy, copied } = useClipboard();
    const [value, setValue] = useState("");

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sizes.map(size => (
                        <div key={size} className="p-4 border border-tertiary rounded-lg">
                            <div className="mb-4">
                                <Input
                                    size={size as BaseInputVariants["size"]}
                                    placeholder={`Size ${size}`}
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
                        <Input type="email" placeholder="email" leftIcon={Mail01} />
                        <CodeBlock
                            code={`<Input 
  type="email" 
  placeholder="email" 
  leftIcon={Mail01}
/>`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Input type="email" placeholder="email" rightIcon={Mail01} />
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
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with tooltip</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Input
                            type="text"
                            placeholder="Input with tooltip"
                            tooltip="Input with tooltip"
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
            PAYMENT INPUT
            ========================= */}
            <section className="mb-10" id="payment">
                <h2 className="text-xl font-semibold mb-4">Payment Input</h2>
                <p className="text-tertiary mb-4">
                    Specialized input for credit card numbers with automatic card type detection.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <PaymentInput placeholder="Card number" />
                        <CodeBlock code={`<PaymentInput placeholder="Card number" />`} />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <PaymentInput placeholder="Card number" size="md" />
                        <CodeBlock code={`<PaymentInput placeholder="Card number" size="md" />`} />
                    </div>
                </div>
            </section>

            {/* =========================
            INPUT GROUP
            ========================= */}
            <section className="space-y-8 my-10">
                <h2 className="text-xl font-semibold">InputGroup</h2>

                {/* Addons left & right */}
                <div className="p-4 border border-tertiary rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
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
                    <div>
                        <InputGroup
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setValue(e.target.value)
                            }
                            type="text"
                            rightAddon={
                                <InputAffix
                                    onClick={() => copy(value || "Copied")}
                                    className={cn(
                                        "flex items-center gap-1 bg-primary text-secondary hover:bg-primary_hover hover:text-secondary_hover cursor-pointer"
                                    )}
                                >
                                    {copied ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy01 className="size-4" />
                                    )}
                                    Copy
                                </InputAffix>
                            }
                            size="sm"
                            tooltip="This is a tooltip"
                        />
                        <CodeBlock
                            code={`
<InputGroup
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(e.target.value)
    }
    type="text"
    rightAddon={
        <InputAffix
            onClick={() => copy(value || "Copied")}
            className={cn(
                "flex items-center gap-1 bg-primary text-secondary hover:bg-primary_hover hover:text-secondary_hover cursor-pointer"
            )}
        >
            {copied ? (
                <Check className="size-4" />
            ) : (
                <Copy01 className="size-4" />
            )}
            Copy
        </InputAffix>
    }
    size="sm"
    tooltip="This is a tooltip"
/>
`}
                        />
                    </div>
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

                {/* Prefix + select */}
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
            FORM (InputForm & PaymentInputForm)
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
                        <PaymentInputForm
                            control={form.control}
                            name="cardNumber"
                            label="Card Number"
                            placeholder="1234 5678 9012 3456"
                            description="Enter your credit card number."
                            tooltip="This is a tooltip"
                            isRequired
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>

                <CodeBlock
                    className="mt-4"
                    code={`
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email(),
  cardNumber: z.string().min(13, { message: "Card number must be at least 13 digits." }),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { username: "", email: "", cardNumber: "" },
});

function onSubmit(data: z.infer<typeof formSchema>) {
  toast("You submitted the following values", {
    description: (
      <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  });
}

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
    <PaymentInputForm
      control={form.control}
      name="cardNumber"
      label="Card Number"
      placeholder="1234 5678 9012 3456"
      description="Enter your credit card number."
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
                        <h3 className="text-md font-semibold mb-2">
                            INPUT (Props additionnels à Input HTML)
                        </h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="px-4 py-2">Props</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Default</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">size?</td>
                                    <td className="px-4 py-2">{`"sm" | "md"`}</td>
                                    <td className="px-4 py-2">{`"sm"`}</td>
                                    <td className="px-4 py-2">Controls input padding.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">leftIcon?</td>
                                    <td className="px-4 py-2">React.FC&lt;SVGProps&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Icon displayed on the left.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">rightIcon?</td>
                                    <td className="px-4 py-2">React.F&lt;SVGProps&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Icon displayed on the right.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltip?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Tooltip message on hover/focus.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputWrapperClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the outer wrapper.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the native input.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">iconClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for icons.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
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
                        <h3 className="text-md font-semibold mb-2">INPUT GROUP</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="px-4 py-2">Props</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Default</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">leftAddon?</td>
                                    <td className="px-4 py-2">ReactNode</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Addon before input.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">rightAddon?</td>
                                    <td className="px-4 py-2">ReactNode</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Addon after input.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">size?</td>
                                    <td className="px-4 py-2">{`"sm" | "md"`}</td>
                                    <td className="px-4 py-2">{`"sm"`}</td>
                                    <td className="px-4 py-2">Controls input padding.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltip?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Tooltip message on hover/focus.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputGroupClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for the group container.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">inputWrapperClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Styles passed to the inner <code>Input</code> wrapper.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
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
                        <h3 className="text-md font-semibold mb-2">INPUT AFFIX</h3>
                        <table className="w-full">
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
                                    <td className="px-4 py-2 font-mono">isDisabled?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">
                                        Visual disabled state for the addon.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
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
                        <h3 className="text-md font-semibold mb-2">INPUT FORM</h3>
                        <table className="w-full">
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
                                    <td className="px-4 py-2 font-mono">control</td>
                                    <td className="px-4 py-2">Control&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">React Hook Form control instance.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">name</td>
                                    <td className="px-4 py-2">FieldPath&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field name registered in the form schema.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">label?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field label displayed above input.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">description?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Helper text under the input.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">isRequired?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">
                                        {`  Adds "required" indicator on label.`}
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
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

                    {/* PAYMENT INPUT FORM */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">PAYMENT INPUT FORM</h3>
                        <table className="w-full">
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
                                    <td className="px-4 py-2 font-mono">control</td>
                                    <td className="px-4 py-2">Control&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">React Hook Form control instance.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">name</td>
                                    <td className="px-4 py-2">FieldPath&lt;TFieldValues&gt;</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field name registered in the form schema.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">label?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">
                                        Field label displayed above input.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">description?</td>
                                    <td className="px-4 py-2">ReactNode | string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Helper text under the input.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">isRequired?</td>
                                    <td className="px-4 py-2">boolean</td>
                                    <td className="px-4 py-2">false</td>
                                    <td className="px-4 py-2">
                                        {`Adds "required" indicator on label.`}
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltip?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Tooltip message on hover/focus.</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="px-4 py-2 font-mono">tooltipClassName?</td>
                                    <td className="px-4 py-2">string</td>
                                    <td className="px-4 py-2">—</td>
                                    <td className="px-4 py-2">Styles for tooltip content.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
