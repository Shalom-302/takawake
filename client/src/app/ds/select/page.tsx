import React from "react";
import Link from "next/link";
import { Select, SelectOption, type SelectProps } from "@/ds/components/select";
import { CodeBlock } from "@/ds/components/code-block";

export default function SelectPage() {
  const triggerVariants: Array<{name: SelectProps['variant'], description: string}> = [
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
      description: "Ghost style",
    },
    {
      name: "underline",
      description: "Underline style",
    },
    {
      name: "filled",
      description: "Filled style",
    },
  ];

  const contentVariants: Array<{name: SelectProps['contentVariant'], description: string}> = [
    {
      name: "default",
      description: "Default style",
    },
    {
      name: "elevated",
      description: "Elevated style",
    },
    {
      name: "bordered",
      description: "Bordered style",
    },
    {
      name: "minimal",
      description: "Minimal style",
    },
  ];

  const sizes: Array<SelectProps['size']> = ["default", "sm", "lg"];
  const roundedStyles: Array<SelectProps['rounded']> = ["default", "full", "none"];
  const states: Array<SelectProps['state']> = ["default", "error", "success"];
  const alignments: Array<SelectProps['contentAlign']> = ["default", "center", "end"];
  
  // Common options for all examples
  const fruitOptions: SelectOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
  ];
  
  const fruitOptionsWithGroup = [
    {
      label: "Fruits",
      options: fruitOptions
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Select</h1>
        <p className="text-muted-foreground mt-2">
          Select component with different styles, sizes and variants.
        </p>
      </div>

      {/* Trigger Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Trigger Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {triggerVariants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Select
                  variant={variant.name}
                  placeholder={`Variant ${variant.name}`}
                  options={fruitOptionsWithGroup}
                  label="Fruits"
                  className="w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {variant.description}
              </p>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  variant="${variant.name}"
  placeholder="Variant ${variant.name}"
  options={[
    {
      label: "Fruits",
      options: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "orange", label: "Orange" }
      ]
    }
  ]}
  label="Fruits"
  className="w-full"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Content Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentVariants.map(variant => (
            <div key={variant.name} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Select
                  contentVariant={variant.name}
                  placeholder={`Contenu ${variant.name}`}
                  options={fruitOptionsWithGroup}
                  label="Fruits"
                  className="w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {variant.description}
              </p>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  contentVariant="${variant.name}"
  placeholder="Content ${variant.name}"
  options={[
    {
      label: "Fruits",
      options: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "orange", label: "Orange" }
      ]
    }
  ]}
  label="Fruits"
  className="w-full"
/>`} 
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
                <Select
                  size={size}
                  placeholder={`Taille ${size}`}
                  options={[
                    { value: "option", label: "Option" },
                    { value: "option2", label: "Option 2" }
                  ]}
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  size="${size}"
  placeholder="Taille ${size}"
  options={[
    { value: "option", label: "Option" },
    { value: "option2", label: "Option 2" }
  ]}
  className="w-full"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounded Styles */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rounded Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roundedStyles.map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Select
                  rounded={rounded}
                  placeholder={`Rounded ${rounded}`}
                  options={[
                    { value: "option", label: "Option" },
                    { value: "option2", label: "Option 2" }
                  ]}
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  rounded="${rounded}"
  placeholder="Rounded ${rounded}"
  options={[
    { value: "option", label: "Option" },
    { value: "option2", label: "Option 2" }
  ]}
  className="w-full"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* States */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {states.map(state => (
            <div key={state} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Select
                  state={state}
                  placeholder={`State ${state}`}
                  options={[
                    { value: "option", label: "Option" },
                    { value: "option2", label: "Option 2" }
                  ]}
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  state="${state}"
  placeholder="State ${state}"
  options={[
    { value: "option", label: "Option" },
    { value: "option2", label: "Option 2" }
  ]}
  className="w-full"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Alignments */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Alignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alignments.map(align => (
            <div key={align} className="p-4 border rounded-lg">
              <div className="mb-4">
                <Select
                  contentAlign={align === "default" ? undefined : align as "center" | "end" | undefined}
                  placeholder={`Alignment ${align}`}
                  options={[
                    { value: "option", label: "Option" },
                    { value: "option2", label: "Option 2" }
                  ]}
                  className="w-full"
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Select
  ${align === "default" ? "" : `contentAlign="${align}"`}
  placeholder="Alignment ${align}"
  options={[
    { value: "option", label: "Option" },
    { value: "option2", label: "Option 2" }
  ]}
  className="w-full"
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Combinaisons */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <Select
                variant="outline"
                size="lg"
                rounded="full"
                contentVariant="elevated"
                contentAlign="center"
                placeholder="Styled selection"
                label="Categories"
                options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                  { value: "option3", label: "Option 3" }
                ]}
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Select
  variant="outline"
  size="lg"
  rounded="full"
  contentVariant="elevated"
  contentAlign="center"
  placeholder="Styled selection"
  label="Categories"
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ]}
  className="w-full"
/>`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <Select
                variant="filled"
                state="success"
                contentVariant="bordered"
                placeholder="Validated selection"
                label="Validated options"
                options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" }
                ]}
                className="w-full"
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Select
  variant="filled"
  state="success"
  contentVariant="bordered"
  placeholder="Validated selection"
  label="Validated options"
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]}
  className="w-full"
/>`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
