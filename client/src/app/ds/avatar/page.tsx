"use client";

import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Avatar } from "@/components/ui/avatar";
import { User01 } from "@untitled-ui/icons-react";

export default function AvatarDocs() {
    return (
        <div className="space-y-16">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-4">Avatar</h1>
                <p className="text-muted-foreground mb-4">
                    Avatar component with different shapes, sizes, borders, statuses, fallbacks, and
                    groups.
                </p>
                <Link href="/docs/components" className="text-primary hover:underline">
                    ← Back to components
                </Link>
            </div>

            {/* Examples */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Examples</h2>

                {/* Basic */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Basic</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar src="/images/avatar-1.png" alt="John Doe" size="sm" />
                        <Avatar src="/images/avatar-2.png" alt="Jane Smith" size="md" />
                        <Avatar src="/images/avatar-3.png" alt="Mike Johnson" size="lg" />
                    </div>
                    <CodeBlock
                        code={`<Avatar src="/images/avatar-1.png" alt="John Doe" size="sm" />
<Avatar src="/images/avatar-2.png" alt="Jane Smith" size="md" />
<Avatar src="/images/avatar-3.png" alt="Mike Johnson" size="lg" />`}
                    />
                </div>

                {/* With initials */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With initials</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar initials="JD" size="sm" />
                        <Avatar initials="AS" size="md" />
                        <Avatar initials="MJ" size="lg" />
                    </div>
                    <CodeBlock
                        code={`<Avatar initials="JD" size="sm" />
<Avatar initials="AS" size="md" />
<Avatar initials="MJ" size="lg" />`}
                    />
                </div>

                {/* With status */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With status</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar src="/images/avatar-4.png" status="online" size="md" />
                        <Avatar initials="OF" status="offline" size="md" />
                    </div>
                    <CodeBlock
                        code={`<Avatar src="/images/avatar-4.png" status="online" size="md" />
<Avatar initials="OF" status="offline" size="md" />`}
                    />
                </div>

                {/* Verified */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Verified</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar src="/images/avatar-3.png" verified size="md" />
                        <Avatar initials="VU" verified size="lg" />
                    </div>
                    <CodeBlock
                        code={`<Avatar src="/images/avatar-3.png" verified size="md" />
<Avatar initials="VU" verified size="lg" />`}
                    />
                </div>

                {/* Profile photo */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Profile photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Large, ringed avatar for user profiles with extended size options.
                    </p>
                    <div className="flex gap-4 items-end mb-4">
                        <Avatar
                            variant="profile"
                            src="/images/avatar-1.png"
                            alt="Profile photo 1"
                            size="profile-sm"
                        />
                        <Avatar
                            variant="profile"
                            src="/images/avatar-2.png"
                            alt="Profile photo 2"
                            size="profile-md"
                        />
                        <Avatar
                            variant="profile"
                            src="/images/avatar-3.png"
                            alt="Profile photo 3"
                            size="profile-lg"
                        />
                    </div>
                    <CodeBlock
                        code={`<Avatar variant="profile" src="/images/avatar-1.png" alt="Profile photo 1" size="profile-sm" />
<Avatar variant="profile" src="/images/avatar-2.png" alt="Profile photo 2" size="profile-md" />
<Avatar variant="profile" src="/images/avatar-3.png" alt="Profile photo 3" size="profile-lg" />`}
                    />
                </div>

                {/* Profile photo with fallback */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Profile photo with fallback</h3>
                    <div className="flex gap-4 items-end mb-4">
                        <Avatar variant="profile" initials="PS" size="profile-sm" />
                        <Avatar variant="profile" placeholderIcon={User01} size="profile-md" />
                        <Avatar
                            variant="profile"
                            src="https://broken-url.jpg"
                            initials="BI"
                            size="profile-lg"
                        />
                    </div>
                    <CodeBlock
                        code={`<Avatar variant="profile" initials="PS" size="profile-sm" />
<Avatar variant="profile" placeholderIcon={User01} size="profile-md" />
<Avatar variant="profile" src="https://broken-url.jpg" initials="BI" size="profile-lg" />`}
                    />
                </div>

                {/* Sizes */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Sizes</h3>
                    <div className="flex gap-2 items-end mb-4">
                        <Avatar initials="XS" size="xxs" />
                        <Avatar initials="XS" size="xs" />
                        <Avatar initials="SM" size="sm" />
                        <Avatar initials="MD" size="md" />
                        <Avatar initials="LG" size="lg" />
                        <Avatar initials="XL" size="xl" />
                        <Avatar initials="2X" size="2xl" />
                    </div>
                    <CodeBlock
                        code={`<Avatar initials="XS" size="xxs" />
<Avatar initials="XS" size="xs" />
<Avatar initials="SM" size="sm" />
<Avatar initials="MD" size="md" />
<Avatar initials="LG" size="lg" />
<Avatar initials="XL" size="xl" />
<Avatar initials="2X" size="2xl" />`}
                    />
                </div>

                {/* Focusable */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Focusable</h3>
                    <a href="#" className="group inline-block">
                        <Avatar
                            src="/images/avatar-1.png"
                            alt="Clickable avatar"
                            focusable
                            size="md"
                        />
                    </a>
                    <CodeBlock
                        code={`<a href="#">
  <Avatar src="/images/avatar-1.png" alt="Clickable avatar" focusable size="md" />
</a>`}
                    />
                </div>

                {/* Contrast border off */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">No contrast border</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar src="/images/avatar-2.png" contrastBorder={false} size="md" />
                        <Avatar initials="NC" contrastBorder={false} size="md" />
                    </div>
                    <CodeBlock
                        code={`<Avatar src="/images/avatar-2.png" contrastBorder={false} size="md" />
<Avatar initials="NC" contrastBorder={false} size="md" />`}
                    />
                </div>

                {/* Custom badge */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-2">With custom badge</h3>
                    <Avatar
                        src="/images/avatar-4.png"
                        alt="User with badge"
                        size="md"
                        customBadge={
                            <div className="absolute -right-1 -bottom-1 size-4 rounded-full bg-utility-blue-500 flex items-center justify-center">
                                <span className="text-white text-xs">+</span>
                            </div>
                        }
                    />
                    <CodeBlock
                        code={`<Avatar
  src="/images/avatar-4.png"
  size="md"
  customBadge={
    <div className="absolute -right-1 -bottom-1 size-4 rounded-full bg-utility-blue-500 flex items-center justify-center">
      <span className="text-white text-xs">+</span>
    </div>
  }
/>`}
                    />
                </div>

                {/* Fallback */}
                <div>
                    <h3 className="font-semibold mb-2">Fallback</h3>
                    <div className="flex gap-4 mb-4">
                        <Avatar src="https://broken-url.jpg" initials="BI" size="md" />
                        <Avatar src="https://another-broken-url.jpg" size="md" />
                    </div>
                    <CodeBlock
                        code={`<Avatar src="https://broken-url.jpg" initials="BI" size="md" />
<Avatar src="https://another-broken-url.jpg" size="md" />`}
                    />
                </div>
            </section>

            {/* API Reference */}
            <section>
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
                                <td className="py-2 px-4 font-medium">src?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Image source</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">alt?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Alternative text</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">initials?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Fallback initials</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">size?</td>
                                <td className="py-2 px-4 text-sm">
                                    {`"xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "profile-sm" | "profile-md" | "profile-lg"`}
                                </td>
                                <td className="py-2 px-4 text-sm">{`"md"`}</td>
                                <td className="py-2 px-4 text-sm">
                                    Avatar size, including profile variants.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">variant?</td>
                                <td className="py-2 px-4 text-sm">{`"default" | "profile"`}</td>
                                <td className="py-2 px-4 text-sm">{`"default"`}</td>
                                <td className="py-2 px-4 text-sm">
                                    Renders a default avatar or a profile photo variant with a ring.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">status?</td>
                                <td className="py-2 px-4 text-sm">{`"online" | "offline"`}</td>
                                <td className="py-2 px-4 text-sm">{`"offline"`}</td>
                                <td className="py-2 px-4 text-sm">Status indicator</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">verified?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">Show verified check</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">focusable?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Adds a focusable style on the parent link.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">contrastBorder?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">true</td>
                                <td className="py-2 px-4 text-sm">
                                    Show a border that contrasts with the background. Only
                                    applicable to "profile" variant.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">customBadge?</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Custom badge element.</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-medium">className?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Additional styles.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
