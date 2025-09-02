"use client";

import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/buttons";
import { Label } from "@/components/ui/label/label";
import { Input } from "@/components/ui/input/input";

export default function CardDocs() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">
            {/* Header */}
            <header className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Card</h1>
                <p className="text-muted-foreground text-lg">
                    The Card component is a flexible container for grouping content with an optional
                    header, footer, and actions.
                </p>
                <Link href="/docs/components">← Back to components</Link>
            </header>

            {/* Base Example */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold tracking-tight">Example</h2>
                <Card
                    className="w-full max-w-md"
                    title="Card Title"
                    description="This is the card description."
                    action={<Button>Action</Button>}
                    content={<div>This is the main content of the card.</div>}
                    footer={<span>Footer text</span>}
                />

                <CodeBlock
                    code={`
<Card
    className="w-full max-w-md"
    title="Card Title"
    description="This is the card description."
    action={<Button>Action</Button>}
    content={<p>This is the main content of the card.</p>}
    footer={<span className="text-sm text-muted-foreground">Footer text</span>}
  />`}
                />
            </section>
            {/* Login Card*/}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold tracking-tight">Login Card</h2>
                <Card
                    className="w-full max-w-sm"
                    title="Login to your account"
                    description="Enter your email below to login to your account"
                    action={<Button variant="link-color">Sign Up</Button>}
                    content={
                        <form>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required />
                                </div>
                            </div>
                        </form>
                    }
                    footer={
                        <div className="flex flex-col gap-2 w-full">
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <Button variant="secondary" className="w-full">
                                Login with Google
                            </Button>
                        </div>
                    }
                />

                <CodeBlock
                    code={`
<Card
    className="w-full max-w-sm"
    title="Login to your account"
    description="Enter your email below to login to your account"
    action={<Button variant="link-color">Sign Up</Button>}
    content={
        <form>
            <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input id="password" type="password" required />
                </div>
            </div>
        </form>
    }
    footer={
        <div className="flex flex-col gap-2 w-full">
            <Button type="submit" className="w-full">
                Login
            </Button>
            <Button variant="secondary" className="w-full">
                Login with Google
            </Button>
        </div>
    }
/>`}
                />
            </section>

            {/* API Reference */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold tracking-tight">API Reference</h2>

                <h3 className="text-lg font-semibold">Card</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-3">Props</th>
                            <th className="text-left py-2 px-3">Type</th>
                            <th className="text-left py-2 px-3">Default</th>
                            <th className="text-left py-2 px-3">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">title?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Card title text</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">description?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Card description text</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">action?</td>
                            <td className="py-2 px-3">React.ReactNode</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Optional action element (e.g. button)</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">content</td>
                            <td className="py-2 px-3">React.ReactNode</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Main card content</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">footer?</td>
                            <td className="py-2 px-3">React.ReactNode</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Footer content</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">className?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Additional styles for the card</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">headerClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for header</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">titleClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for title</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">descriptionClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for description</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">actionClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for action slot</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-mono">contentClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for content</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-3 font-mono">footerClassName?</td>
                            <td className="py-2 px-3">string</td>
                            <td className="py-2 px-3">—</td>
                            <td className="py-2 px-3">Custom class for footer</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}
