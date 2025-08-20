import React from "react";
import Link from "next/link";
import { 
  Tooltip
} from "@/ds/components/tooltip";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";
import { Button } from "@/ds/components/button";
import { InfoIcon, HelpCircleIcon, AlertCircleIcon } from "lucide-react";

export default function TooltipPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Tooltip</h1>
        <p className="text-muted-foreground mt-2">
          API simplified for the Tooltip component, allowing to define the content and trigger in one go.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>API simplified</CardTitle>
            <CardDescription>
              The Tooltip component offers a simplified API for creating tooltips without having to define TooltipProvider, Tooltip, TooltipTrigger and TooltipContent separately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example usage of Tooltip
<Tooltip
  content="Additional information"
>
  <Button>Hover me</Button>
</Tooltip>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex flex-wrap gap-4">
            <Tooltip content="Additional information">
              <Button>Hover me</Button>
            </Tooltip>
            
            <Tooltip content="Click for more information">
              <Button variant="outline">
                <InfoIcon className="h-4 w-4 mr-2" />
                Help
              </Button>
            </Tooltip>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tooltip content="Additional information">
  <Button>Hover me</Button>
</Tooltip>

<Tooltip content="Click for more information">
  <Button variant="outline">
    <InfoIcon className="h-4 w-4 mr-2" />
    Help
  </Button>
</Tooltip>`} 
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "wide", "narrow"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Variant: {variant}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Tooltip
                  variant={variant as any}
                  content={`Tooltip variant ${variant}`}
                >
                  <Button variant="outline" size="sm">Variant {variant}</Button>
                </Tooltip>
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tooltip
  variant="${variant}"
  content="Tooltip variant ${variant}"
>
  <Button variant="outline" size="sm">Variant ${variant}</Button>
</Tooltip>`} 
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
              <div className="mb-4 flex justify-center">
                <Tooltip
                  size={size as any}
                  content={`Tooltip size ${size}`}
                >
                  <Button variant="outline" size="sm">Size {size}</Button>
                </Tooltip>
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tooltip
  size="${size}"
  content="Tooltip size ${size}"
>
  <Button variant="outline" size="sm">Size ${size}</Button>
