import React from "react";
import Link from "next/link";
import { Textarea } from "@/ds/components/textarea";
import { CodeBlock } from "@/ds/components/code-block";

export default function TextareaPage() {
  const variants = [
    {
      name: "default",
      description: "Default style",
    },
    {
      name: "outline",
      description: "Thicker border",
    },
    {
      name: "ghost",
      description: "Transparent background with hover effect",
    },
    {
      name: "underline",
      description: "Style with bottom border only",
    },
    {
      name: "filled",
      description: "Filled background",
    },
    {
      name: "success",
      description: "For validated fields",
    },
    {
      name: "warning",
      description: "For fields requiring attention",
    },
    {
      name: "error",
      description: "For fields with error",
    },
    {
      name: "info",
      description: "For informative fields",
    },
  ];

  const sizes = ["sm", "md", "default", "lg", "xl"];
  const roundedStyles = ["none", "sm", "default", "lg", "full"];
  const resizeOptions = ["none", "default", "vertical", "horizontal"];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Textarea</h1>
        <p className="text-muted-foreground mt-2">
          Textarea with different variants, sizes, and rounded styles.
        </p>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {variants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Textarea 
                  variant={variant.name as any} 
                  placeholder={`Textarea ${variant.name}`} 
                  className="w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {variant.description}
              </p>
              <CodeBlock 
                className="mt-2"
                code={`<Textarea variant="${variant.name}" placeholder="Textarea ${variant.name}" />`} 
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
              <div className="mb-4">
                <Textarea 
                  size={size as any} 
                  placeholder={`Taille ${size}`} 
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Textarea size="${size}" placeholder="Taille ${size}" />`} 
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
              <div className="mb-4">
                <Textarea 
                  rounded={rounded as any} 
                  placeholder={`Rounded ${rounded}`} 
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Textarea rounded="${rounded}" placeholder="Arrondi ${rounded}" />`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Resize options */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Resize options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resizeOptions.map(resize => (
            <div key={resize} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Textarea 
                  resize={resize as "none" | "default" | "vertical" | "horizontal"} 
                  placeholder={`Resize ${resize}`} 
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Textarea resize="${resize}" placeholder="Resize ${resize}" />`} 
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
            <div className="mb-4">
              <Textarea 
                variant={"outline" as "outline"} 
                size={"lg" as "lg"} 
                rounded={"lg" as "lg"}
                resize={"vertical" as "vertical"}
                placeholder="Textarea with thicker border" 
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Textarea variant="outline" size="lg" rounded="lg" resize="vertical" placeholder="Textarea avec bordure épaisse" />`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <Textarea 
                variant={"filled" as "filled"} 
                size={"md" as "md"} 
                rounded={"full" as "full"}
                resize={"none" as "none"}
                placeholder="Textarea with coloured background" 
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Textarea variant="filled" size="md" rounded="full" resize="none" placeholder="Textarea avec fond coloré" />`} 
            />
          </div>
        </div>
      </div>

      {/* States */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <Textarea 
                disabled
                placeholder="Disabled textarea" 
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Textarea disabled placeholder="Disabled textarea" />`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <Textarea 
                readOnly
                value="Readonly textarea"
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Textarea readOnly value="Readonly textarea" />`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
