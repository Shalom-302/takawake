"use client";

import * as React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import {
    Combobox,
    ComboboxForm,
    MultiSelect,
    MultiSelectForm,
    Select,
    SelectForm,
    SelectItemData,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { toast } from "sonner";
import { File01, Shield01, Star01, User01 } from "@untitled-ui/icons-react";

export default function SelectPage() {
    const emailItems: SelectItemData[] = [
        { id: "m@example.com", label: "m@example.com" },
        { id: "m@google.com", label: "m@google.com" },
        { id: "m@support.com", label: "m@support.com" },
    ];

    // =========================
    // EXAMPLES
    // =========================
    const basicItems: SelectItemData[] = [
        { id: "apple", label: "Apple" },
        { id: "orange", label: "Orange" },
        { id: "banana", label: "Banana" },
    ];

    const scrollableItems: SelectItemData[] = [
        {
            id: "north-america",
            type: "group",
            label: "North America",
            items: [
                { id: "est", label: "Eastern Standard Time (EST)" },
                { id: "cst", label: "Central Standard Time (CST)", disabled: true },
                { id: "mst", label: "Mountain Standard Time (MST)" },
                { id: "pst", label: "Pacific Standard Time (PST)" },
                { id: "akst", label: "Alaska Standard Time (AKST)" },
                { id: "hst", label: "Hawaii Standard Time (HST)" },
            ],
        },
        {
            id: "europe-africa",
            type: "group",
            label: "Europe & Africa",
            items: [
                { id: "gmt", label: "Greenwich Mean Time (GMT)" },
                { id: "cet", label: "Central European Time (CET)" },
                { id: "eet", label: "Eastern European Time (EET)" },
                { id: "west", label: "Western European Summer Time (WEST)" },
                { id: "cat", label: "Central Africa Time (CAT)" },
                { id: "eat", label: "East Africa Time (EAT)" },
            ],
        },
    ];

    // NEW EXAMPLES WITH ENHANCED FEATURES
    const iconsItems: SelectItemData[] = [
        {
            id: "user",
            label: "User",
            icon: <User01 className="w-4 h-4" />,
            supportingText: "Limited access",
        },
        {
            id: "admin",
            label: "Administrator",
            icon: <Shield01 className="w-4 h-4" />,
            supportingText: "Full access",
        },
        {
            id: "moderator",
            label: "Moderator",
            icon: <Star01 className="w-4 h-4" />,
            supportingText: "Content management",
        },
    ];

    const avatarItems = [
        {
            id: "1",
            label: "John Doe",
            value: "john-doe",
            supportingText: "john@example.com",
            avatarUrl: "/images/avatar-1.png",
        },
        {
            id: "2",
            label: "Jane Smith",
            value: "jane-smith",
            supportingText: "jane@example.com",
            avatarUrl: "/images/avatar-2.png",
        },
        {
            id: "3",
            label: "Bob Johnson",
            value: "bob-johnson",
            supportingText: "bob@example.com",
            avatarUrl: "/images/avatar-3.png",
        },
        {
            id: "4",
            label: "Alice Brown",
            value: "alice-brown",
            supportingText: "alice@example.com",
            avatarUrl: "/images/avatar-4.png",
        },
    ];

    const customRenderItems: SelectItemData[] = [
        {
            id: "file1",
            label: "Important Document.pdf",
            icon: <File01 className="w-4 h-4" />,
            supportingText: "Modified 2 hours ago",
        },
        {
            id: "file2",
            label: "Presentation.pptx",
            icon: <File01 className="w-4 h-4" />,
            supportingText: "Modified yesterday",
        },
    ];

    const mixedContentItems: SelectItemData[] = [
        {
            id: "docs",
            type: "group",
            label: "Recent Files",
            items: [
                {
                    id: "doc1",
                    label: "Report.pdf",
                    icon: <File01 className="w-4 h-4" />,
                    supportingText: "2.4 MB",
                },
            ],
        },
        { id: "sep1", type: "separator" },
        {
            id: "projects-group",
            type: "group",
            label: "Projects",
            items: [
                {
                    id: "proj1",
                    label: "Project Alpha",
                    supportingText: "Active",
                    icon: <Star01 className="w-4 h-4" />,
                },
                {
                    id: "proj2",
                    label: "Project Beta",
                    supportingText: "On hold",
                },
            ],
        },
    ];

    const priorities = [
        { id: "1", label: "Low", value: "low" },
        { id: "2", label: "Medium", value: "medium" },
        { id: "3", label: "High", value: "high" },
        { id: "4", label: "Critical", value: "critical" },
    ];
    const [priority, setPriority] = React.useState<string | null>(null);

    const frameworks = [
        { id: "1", label: "Next.js", value: "nextjs", supportingText: "React framework" },
        { id: "2", label: "SvelteKit", value: "sveltekit", supportingText: "Svelte framework" },
        { id: "3", label: "Nuxt.js", value: "nuxtjs", supportingText: "Vue framework" },
        { id: "4", label: "Remix", value: "remix", supportingText: "Full stack React framework" },
        { id: "5", label: "Astro", value: "astro", supportingText: "Static site generator" },
    ];
    const [userValues, setUserValues] = React.useState<string[]>([]);

    // =========================
    // FORM SETUP
    // =========================
    const formSchema = z.object({
        email: z.email({
            message: "Please select an email to display.",
        }),
        framework: z.string({
            message: "Please select a framework.",
        }),
        users: z.array(z.string()).min(1, "Please select at least one user."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log("data", data);
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }
    return (
        <div className="container mx-auto pt-10 px-4 pb-0">
            {/* HEADER */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Select</h1>
                <p className="text-tertiary mt-2">
                    Advanced select component with icons, avatars, custom content, groups,
                    scrollable items, and form integration.
                </p>
            </div>

            {/* BASIC SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Basic Select</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select items={basicItems} placeholder="Select a fruit" />

                        <CodeBlock
                            code={`<Select
    items={[
        { id: "apple", label: "Apple" },
        { id: "orange", label: "Orange" },
        { id: "banana", label: "Banana" }
    ]}
    placeholder="Select a fruit"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* DISABLED SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled Select</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select disabled items={basicItems} placeholder="Select a fruit" />
                        <CodeBlock
                            code={`<Select
    disabled
    items={basicItems}
    placeholder="Select a fruit"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* SELECT WITH ICONS */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                    Select with Icons and Supporting Text
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select items={iconsItems} placeholder="Select a role" />

                        <CodeBlock
                            code={`<Select
    items={[
        {
            id: "user",
            label: "User",
            icon: <User01 className="w-4 h-4" />,
            supportingText: "Limited access",
        },
        {
            id: "admin",
            label: "Administrator",
            icon: <Shield01 className="w-4 h-4" />,
            supportingText: "Full access",
        },
        {
            id: "moderator",
            label: "Moderator",
            icon: <Star01 className="w-4 h-4" />,
            supportingText: "Content management",
        },
    ]}
    placeholder="Select a role"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* SELECT WITH AVATARS */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Select with Avatars</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select items={avatarItems} placeholder="Select a user" />

                        <CodeBlock
                            code={`<Select
    items={[
        {
            id: "john",
            label: "John Doe",
            value: "john",
            avatarUrl: "/images/avatar-1.png",
            supportingText: "john@example.com",
        },
        {
            id: "jane",
            value: "jane",
            label: "Jane Smith",
            avatarUrl: "/images/avatar-2.png",
            supportingText: "jane@example.com",
        },
    ]}
    placeholder="Select a user"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* CUSTOM RENDER */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Custom Item Rendering</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select
                            items={customRenderItems}
                            placeholder="Select a file"
                            renderItem={item => (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="text-xs text-tertiary">
                                        {item.supportingText}
                                    </span>
                                </div>
                            )}
                        />
                        <CodeBlock
                            code={`<Select
    items={[
        {
            id: "file1",
            label: "Important Document.pdf",
            icon: <File01 className="w-4 h-4" />,
            supportingText: "Modified 2 hours ago",
        },
        {
            id: "file2",
            label: "Presentation.pptx",
            icon: <File01 className="w-4 h-4" />,
            supportingText: "Modified yesterday",
        },
    ]}
    placeholder="Select a file"
    renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
            </div>
            <span className="text-xs text-tertiary">
                {item.supportingText}
            </span>
        </div>
    )}
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* MIXED CONTENT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                    Mixed Content with Groups and Separators
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select
                            items={mixedContentItems}
                            placeholder="Select an item"
                            triggerClassName="w-[360px]"
                        />

                        <CodeBlock
                            code={`<Select
    items={[
        {
            id: "docs",
            type: "group",
            label: "Recent Files",
            items: [
                {
                    id: "doc1",
                    label: "Report.pdf",
                    icon: <File01 className="w-4 h-4" />,
                    supportingText: "2.4 MB",
                },
            ],
        },
        { id: "sep1", type: "separator" },
        {
            id: "projects-group",
            type: "group",
            label: "Projects",
            items: [
                {
                    id: "proj1",
                    label: "Project Alpha",
                    supportingText: "Active",
                    icon: <Star01 className="w-4 h-4" />,
                },
                {
                    id: "proj2",
                    label: "Project Beta",
                    supportingText: "On hold",
                },
            ],
        },
    ]}
    placeholder="Select an item"
    triggerClassName="w-[360px]"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* SCROLLABLE SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Scrollable Select With Disabled Item</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Select
                            items={scrollableItems}
                            placeholder="Select a timezone"
                            triggerClassName="w-[360px]"
                        />
                        <CodeBlock
                            code={`<Select
    items={[
        {
            id: "north-america",
            type: "group",
            label: "North America",
            items: [
                { id: "est", label: "Eastern Standard Time (EST)" },
                { id: "cst", label: "Central Standard Time (CST)", disabled: true },
                { id: "mst", label: "Mountain Standard Time (MST)" },
                { id: "pst", label: "Pacific Standard Time (PST)" },
                { id: "akst", label: "Alaska Standard Time (AKST)" },
                { id: "hst", label: "Hawaii Standard Time (HST)" },
            ],
        },
        {
            id: "europe-africa",
            type: "group",
            label: "Europe & Africa",
            items: [
                { id: "gmt", label: "Greenwich Mean Time (GMT)" },
                { id: "cet", label: "Central European Time (CET)" },
                { id: "eet", label: "Eastern European Time (EET)" },
                { id: "west", label: "Western European Summer Time (WEST)" },
                { id: "cat", label: "Central Africa Time (CAT)" },
                { id: "eat", label: "East Africa Time (EAT)" },
            ],
        },
    ]}
    placeholder="Select a timezone"
    triggerClassName="w-[360px]"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* Combobox */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combobox</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Combobox
                            placeholder="Search priority..."
                            items={priorities}
                            value={priority}
                            onValueChange={setPriority}
                            emptyMessage="Not found !"
                            size="md"
                        />

                        <CodeBlock
                            code={` 
<Combobox
    placeholder="Search priority..."
    items={priorities}
    value={priority}
    onValueChange={setPriority}
    size="md"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* MultiSelect */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">MultiSelect</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <MultiSelect
                            placeholder="Search"
                            items={avatarItems}
                            value={userValues}
                            onValueChange={setUserValues}
                            size="sm"
                        />

                        <CodeBlock
                            code={` 
<MultiSelect
    placeholder="Search"
    items={avatarItems}
    value={userValues}
    onValueChange={setUserValues}
    size="sm"
/>`}
                        />
                    </div>
                </div>
            </section>

            {/* FORM SELECT */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Select in Form</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <SelectForm
                                    control={form.control}
                                    name="email"
                                    label="Email"
                                    labelTooltip="This is a tooltip"
                                    placeholder="Select a verified email to display"
                                    items={emailItems}
                                    isRequired
                                />
                                <ComboboxForm
                                    control={form.control}
                                    name="framework"
                                    label="Framework"
                                    labelTooltip="This is a tooltip"
                                    placeholder="Select a framework"
                                    items={frameworks}
                                    isRequired
                                />
                                <MultiSelectForm
                                    control={form.control}
                                    name="users"
                                    label="Users"
                                    labelTooltip="This is a tooltip"
                                    placeholder="Select some users"
                                    items={avatarItems}
                                    isRequired
                                />
                                <Button type="submit">Submit</Button>
                            </form>
                        </Form>
                        <CodeBlock
                            code={`

 const formSchema = z.object({
        email: z.email({
            message: "Please select an email to display.",
        }),
        framework: z.string({
            message: "Please select a framework.",
        }),
        users: z.array(z.string()).min(1, "Please select at least one user."),
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SelectForm
            control={form.control}
            name="email"
            label="Email"
            labelTooltip="This is a tooltip"
            placeholder="Select a verified email to display"
            items={emailItems}
            isRequired
        />
        <ComboboxForm
            control={form.control}
            name="framework"
            label="Framework"
            labelTooltip="This is a tooltip"
            placeholder="Select a framework"
            items={frameworks}
            isRequired
        />
        <MultiSelectForm
            control={form.control}
            name="users"
            label="Users"
            labelTooltip="This is a tooltip"
            placeholder="Select some users"
            items={avatarItems}
            isRequired
        />
        <Button type="submit">Submit</Button>
    </form>
</Form>`}
                        />
                    </div>
                </div>
            </section>

            {/* API REFERENCE */}
            <div className="">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto space-y-8">
                    {/* Select Component Props */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">Select Props</h3>
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
                                    <td className="py-2 px-4 font-medium">items</td>
                                    <td className="py-2 px-4">SelectItemData[]</td>
                                    <td className="py-2 px-4">[]</td>
                                    <td className="py-2 px-4">
                                        List of items to display in the select (items, groups,
                                        labels, separators)
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">value?</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Selected value (controlled)</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onValueChange?</td>
                                    <td className="py-2 px-4">{`(value: string) => void`}</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">
                                        Callback called when value changes
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">placeholder?</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 px-4">{`"Select an option..."`}</td>
                                    <td className="py-2 px-4">
                                        Text displayed when no value is selected
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">size?</td>
                                    <td className="py-2 px-4">{`"sm" | "default"`}</td>
                                    <td className="py-2 px-4">{`"default"`}</td>
                                    <td className="py-2 px-4">Size of the trigger</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">disabled?</td>
                                    <td className="py-2 px-4">boolean</td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">Disables the select</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">showIcon?</td>
                                    <td className="py-2 px-4">boolean</td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">
                                        Show icon in the trigger for selected item
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">showAvatar?</td>
                                    <td className="py-2 px-4">boolean</td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">
                                        Show avatar in the trigger for selected item
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">renderItem?</td>
                                    <td className="py-2 px-4">{`(item: SelectItemData) => ReactNode`}</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Custom render function for items</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">triggerClassName?</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Custom class for the trigger</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">contentClassName?</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Custom class for the content</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">itemClassName?</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Custom class for items</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SelectItemData */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">SelectItemData</h3>
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
                                    <td className="py-2 px-4">
                                        <code>id</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Unique identifier for the item</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>label?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>React.ReactNode</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Text or element displayed</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>value?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">
                                        Value used for selection (defaults to id)
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>disabled?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">Disables the item</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>type?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>{`"item" | "separator" | "group"`}</code>
                                    </td>
                                    <td className="py-2 px-4">{`"item"`}</td>
                                    <td className="py-2 px-4">Type of element</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>icon?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>React.ReactNode</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Icon to display</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>avatarUrl?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Avatar image URL</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>supportingText?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">
                                        Secondary text displayed below label
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>customContent?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>React.ReactNode</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">
                                        Completely custom content for the item
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>items?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>SelectItemData[]</code>
                                    </td>
                                    <td className="py-2 px-4">[]</td>
                                    <td className="py-2 px-4">Sub-items for groups</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Combobox and MutiSelect Props */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">
                            Combobox and MutiSelect Props
                        </h3>
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
                                    <td className="py-2 px-4 font-medium">placeholder?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        <code>{`"Search"`}</code>
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        Placeholder text displayed in the input field.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">shortcut?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">false</td>
                                    <td className="py-2 px-4 text-sm">
                                        Whether to display the keyboard shortcut hint (⌘K).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">size?</td>
                                    <td className="py-2 px-4 text-sm">
                                        <code>{`"sm"`}</code> | <code>{`"md"`}</code>
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        <code>{`"sm"`}</code>
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        Controls the input size and spacing.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">items?</td>
                                    <td className="py-2 px-4 text-sm">ComboboxItemBase[]</td>
                                    <td className="py-2 px-4 text-sm">[]</td>
                                    <td className="py-2 px-4 text-sm">
                                        List of items available in the combobox.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">value?</td>
                                    <td className="py-2 px-4 text-sm">string | null</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        The controlled selected value.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onValueChange?</td>
                                    <td className="py-2 px-4 text-sm">
                                        function: <code>(value: string | null) =&gt; void</code>
                                    </td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Callback fired when the selected value changes.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">disabled?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">false</td>
                                    <td className="py-2 px-4 text-sm">
                                        Whether the combobox is disabled.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">inputClassName?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Custom class applied to the input container.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">shortcutClassName?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Custom class applied to the shortcut indicator.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">contentClassName?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Custom class applied to the dropdown content.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">emptyMessage?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">
                                        <code>{`"No results found."`}</code>
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        Message displayed when no items match the search input.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 font-medium">children?</td>
                                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Optional custom rendering of items. If provided, it
                                        overrides <code>items</code>.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* SelectForm, ComboboxForm and MultiSelectForm Props */}
                    <div>
                        <h3 className="text-md font-semibold mb-2">
                            SelectForm, ComboboxForm and MultiSelectForm Props
                        </h3>
                        <p className="text-sm text-tertiary mb-2">
                            Extends all Select type props plus the following form-specific props:
                        </p>
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
                                    <td className="py-2 px-4">
                                        <code>control</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>Control</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">React Hook Form control object</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>name</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Field name</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>label?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Field label</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>description?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>string</code>
                                    </td>
                                    <td className="py-2 px-4">—</td>
                                    <td className="py-2 px-4">Field description</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4">
                                        <code>isRequired?</code>
                                    </td>
                                    <td className="py-2 px-4">
                                        <code>boolean</code>
                                    </td>
                                    <td className="py-2 px-4">false</td>
                                    <td className="py-2 px-4">Shows required indicator</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
