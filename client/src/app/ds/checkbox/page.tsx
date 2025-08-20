import React from "react";
import Link from "next/link";
import { 
  Checkbox,
} from "@/ds/components/checkbox";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";

export default function CheckboxPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Checkbox</h1>
        <p className="text-muted-foreground mt-2">
        Simplified API for the Checkbox component, including label and description.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Simplified API</CardTitle>
            <CardDescription>
              The Checkbox component offers a simplified API for creating checkboxes with labels and descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example usage of Checkbox
<Checkbox
  label="Accept terms and conditions"
  description="Accept the terms and conditions"
  variant="default"
  size="default"
  rounded="default"
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
            <Checkbox
              label="Simple checkbox"
              description="Base example with label and description"
            />
            <Checkbox
              label="Checked checkbox"
              defaultChecked
            />
            <Checkbox
              label="Disabled checkbox"
              disabled
            />
            <Checkbox
              label="Checked and disabled checkbox"
              defaultChecked
              disabled
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Checkbox
  label="Simple checkbox"
  description="Base example with label and description"
/>

<Checkbox
  label="Checked checkbox"
  defaultChecked
/>

<Checkbox
  label="Disabled checkbox"
  disabled
/>

<Checkbox
  label="Checked and disabled checkbox"
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
          {["default", "primary", "secondary", "destructive", "outline"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Variant: {variant}</strong>
              </p>
              <div className="mb-4">
                <Checkbox
                  variant={variant as any}
                  label={`Checkbox variant ${variant}`}
                  description={`Description for variant ${variant}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Checkbox
  variant="${variant}"
  label="Checkbox variant ${variant}"
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
                <Checkbox
                  size={size as any}
                  label={`Checkbox size ${size}`}
                  description={`Description for size ${size}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Checkbox
  size="${size}"
  label="Checkbox size ${size}"
  description="Description for size ${size}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounded */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rounded</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "none", "sm", "md", "lg", "full"].map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Rounded: {rounded}</strong>
              </p>
              <div className="mb-4">
                <Checkbox
                  rounded={rounded as any}
                  label={`Checkbox rounded ${rounded}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Checkbox
  rounded="${rounded}"
  label="Checkbox rounded ${rounded}"
  defaultChecked
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
          {["default", "hover", "focus", "disabled"].map(state => (
            <div key={state} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>State: {state}</strong>
              </p>
              <div className="mb-4">
                <Checkbox
                  state={state as any}
                  label={`Checkbox state ${state}`}
                  disabled={state === "disabled"}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Checkbox
  state="${state}"
  label="Checkbox state ${state}"
  ${state === "disabled" ? "disabled" : ""}
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Label position */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Label position</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["right", "left"].map(position => (
            <div key={position} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Label Position: {position}</strong>
              </p>
              <div className="mb-4">
                <Checkbox
                  labelPosition={position as "right" | "left"}
                  label={`Label position ${position}`}
                  description={`Description with label position ${position}`}
                  defaultChecked
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Checkbox
  labelPosition="${position}"
  label="Label position ${position}"
  description="Description with label position ${position}"
  defaultChecked
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom classes example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Custom classes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Checkbox
              label="Checkbox with custom classes"
              description="Custom classes example"
              labelClassName="text-blue-600 font-bold"
              descriptionClassName="text-blue-400 italic"
              containerClassName="border border-blue-200 p-3 rounded-lg bg-blue-50"
              defaultChecked
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Checkbox
  label="Checkbox with custom classes"
  description="Custom classes example"
  labelClassName="text-blue-600 font-bold"
  descriptionClassName="text-blue-400 italic"
  containerClassName="border border-blue-200 p-3 rounded-lg bg-blue-50"
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
  <Checkbox
    label="Checkbox controlled"
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

      {/* Form example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Form example</h2>
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
    <Checkbox
      name="terms"
      label="I accept the terms and conditions"
      required
    />
    
    <Checkbox
      name="newsletter"
      label="I want to receive the newsletter"
      description="You will receive our latest news by email"
    />
    
    <button type="submit">Subscribe</button>
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
            <CardTitle>Checkbox Props</CardTitle>
            <CardDescription>
              Props accepted by the Checkbox component
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
                    <td className="py-2 px-4 text-sm">Label of the checkbox</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">description</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Optional description</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">labelPosition</td>
                    <td className="py-2 px-4 text-sm">"right" | "left"</td>
                    <td className="py-2 px-4 text-sm">Position of the label relative to the checkbox</td>
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
                    <td className="py-2 px-4 text-sm">Style of the checkbox (default, primary, secondary, destructive, outline)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size of the checkbox (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">rounded</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Rounded corners (default, none, sm, md, lg, full)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">state</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Visual state (default, hover, focus, disabled)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">checked</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">Checked state (controlled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">defaultChecked</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">Default checked state (uncontrolled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onCheckedChange</td>
                    <td className="py-2 px-4 text-sm">(checked: boolean) => void</td>
                    <td className="py-2 px-4 text-sm">Function called when the state changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">disabled</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the checkbox is disabled</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">required</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the checkbox is required in a form</td>
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