</Tooltip>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounded */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rounded</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "none", "sm", "lg", "xl", "full"].map(rounded => (
            <div key={rounded} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Rounded: {rounded}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Tooltip
                  rounded={rounded as any}
                  content={`Tooltip rounded ${rounded}`}
                >
                  <Button variant="outline" size="sm">Rounded {rounded}</Button>
                </Tooltip>
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tooltip
  rounded="${rounded}"
  content="Tooltip rounded ${rounded}"
>
  <Button variant="outline" size="sm">Rounded ${rounded}</Button>
</Tooltip>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["top", "right", "bottom", "left"].map(side => (
            <div key={side} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Side: {side}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Tooltip
                  side={side as any}
                  content={`Tooltip position ${side}`}
                >
                  <Button variant="outline" size="sm">Position {side}</Button>
                </Tooltip>
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tooltip
  side="${side}"
  content="Tooltip position ${side}"
>
  <Button variant="outline" size="sm">Position ${side}</Button>
</Tooltip>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Alignments */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Alignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["center", "start", "end"].map(align => (
            <div key={align} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Align: {align}</strong>
              </p>
              <div className="mb-4 flex justify-center">
                <Tooltip
                  side="top"
                  align={align as any}
                  content={`Tooltip align ${align}`}
                >
                  <Button variant="outline" size="sm">Align {align}</Button>
                </Tooltip>
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tooltip
  side="top"
  align="${align}"
  content="Tooltip align ${align}"
>
  <Button variant="outline" size="sm">Align ${align}</Button>
</Tooltip>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Delays */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Delays</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Custom delay (0ms)</strong>
            </p>
            <div className="mb-4 flex justify-center">
              <Tooltip
                delayDuration={0}
                content="Appears immediately"
              >
                <Button variant="outline" size="sm">Delay 0ms</Button>
              </Tooltip>
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Tooltip
  delayDuration={0}
  content="Appears immediately"
>
  <Button variant="outline" size="sm">Delay 0ms</Button>
</Tooltip>`} 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Custom delay (1000ms)</strong>
            </p>
            <div className="mb-4 flex justify-center">
              <Tooltip
                delayDuration={1000}
                content="Appears after 1 second"
              >
                <Button variant="outline" size="sm">Delay 1000ms</Button>
              </Tooltip>
            </div>
            <CodeBlock 
              className="mt-2"
              code={`<Tooltip
  delayDuration={1000}
  content="Appears after 1 second"
>
  <Button variant="outline" size="sm">Delay 1000ms</Button>
</Tooltip>`} 
            />
          </div>
        </div>
      </div>

      {/* Rich content */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rich content</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Tooltip
              variant="wide"
              content={
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Important information</p>
                    <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                  </div>
                </div>
              }
            >
              <Button variant="destructive" size="sm">Delete</Button>
            </Tooltip>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tooltip
  variant="wide"
  content={
    <div className="flex items-start gap-2">
      <AlertCircleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
      <div>
        <p className="font-semibold">Important information</p>
        <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
      </div>
    </div>
  }
>
  <Button variant="destructive" size="sm">Supprimer</Button>
</Tooltip>`} 
          />
        </div>
      </div>

      {/* Custom classes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Custom classes</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Tooltip
              content="Tooltip with custom classes"
              contentClassName="bg-blue-600 text-white border-blue-700"
              triggerClassName="cursor-help"
              className="italic"
            >
              <Button variant="outline" size="sm">Custom classes</Button>
            </Tooltip>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tooltip
  content="Tooltip with custom classes"
  contentClassName="bg-blue-600 text-white border-blue-700"
  triggerClassName="cursor-help"
  className="italic"
>
  <Button variant="outline" size="sm">Custom classes</Button>
</Tooltip>`} 
          />
        </div>
      </div>

      {/* Complete example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Complete example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <Tooltip
              variant="wide"
              size="lg"
              rounded="lg"
              side="top"
              align="center"
              sideOffset={10}
              delayDuration={300}
              avoidCollisions={true}
              content={
                <div className="flex items-center gap-2">
                  <HelpCircleIcon className="h-5 w-5 text-blue-500" />
                  <span>Need help? Click to access the assistance center.</span>
                </div>
              }
              contentClassName="shadow-lg"
            >
              <Button>
                <HelpCircleIcon className="h-4 w-4 mr-2" />
                Assistance center
              </Button>
            </Tooltip>
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tooltip
  variant="wide"
  size="lg"
  rounded="lg"
  side="top"
  align="center"
  sideOffset={10}
  delayDuration={300}
  avoidCollisions={true}
  content={
    <div className="flex items-center gap-2">
      <HelpCircleIcon className="h-5 w-5 text-blue-500" />
      <span>Need help? Click to access the assistance center.</span>
    </div>
  }
  contentClassName="shadow-lg"
>
  <Button>
    <HelpCircleIcon className="h-4 w-4 mr-2" />
    Assistance center
  </Button>
</Tooltip>`} 
          />
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Tooltip Props</CardTitle>
            <CardDescription>
              Props accepted by the Tooltip component
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
                    <td className="py-2 px-4 font-medium">content</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Tooltip content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">children</td>
                    <td className="py-2 px-4 text-sm">React.ReactNode</td>
                    <td className="py-2 px-4 text-sm">Tooltip trigger element</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">variant</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Tooltip style (default, wide, narrow)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Text size (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">rounded</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Border radius (default, none, sm, lg, xl, full)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">side</td>
                    <td className="py-2 px-4 text-sm">"top" | "right" | "bottom" | "left"</td>
                    <td className="py-2 px-4 text-sm">Tooltip position relative to the trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">sideOffset</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Distance between the tooltip and the trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">align</td>
                    <td className="py-2 px-4 text-sm">"start" | "center" | "end"</td>
                    <td className="py-2 px-4 text-sm">Tooltip alignment relative to the trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">alignOffset</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Alignment offset</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">avoidCollisions</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the tooltip should avoid collisions with the screen edges</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">delayDuration</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Delay before the tooltip is displayed (in ms)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">skipDelayDuration</td>
                    <td className="py-2 px-4 text-sm">number</td>
                    <td className="py-2 px-4 text-sm">Delay to ignore during quick interactions</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">disableHoverableContent</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">Disable the ability to hover the tooltip content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">className</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the container</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">contentClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the tooltip content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">triggerClassName</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Classes CSS for the trigger</td>
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
