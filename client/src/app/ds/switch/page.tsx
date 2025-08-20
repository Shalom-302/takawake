import React from "react";
import Link from "next/link";
import { 
  Switch
} from "@/ds/components/switch";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { CircleIcon, MoonIcon, SunIcon } from "lucide-react";

export default function SwitchPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Switch</h1>
        <p className="text-muted-foreground mt-2">
        Simplified API for the Switch component, including label and description.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Simplified API</CardTitle>
            <CardDescription>
              The Switch component offers a simplified API for creating switches with labels and descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example usage of Switch
<Switch
  label="Dark mode"
  description="Enable dark mode"
  variant="default"
  size="default"
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 space-y-4">
            <Switch
              label="Simple switch"
              description="Base example with label and description"
            />
            <Switch
              label="Switch activated by default"
              defaultChecked
            />
            <Switch
              label="Switch disabled"
              disabled
            />
            <Switch
              label="Switch disabled and checked"
              defaultChecked
              disabled
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Switch
  label="Simple switch"
  description="Base example with label and description"
/>

<Switch
  label="Switch activated by default"
  defaultChecked
/>

<Switch
  label="Switch disabled"
  disabled
/>

<Switch
  label="Switch disabled and checked"
  defaultChecked
  disabled
/>`} 
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["default", "primary", "secondary", "destructive", "success", "warning", "info", "neutral"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Variant: {variant}</strong>
              </p>
              <div className="mb-4">
                <Switch
                  variant={variant as any}
                  label={`Switch with variant ${variant}`}
                  description={`Description for variant ${variant}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Switch
  variant="${variant}"
  label="Switch with variant ${variant}"
  description="Description for variant ${variant}"
  defaultChecked
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
          {["default", "sm", "lg"].map(size => (
            <div key={size} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Size: {size}</strong>
              </p>
              <div className="mb-4">
                <Switch
                  size={size as any}
                  label={`Switch size ${size}`}
                  description={`Description for size ${size}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Switch
  size="${size}"
  label="Switch size ${size}"
  description="Description for size ${size}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumb variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Thumb variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "filled", "outlined"].map(thumbVariant => (
            <div key={thumbVariant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Thumb Variant: {thumbVariant}</strong>
              </p>
              <div className="mb-4">
                <Switch
                  thumbVariant={thumbVariant as any}
                  label={`Switch thumb variant ${thumbVariant}`}
                  description={`Description for thumb variant ${thumbVariant}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Switch
  thumbVariant="${thumbVariant}"
  label="Switch thumb variant ${thumbVariant}"
  description="Description for thumb variant ${thumbVariant}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumb sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Thumb sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "sm", "lg"].map(thumbSize => (
            <div key={thumbSize} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Thumb Size: {thumbSize}</strong>
              </p>
              <div className="mb-4">
                <Switch
                  thumbSize={thumbSize as any}
                  label={`Switch thumb size ${thumbSize}`}
                  description={`Description for thumb size ${thumbSize}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Switch
  thumbSize="${thumbSize}"
  label="Switch thumb size ${thumbSize}"
  description="Description for thumb size ${thumbSize}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* With icon */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">With icon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>With icon (withIcon)</strong>
            </p>
            <div className="mb-4">
              <Switch
                withIcon
                label="Switch with icon"
                description="Utilise l'icône par défaut"
                defaultChecked
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Switch
  withIcon
  label="Switch with icon"
  description="Utilise l'icône par défaut"
  defaultChecked
/>`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>With custom icon</strong>
            </p>
            <div className="mb-4">
              <Switch
                withIcon
                thumbIcon={<CircleIcon className="h-3 w-3" />}
                label="Switch with custom icon"
                description="Use a custom icon"
                defaultChecked
              />
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Switch
  withIcon
  thumbIcon={<CircleIcon className="h-3 w-3" />}
  label="Switch with custom icon"
  description="Use a custom icon"
  defaultChecked
/>`} 
            />
          </div>
        </div>
      </div>

      {/* Position du label */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Position du label</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["right", "left"].map(position => (
            <div key={position} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Label Position: {position}</strong>
              </p>
              <div className="mb-4">
                <Switch
                  labelPosition={position as "right" | "left"}
                  label={`Label at ${position}`}
                  description={`Description with label at ${position}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Switch
  labelPosition="${position}"
  label="Label at ${position}"
  description="Description with label at ${position}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* With custom classes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">With custom classes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Switch
              label="Switch with custom classes"
              description="Customize styles with classes"
              labelClassName="text-blue-600 font-bold"
              descriptionClassName="text-blue-400 italic"
              containerClassName="border border-blue-200 p-3 rounded-lg bg-blue-50"
              defaultChecked
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Switch
  label="Switch with custom classes"
  description="Customize styles with classes"
  labelClassName="text-blue-600 font-bold"
  descriptionClassName="text-blue-400 italic"
  containerClassName="border border-blue-200 p-3 rounded-lg bg-blue-50"
  defaultChecked
/>`} 
          />
        </div>
      </div>

      {/* Complete example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Complete example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Switch
              variant="primary"
              size="lg"
              thumbVariant="filled"
              thumbSize="lg"
              withIcon
              thumbIcon={<SunIcon className="h-4 w-4" />}
              label="Dark mode"
              description="Enable dark mode for better readability at night"
              labelPosition="left"
              defaultChecked
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Switch
  variant="primary"
  size="lg"
  thumbVariant="filled"
  thumbSize="lg"
  withIcon
  thumbIcon={<SunIcon className="h-4 w-4" />}
  label="Dark mode"
  description="Enable dark mode for better readability at night"
  labelPosition="left"
  defaultChecked
/>`} 
          />
        </div>
      </div>

      {/* Controlled example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Controlled example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Example of code for a controlled component :
              </p>
              <CodeBlock 
                code={`// In your React component
const [checked, setChecked] = React.useState(false);

return (
  <Switch
    label="Switch controlled"
    description="State is managed by React"
    checked={checked}
    onCheckedChange={setChecked}
  />
);`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage in a form */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Usage in a form</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Example of usage in a form :
              </p>
              <CodeBlock 
                code={`// In your form component
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <Switch
      name="notifications"
      label="Enable notifications"
      description="Receive alerts for new activities"
    />
    
    <Switch
      name="marketing"
      label="Email marketing"
      description="Receive our promotional offers"
    />
    
    <button type="submit">Save preferences</button>
  </div>
</form>`} 
              />
            </div>  
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Switch Props</CardTitle>
            <CardDescription>
              Props accepted by the Switch component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Prop</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">label</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Label of the switch</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">description</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Optional description</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">labelPosition</td>
                    <td className="py-2 px-4 text-sm">"right" | "left"</td>
                    <td className="py-2 px-4 text-sm">Position of the label relative to the switch</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">labelClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the label</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">descriptionClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the description</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">containerClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the container</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">variant</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the switch (default, primary, secondary, etc.)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size of the switch (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">thumbVariant</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the thumb (default, filled, outlined)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">thumbSize</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size of the thumb (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">withIcon</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the thumb should display an icon</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">thumbIcon</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Custom icon for the thumb</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">checked</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">State activated (controlled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">defaultChecked</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">State activated by default (uncontrolled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onCheckedChange</td>
                    <td className="py-2 px-4 text-sm">(checked: boolean) => void</td>
                    <td className="py-2 px-4 text-sm">Function called when the state changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">disabled</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the switch is disabled</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">name</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Name of the field in a form</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
