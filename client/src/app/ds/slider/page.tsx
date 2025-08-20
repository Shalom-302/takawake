import React from "react";
import Link from "next/link";
import { Slider } from "@/ds/components/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { RawTabs as Tabs, TabsContent, TabsList, TabsTrigger } from "@/ds/components/tabs";
import { CodeBlock } from "@/ds/components/code-block";

export default function SliderPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Slider</h1>
        <p className="text-muted-foreground mt-2">
          An interactive component that allows users to select a value or range from a specified range.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Slider Component</CardTitle>
            <CardDescription>
              The Slider component provides an intuitive way for users to select values within a specified range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example of Slider usage
<Slider defaultValue={[50]} max={100} step={1} />`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base Example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base Example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="w-full max-w-md mx-auto py-8">
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Slider defaultValue={[50]} max={100} step={1} />`}
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <Slider variant="default" defaultValue={[50]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Primary</h3>
                <Slider variant="primary" defaultValue={[60]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Success</h3>
                <Slider variant="success" defaultValue={[70]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Warning</h3>
                <Slider variant="warning" defaultValue={[40]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Error</h3>
                <Slider variant="error" defaultValue={[30]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Info</h3>
                <Slider variant="info" defaultValue={[80]} max={100} step={1} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Slider variant="default" defaultValue={[50]} max={100} step={1} />
<Slider variant="primary" defaultValue={[60]} max={100} step={1} />
<Slider variant="success" defaultValue={[70]} max={100} step={1} />
<Slider variant="warning" defaultValue={[40]} max={100} step={1} />
<Slider variant="error" defaultValue={[30]} max={100} step={1} />
<Slider variant="info" defaultValue={[80]} max={100} step={1} />`}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Small</h3>
                <Slider size="sm" defaultValue={[50]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <Slider size="default" defaultValue={[60]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Large</h3>
                <Slider size="lg" defaultValue={[70]} max={100} step={1} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Slider size="sm" defaultValue={[50]} max={100} step={1} />
<Slider size="default" defaultValue={[60]} max={100} step={1} />
<Slider size="lg" defaultValue={[70]} max={100} step={1} />`}
          />
        </div>
      </div>

      {/* Range Slider */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Range Slider</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="w-full max-w-md mx-auto py-8">
              <Slider defaultValue={[25, 75]} max={100} step={1} />
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Slider defaultValue={[25, 75]} max={100} step={1} />`}
          />
        </div>
      </div>

      {/* Custom Thumb Size */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Custom Thumb Size</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Small Thumb</h3>
                <Slider size="default" thumbSize="sm" defaultValue={[50]} max={100} step={1} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Large Thumb</h3>
                <Slider size="default" thumbSize="lg" defaultValue={[60]} max={100} step={1} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Slider size="default" thumbSize="sm" defaultValue={[50]} max={100} step={1} />
<Slider size="default" thumbSize="lg" defaultValue={[60]} max={100} step={1} />`}
          />
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Prop</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Default</th>
                <th className="py-2 px-4 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">variant</td>
                <td className="py-2 px-4 font-mono text-sm">
                  'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
                </td>
                <td className="py-2 px-4 font-mono text-sm">'default'</td>
                <td className="py-2 px-4">The visual style of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">size</td>
                <td className="py-2 px-4 font-mono text-sm">
                  'sm' | 'default' | 'lg'
                </td>
                <td className="py-2 px-4 font-mono text-sm">'default'</td>
                <td className="py-2 px-4">The size of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">thumbSize</td>
                <td className="py-2 px-4 font-mono text-sm">
                  'sm' | 'default' | 'lg'
                </td>
                <td className="py-2 px-4 font-mono text-sm">Same as size</td>
                <td className="py-2 px-4">The size of the slider thumb.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">defaultValue</td>
                <td className="py-2 px-4 font-mono text-sm">number[]</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">The default value of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">value</td>
                <td className="py-2 px-4 font-mono text-sm">number[]</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">The controlled value of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">onValueChange</td>
                <td className="py-2 px-4 font-mono text-sm">(value: number[]) => void</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Callback function when the value changes.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">min</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">0</td>
                <td className="py-2 px-4">The minimum value of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">max</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">100</td>
                <td className="py-2 px-4">The maximum value of the slider.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">step</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">1</td>
                <td className="py-2 px-4">The step increment value.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">disabled</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">false</td>
                <td className="py-2 px-4">Whether the slider is disabled.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
