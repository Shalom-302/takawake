"use client";

import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/components/ui/code-block";
import { SocialButton, type SocialButtonVariants } from "@/components/ui/button";

export default function SocialButtonPage() {
    const variants: {
        name: SocialButtonVariants["variant"];
        description: string;
    }[] = [
        { name: "brand", description: "Brand colors for each social platform" },
        { name: "gray", description: "Neutral gray style for all platforms" },
        { name: "color", description: "Gray background with colorful icons" },
    ];

    const socials: {
        name: SocialButtonVariants["social"];
        label: string;
    }[] = [
        { name: "google", label: "Google" },
        { name: "facebook", label: "Facebook" },
        { name: "apple", label: "Apple" },
        { name: "twitter", label: "Twitter" },
        { name: "figma", label: "Figma" },
        { name: "dribble", label: "Dribble" },
    ];

    const sizes = ["sm", "md", "lg", "xl", "2xl"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Social Button</h1>
                <p className="text-secondary mt-2">
                    Social authentication buttons with multiple platforms, themes and sizes.
                </p>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border border-tertiary rounded-lg">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                {socials.map(social => (
                                    <SocialButton
                                        key={social.name}
                                        social={social.name!}
                                        variant={variant.name!}
                                    >
                                        Continue with {social.label}
                                    </SocialButton>
                                ))}
                            </div>
                            <p className="text-sm text-secondary mt-3">{variant.description}</p>
                            <CodeBlock
                                className="mt-2"
                                code={`<SocialButton social="google" variant="${variant.name}">
  Continue with Google
</SocialButton>`}
                            />
                        </div>
                    ))}

                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            {socials.map(social => (
                                <SocialButton
                                    key={social.name}
                                    social={social.name!}
                                    variant="brand"
                                />
                            ))}
                        </div>
                        <p className="text-sm text-secondary mt-3">Icon Only Button</p>
                        <CodeBlock
                            className="mt-2"
                            code={`<SocialButton social="google" variant="brand" />`}
                        />
                    </div>
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {sizes.map(size => (
                            <SocialButton
                                key={size}
                                social="google"
                                variant="brand"
                                size={size as SocialButtonVariants["size"]}
                            >
                                Button {size}
                            </SocialButton>
                        ))}
                    </div>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<SocialButton social="google" size="sm|md|lg|xl|2xl">
  Button text
</SocialButton>`}
                />
            </div>

            {/* States */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-secondary mb-2">Disabled</p>
                            <div className="flex flex-wrap items-center gap-3">
                                {socials.map(social => (
                                    <SocialButton
                                        key={social.name}
                                        social={social.name!}
                                        variant="brand"
                                        disabled
                                    >
                                        Continue with {social.label}
                                    </SocialButton>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<SocialButton social="google" disabled>
  Continue with Google
</SocialButton>`}
                />
            </div>

            {/* As Link */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">As Link</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex flex-wrap items-center gap-3">
                        <SocialButton social="google" variant="brand" href="/auth/google">
                            Sign in with Google
                        </SocialButton>
                        <SocialButton social="facebook" variant="gray" href="/auth/facebook">
                            Sign in with Facebook
                        </SocialButton>
                        <SocialButton social="apple" variant="brand" href="/auth/apple">
                            Sign in with Apple
                        </SocialButton>
                    </div>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<SocialButton social="google" href="/auth/google">
  Sign in with Google
</SocialButton>`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">social</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`"google" | "facebook" | "apple" | "twitter" | "figma" | "dribble"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">The social platform to display.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">variant?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'brand' | 'gray' | 'color'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`'brand'`}</td>
                                <td className="py-2 px-4">The visual style of the button.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'sm' | 'md' | 'lg' | 'xl' | '2xl'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`'lg'`}</td>
                                <td className="py-2 px-4">The size of the button.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">href?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    If provided, renders an anchor element instead of a button.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Disables the button.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional CSS classes to apply to the button.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">children?</td>
                                <td className="py-2 px-4 font-mono text-sm">ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Button content. If empty, renders as icon-only button.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
