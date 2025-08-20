import React from "react";
import Link from "next/link";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/ds/components/avatar";
import { CodeBlock } from "@/ds/components/code-block";

export default function AvatarPage() {
  const variants = [
    {
      name: "default",
      description: "Circular shape by default",
    },
    {
      name: "rounded",
      description: "Slightly rounded corners",
    },
    {
      name: "square",
      description: "Square shape without rounded corners",
    },
    {
      name: "soft",
      description: "Very rounded corners",
    },
  ];

  const sizes = [
    {
      name: "xs",
      description: "Extra small (24px)",
    },
    {
      name: "sm",
      description: "Small (32px)",
    },
    {
      name: "default",
      description: "Medium (40px)",
    },
    {
      name: "lg",
      description: "Large (48px)",
    },
    {
      name: "xl",
      description: "Extra large (64px)",
    },
    {
      name: "2xl",
      description: "Double extra large (80px)",
    },
  ];

  const borders = [
    {
      name: "none",
      description: "No border",
    },
    {
      name: "default",
      description: "Standard border",
    },
    {
      name: "primary",
      description: "Primary color border",
    },
    {
      name: "secondary",
      description: "Secondary color border",
    },
    {
      name: "accent",
      description: "Accent color border",
    },
  ];

  const statuses = [
    {
      name: "none",
      description: "No status indicator",
    },
    {
      name: "online",
      description: "Online status indicator (green)",
    },
    {
      name: "offline",
      description: "Offline status indicator (gray)",
    },
    {
      name: "busy",
      description: "Busy status indicator (red)",
    },
    {
      name: "away",
      description: "Away status indicator (yellow)",
    },
  ];

  const fallbackVariants = [
    {
      name: "default",
      description: "Neutral background",
    },
    {
      name: "primary",
      description: "Primary color background",
    },
    {
      name: "secondary",
      description: "Secondary color background",
    },
    {
      name: "accent",
      description: "Accent color background",
    },
    {
      name: "gradient",
      description: "Gradient background",
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Avatar</h1>
        <p className="text-muted-foreground mt-2">
          Avatar component with different shapes, sizes, borders, and status indicators.
        </p>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Shapes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {variants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg flex flex-col items-center">
              <Avatar variant={variant.name as any} className="mb-4">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{variant.name}</p>
              <p className="text-xs text-muted-foreground text-center">{variant.description}</p>
              <CodeBlock 
                className="mt-2 w-full"
                code={`<Avatar variant="${variant.name}">
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sizes.map(size => (
            <div key={size.name} className="p-4 border rounded-lg flex flex-col items-center">
              <Avatar size={size.name as any} className="mb-4">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{size.name}</p>
              <p className="text-xs text-muted-foreground text-center">{size.description}</p>
              <CodeBlock 
                className="mt-2 w-full"
                code={`<Avatar size="${size.name}">
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Borders */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Borders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borders.map(border => (
            <div key={border.name} className="p-4 border rounded-lg flex flex-col items-center">
              <Avatar border={border.name as any} className="mb-4">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{border.name}</p>
              <p className="text-xs text-muted-foreground text-center">{border.description}</p>
              <CodeBlock 
                className="mt-2 w-full"
                code={`<Avatar border="${border.name}">
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Statuses */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Status indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statuses.map(status => (
            <div key={status.name} className="p-4 border rounded-lg flex flex-col items-center">
              <Avatar status={status.name as any} className="mb-4">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{status.name}</p>
              <p className="text-xs text-muted-foreground text-center">{status.description}</p>
              <CodeBlock 
                className="mt-2 w-full"
                code={`<Avatar status="${status.name}">
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Fallback variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fallbackVariants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg flex flex-col items-center">
              <Avatar className="mb-4">
                <AvatarFallback variant={variant.name as any}>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{variant.name}</p>
              <p className="text-xs text-muted-foreground text-center">{variant.description}</p>
              <CodeBlock 
                className="mt-2 w-full"
                code={`<Avatar>
  <AvatarFallback variant="${variant.name}">CN</AvatarFallback>
</Avatar>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Group */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Avatar group</h2>
        <div className="p-4 border rounded-lg">
          <div className="flex mb-4">
            <Avatar group={true}>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar group={true}>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback variant="primary">JD</AvatarFallback>
            </Avatar>
            <Avatar group={true}>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback variant="secondary">AB</AvatarFallback>
            </Avatar>
            <Avatar group={true}>
              <AvatarFallback variant="accent">+2</AvatarFallback>
            </Avatar>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<div className="flex">
  <Avatar group={true}>
    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar group={true}>
    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
    <AvatarFallback variant="primary">JD</AvatarFallback>
  </Avatar>
  <Avatar group={true}>
    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
    <AvatarFallback variant="secondary">AB</AvatarFallback>
  </Avatar>
  <Avatar group={true}>
    <AvatarFallback variant="accent">+2</AvatarFallback>
  </Avatar>
</div>`} 
          />
        </div>
      </div>

      {/* Combinations */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Avatar variant={"soft" as any} size={"xl" as any} border={"primary" as any} status={"online" as any} className="mb-4">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback variant={"gradient" as any}>CN</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">Complete avatar</p>
            <p className="text-xs text-muted-foreground text-center">Combination of shape, size, border and status</p>
            <CodeBlock 
              className="mt-2 w-full"
              code={`<Avatar 
  variant="soft" 
  size="xl" 
  border="primary" 
  status="online"
>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback variant="gradient">CN</AvatarFallback>
</Avatar>`} 
            />
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Avatar variant={"square" as any} size={"lg" as any} border={"accent" as any} className="mb-4">
              <AvatarFallback variant={"secondary" as any}>JD</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">Square avatar with fallback</p>
            <p className="text-xs text-muted-foreground text-center">Usage without image with styled fallback</p>
            <CodeBlock 
              className="mt-2 w-full"
              code={`<Avatar 
  variant="square" 
  size="lg" 
  border="accent"
>
  <AvatarFallback variant="secondary">JD</AvatarFallback>
</Avatar>`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
