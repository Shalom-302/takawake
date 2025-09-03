"use client";
import React from "react";
import Link from "next/link";
// import { Input } from "@/ds/components/input";
import { CodeBlock } from "@/ds/components/code-block";
import { BaseInputVariants, Input, InputForm } from "@/components/ui/input";
import { Mail01 } from "@untitled-ui/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/buttons";
import { InputGroup, InputPrefix } from "@/components/ui/input/input-group";

export default function InputPage() {
    const sizes = ["sm", "md"];
    const FormSchema = z.object({
        username: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
    });
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
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
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Input</h1>
                <p className="text-tertiary mt-2">
                    Inputs with different variants, sizes, and rounded styles.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6 my-10">
                    <InputForm
                        control={form.control}
                        name="username"
                        label="Username"
                        placeholder="shadcn"
                        description="This is your public display name."
                        iconLeft={Mail01}
                        tooltip="this a tooltip"
                        isRequired
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
            <InputGroup
                type="tel"
                placeholder="+1 (555) 000-0000"
                // leftAddon={<InputPrefix>https://</InputPrefix>}
                prefix="$"
                tooltip="This is a tooltip"
            />

            {/* Sizes */}
            <div className="mb-10">
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
                                className="mt-2"
                                code={`<Input size="${size}" placeholder="Size ${size}" />`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Types */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input types</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input type="password" placeholder="Password" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="password" placeholder="Password" />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input type="email" placeholder="Email" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="email" placeholder="Email" />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input type="number" placeholder="Number" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input type="number" placeholder="Number" />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input type="date" className="w-full" />
                        </div>
                        <CodeBlock className="mt-2" code={`<Input type="date" />`} />
                    </div>
                </div>
            </div>

            {/* With Icons */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with icons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input
                                type="email"
                                placeholder="email"
                                iconLeft={Mail01}
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="email" 
    placeholder="email" 
    iconLeft={Mail01}  
/>`}
                        />
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input
                                type="email"
                                placeholder="email"
                                iconRight={Mail01}
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="email" 
    placeholder="email" 
    iconRight={Mail01} 
/>`}
                        />
                    </div>
                </div>
            </div>

            {/* With Tooltip */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with tooltip</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Input with tooltip"
                                className="w-full"
                                tooltip="Input with tooltip"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`
<Input 
    type="text" 
    placeholder="Input with tooltip" 
    className="w-full" 
    tooltip="Input with tooltip"
/>
                            `}
                        />
                    </div>
                </div>
            </div>

            {/* With selected option */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with selected option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input 
                                type="text" 
                                placeholder="Input with selected option" 
                                className="w-full" 
                                dropdownInfo={{ 
                                    position: "left", 
                                    trigger: <div className="flex items-center gap-[4px] cursor-pointer text-sm">
                                        <span>USD</span>
                                        <span className="text-muted-foreground">
                                            <ChevronDown size={16} />
                                        </span>
                                    </div>,
                                    items: [
                                        { id: 'usd', label: 'USD', variant: 'default',  },
                                        { id: 'eur', label: 'EUR', variant: 'default',  },
                                        { id: 'xof', label: 'XOF', variant: 'default', },  
                                    ]
                                }}
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="text" 
    placeholder="Input with selected option left" 
    className="w-full" 
    dropdownInfo={{ 
        position: "left", 
        trigger: <div className="flex items-center gap-[4px] cursor-pointer text-sm">
            <span>USD</span>
            <span className="text-muted-foreground">
                <ChevronDown size={16} />
            </span>
        </div>,
        items: [
            { id: 'usd', label: 'USD', variant: 'default',  },
            { id: 'eur', label: 'EUR', variant: 'default',  },
            { id: 'xof', label: 'XOF', variant: 'default', },  
        ]
    }}
/>
                            `}
                        />
                    </div>
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input 
                                type="text" 
                                placeholder="Input with selected option right" 
                                className="w-full" 
                                dropdownInfo={{ 
                                    position: "right", 
                                    trigger: <div className="flex items-center gap-[4px] cursor-pointer text-sm">
                                        <span>USD</span>
                                        <span className="text-muted-foreground">
                                            <ChevronDown size={16} />
                                        </span>
                                    </div>,
                                    items: [
                                        { id: 'usd', label: 'USD', variant: 'default'},
                                        { id: 'eur', label: 'EUR', variant: 'default'},
                                        { id: 'xof', label: 'XOF', variant: 'default'}
                                    ]
                                }}
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="text" 
    placeholder="Input with selected option right" 
    className="w-full" 
    dropdownInfo={{ 
        position: "right", 
        trigger: <div className="flex items-center gap-[4px] cursor-pointer text-sm">
            <span>USD</span>
            <span className="text-muted-foreground">
                <ChevronDown size={16} />
            </span>
        </div>,
        items: [
            { id: 'usd', label: 'USD', variant: 'default' },
            { id: 'eur', label: 'EUR', variant: 'default'  },
            { id: 'xof', label: 'XOF', variant: 'default' } 
        ]
    }}
/>
                            `}
                        />
                    </div>
                </div>
            </div> */}

            {/* With clipboard */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with clipboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input 
                                type="text" 
                                placeholder="Input with clipboard" 
                                className="w-full" 
                                clipboard
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="text" 
    placeholder="Input with clipboard" 
    className="w-full" 
    clipboard
/>
                            `}
                        />
                    </div>
                </div>
            </div> */}

            {/* With Prefixed Input */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Input with prefixed input</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input 
                                type="text" 
                                placeholder="Input with prefixed input" 
                                className="w-full" 
                                prefixedInput="https://"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input 
    type="text" 
    placeholder="Input with prefixed input" 
    className="w-full" 
    PrefixedInput="https://"
/>
                            `}
                        />
                    </div>
                </div>
            </div> */}

            {/* Combinaisons */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Combinaisons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input
                                variant={"success" as any}
                                size={"lg" as any}
                                rounded={"full" as any}
                                placeholder="Champ validé"
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input variant="success" size="lg" rounded="full" placeholder="Validated field" />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input
                                variant={"error" as any}
                                size={"sm" as any}
                                rounded={"none" as any}
                                placeholder="Error field"
                                className="w-full"
                            />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input variant="error" size="sm" rounded="none" placeholder="Error field" />`}
                        />
                    </div>
                </div>
            </div> */}

            {/* States */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input disabled placeholder="Disabled field" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input disabled placeholder="Disabled field" />`}
                        />
                    </div>
                    <div className="p-4 border border-tertiaryrounded-lg">
                        <div className="mb-4">
                            <Input readOnly value="Readonly field" className="w-full" />
                        </div>
                        <CodeBlock
                            className="mt-2"
                            code={`<Input readOnly value="Readonly field" />`}
                        />
                    </div>
                </div>
            </div> */}
        </div>
    );
}
