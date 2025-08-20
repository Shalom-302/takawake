import React from "react";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/ds/components/card";
import { Button } from "@/ds/components/button";
import { CodeBlock } from "@/ds/components/code-block";

export default function CardPage() {
  const variants = [
    {
      name: "default",
      description: "Default style",
    },
    {
      name: "outline",
      description: "Outline style",
    },
    {
      name: "ghost",
      description: "Transparent without shadow",
    },
    {
      name: "glass",
      description: "Glass effect with background blur",
    },
    {
      name: "accent",
      description: "Accent color",
    },
    {
      name: "destructive",
      description: "Destructive color",
    },
    {
      name: "success",
      description: "Success color",
    },
    {
      name: "warning",
      description: "Warning color",
    },
    {
      name: "info",
      description: "Info color",
    },
    {
      name: "neutral",
      description: "Neutral color",
    },
  ];

  const sizes = ["xs", "sm", "default", "md", "lg", "xl"];
  const hoverEffects = ["default", "lift", "glow", "scale", "border"];
  const roundedStyles = ["none", "sm", "default", "md", "lg", "full"];
  const shadowStyles = ["none", "sm", "default", "md", "lg", "xl"];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Card</h1>
        <p className="text-muted-foreground mt-2">
          Card component with different variants, sizes, and hover effects.
        </p>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {variants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg">
              <Card variant={variant.name as any} className="w-full">
                <CardHeader>
                  <CardTitle>Card {variant.name}</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content with variant {variant.name}.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              <p className="text-sm text-muted-foreground mt-4">
                {variant.description}
              </p>
              <CodeBlock 
                className="mt-2"
                code={`<Card variant="${variant.name}">
  <CardHeader>
    <CardTitle>Card ${variant.name}</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content with variant ${variant.name}.</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sizes.map(size => (
            <div key={size} className="p-4 border rounded-lg">
              <Card size={size as any} className="w-full">
                <CardHeader>
                  <CardTitle>Size {size}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Card with size {size}.</p>
                </CardContent>
              </Card>
              <CodeBlock 
                className="mt-4"
                code={`<Card size="${size}">
  <CardHeader>
    <CardTitle>Size ${size}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card with size ${size}.</p>
  </CardContent>
</Card>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hover Effects */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Hover Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hoverEffects.map(hover => (
            <div key={hover} className="p-4 border rounded-lg">
              <Card hover={hover as any} className="w-full">
                <CardHeader>
                  <CardTitle>Hover effect {hover}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Card with hover effect {hover}.</p>
                </CardContent>
              </Card>
              <CodeBlock 
                className="mt-4"
                code={`<Card hover="${hover}">
  <CardHeader>
    <CardTitle>Hover effect ${hover}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card with hover effect ${hover}.</p>
  </CardContent>
</Card>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounded styles */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rounded styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roundedStyles.map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <Card 
                rounded={rounded as "none" | "sm" | "default" | "md" | "lg" | "full"} 
                className="w-full"
              >
                <CardHeader>
                  <CardTitle>Rounded style {rounded}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Card with rounded style {rounded}.</p>
                </CardContent>
              </Card>
              <CodeBlock 
                className="mt-4"
                code={`<Card rounded="${rounded}">
  <CardHeader>
    <CardTitle>Rounded style ${rounded}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card with rounded style ${rounded}.</p>
  </CardContent>
</Card>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Shadow styles */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Shadow styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shadowStyles.map(shadow => (
            <div key={shadow} className="p-4 border rounded-lg">
              <Card 
                shadow={shadow as "none" | "sm" | "default" | "md" | "lg" | "xl"} 
                className="w-full"
              >
                <CardHeader>
                  <CardTitle>Shadow style {shadow}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Card with shadow style {shadow}.</p>
                </CardContent>
              </Card>
              <CodeBlock 
                className="mt-4"
                code={`<Card shadow="${shadow}">
  <CardHeader>
    <CardTitle>Shadow style ${shadow}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card with shadow style ${shadow}.</p>
  </CardContent>
</Card>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Combinations */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <Card 
              variant={"glass" as "glass"} 
              size={"lg" as "lg"} 
              hover={"scale" as "scale"} 
              rounded={"lg" as "lg"}
              shadow={"xl" as "xl"}
              className="w-full"
            >
              <CardHeader>
                <CardTitle>Card glass effect</CardTitle>
                <CardDescription>With large size, scale hover effect, rounded corners and XL shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card combines several custom properties.</p>
              </CardContent>
              <CardFooter>
                <Button variant={"default"}>Action</Button>
              </CardFooter>
            </Card>
            <CodeBlock 
              className="mt-4"
              code={`<Card variant="glass" size="lg" hover="scale" rounded="lg" shadow="xl">
  <CardHeader>
    <CardTitle>Card glass effect</CardTitle>
    <CardDescription>With large size, scale hover effect, rounded corners and XL shadow</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This card combines several custom properties.</p>
  </CardContent>
  <CardFooter>
    <Button variant="default">Action</Button>
  </CardFooter>
</Card>`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <Card 
              variant={"outline" as "outline"} 
              size={"md" as "md"} 
              hover={"border" as "border"} 
              rounded={"full" as "full"}
              shadow={"none" as "none"}
              className="w-full"
            >
              <CardHeader>
                <CardTitle>Card with outline</CardTitle>
                <CardDescription>With medium size, border hover effect and fully rounded corners</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Another combination of custom properties.</p>
              </CardContent>
              <CardFooter>
                <Button>More info</Button>
              </CardFooter>
            </Card>
            <CodeBlock 
              className="mt-4"
              code={`<Card variant="outline" size="md" hover="border" rounded="full" shadow="none">
  <CardHeader>
    <CardTitle>Card with outline</CardTitle>
    <CardDescription>With medium size, border hover effect and fully rounded corners</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Another combination of custom properties.</p>
  </CardContent>
  <CardFooter>
    <Button>More info</Button>
  </CardFooter>
</Card>`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
