import React from "react";
import Link from "next/link";
import { Progress } from "@/ds/components/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { RawTabs as Tabs, TabsContent, TabsList, TabsTrigger } from "@/ds/components/tabs";
import { CodeBlock } from "@/ds/components/code-block";

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Progress</h1>
        <p className="text-muted-foreground mt-2">
          A visual indicator showing the completion status of a task or operation.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Progress Component</CardTitle>
            <CardDescription>
              The Progress component displays a visual indicator of completion status for tasks or operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example of Progress usage
<Progress value={45} />`} 
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
              <Progress value={45} />
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Progress value={45} />`}
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
                <Progress variant="default" value={45} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Primary</h3>
                <Progress variant="primary" value={55} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Success</h3>
                <Progress variant="success" value={65} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Warning</h3>
                <Progress variant="warning" value={35} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Error</h3>
                <Progress variant="error" value={25} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Info</h3>
                <Progress variant="info" value={75} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Progress variant="default" value={45} />
<Progress variant="primary" value={55} />
<Progress variant="success" value={65} />
<Progress variant="warning" value={35} />
<Progress variant="error" value={25} />
<Progress variant="info" value={75} />`}
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
                <Progress size="sm" value={45} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <Progress size="default" value={55} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Large</h3>
                <Progress size="lg" value={65} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Progress size="sm" value={45} />
<Progress size="default" value={55} />
<Progress size="lg" value={65} />`}
          />
        </div>
      </div>

      {/* Animation */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Animation</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Animated (Default)</h3>
                <Progress animated={true} value={65} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Non-Animated</h3>
                <Progress animated={false} value={65} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Progress animated={true} value={65} />
<Progress animated={false} value={65} />`}
          />
        </div>
      </div>

      {/* Combined Examples */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Combined Examples</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Small Success Progress</h3>
                <Progress variant="success" size="sm" value={85} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Large Warning Progress</h3>
                <Progress variant="warning" size="lg" value={35} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Non-Animated Error Progress</h3>
                <Progress variant="error" animated={false} value={25} />
              </div>
            </div>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Progress variant="success" size="sm" value={85} />
<Progress variant="warning" size="lg" value={35} />
<Progress variant="error" animated={false} value={25} />`}
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
                <td className="py-2 px-4">The visual style of the progress bar.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">size</td>
                <td className="py-2 px-4 font-mono text-sm">
                  'sm' | 'default' | 'lg'
                </td>
                <td className="py-2 px-4 font-mono text-sm">'default'</td>
                <td className="py-2 px-4">The size of the progress bar.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">value</td>
                <td className="py-2 px-4 font-mono text-sm">number</td>
                <td className="py-2 px-4 font-mono text-sm">0</td>
                <td className="py-2 px-4">The current value of the progress bar (0-100).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">animated</td>
                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                <td className="py-2 px-4 font-mono text-sm">true</td>
                <td className="py-2 px-4">Whether to animate the progress indicator when value changes.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-mono text-sm">className</td>
                <td className="py-2 px-4 font-mono text-sm">string</td>
                <td className="py-2 px-4 font-mono text-sm">-</td>
                <td className="py-2 px-4">Additional CSS classes to apply to the progress bar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
