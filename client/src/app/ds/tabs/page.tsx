import React from "react";
import Link from "next/link";
import { 
  Tabs
} from "@/ds/components/tabs";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";

export default function TabsPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Tabs</h1>
        <p className="text-muted-foreground mt-2">
        Simplified API for the Tabs component, allowing you to define tabs and their content in one go.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Simplified API</CardTitle>
            <CardDescription>
              The Tabs component offers a simplified API for creating tabs without having to define separate TabsList, TabsTrigger and TabsContent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example of Tabs usage
<Tabs
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content of tab 1</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content of tab 2</p>
    }
  ]}
  variant="default"
  size="default"
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base Example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base Example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Tabs
              tabs={[
                {
                  value: "tab1",
                  label: "Tab 1",
                  content: <p>Content of tab 1</p>
                },
                {
                  value: "tab2",
                  label: "Tab 2",
                  content: <p>Content of tab 2</p>
                },
                {
                  value: "tab3",
                  label: "Tab 3",
                  content: <p>Content of tab 3</p>
                }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tabs
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content of tab 1</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content of tab 2</p>
    },
    {
      value: "tab3",
      label: "Tab 3",
      content: <p>Content of tab 3</p>
    }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 gap-8">
          {["default", "pills", "underlined", "cards", "minimal"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Variant: {variant}</strong>
              </p>
              <div className="mb-4">
                <Tabs
                  variant={variant as any}
                  tabs={[
                    {
                      value: "tab1",
                      label: "Tab 1",
                      content: <p>Content with variant {variant}</p>
                    },
                    {
                      value: "tab2",
                      label: "Tab 2",
                      content: <p>Contenu avec variant {variant}</p>
                    },
                    {
                      value: "tab3",
                      label: "Onglet 3",
                      content: <p>Contenu avec variant {variant}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tabs
  variant="${variant}"
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content with variant ${variant}</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content with variant ${variant}</p>
    },
    {
      value: "tab3",
      label: "Tab 3",
      content: <p>Content with variant ${variant}</p>
    }
  ]}
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
                <Tabs
                  size={size as any}
                  tabs={[
                    {
                      value: "tab1",
                      label: "Tab 1",
                      content: <p>Content with size {size}</p>
                    },
                    {
                      value: "tab2",
                      label: "Tab 2",
                      content: <p>Content with size {size}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tabs
  size="${size}"
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content with size ${size}</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content with size ${size}</p>
    }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["fade", "slide", "zoom"].map(animation => (
            <div key={animation} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Animation: {animation}</strong>
              </p>
              <div className="mb-4">
                <Tabs
                  animation={animation as any}
                  tabs={[
                    {
                      value: "tab1",
                      label: "Tab 1",
                      content: <p>Content with animation {animation}</p>
                    },
                    {
                      value: "tab2",
                      label: "Tab 2",
                      content: <p>Content with animation {animation}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tabs
  animation="${animation}"
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content with animation ${animation}</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content with animation ${animation}</p>
    }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Distributions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Distributions</h2>
        <div className="grid grid-cols-1 gap-6">
          {["default", "equal", "start", "center", "end"].map(distribution => (
            <div key={distribution} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Distribution: {distribution}</strong>
              </p>
              <div className="mb-4">
                <Tabs
                  fullWidth={true}
                  distribution={distribution as any}
                  tabs={[
                    {
                      value: "tab1",
                      label: "Tab 1",
                      content: <p>Content with distribution {distribution}</p>
                    },
                    {
                      value: "tab2",
                      label: "Tab 2",
                      content: <p>Content with distribution {distribution}</p>
                    },
                    {
                      value: "tab3",
                      label: "Tab 3",
                      content: <p>Content with distribution {distribution}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Tabs
  fullWidth={true}
  distribution="${distribution}"
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content with distribution ${distribution}</p>
    },
    {
      value: "tab2",
      label: "Tab 2",
      content: <p>Content with distribution ${distribution}</p>
    },
    {
      value: "tab3",
      label: "Tab 3",
      content: <p>Content with distribution ${distribution}</p>
    }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Complete example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Complete example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Tabs
              variant="pills"
              size="lg"
              fullWidth={true}
              distribution="equal"
              animation="fade"
              padding="md"
              tabs={[
                {
                  value: "profile",
                  label: "Profile",
                  content: (
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="text-lg font-medium">User profile</h3>
                      <p>Profile information with fade animation.</p>
                    </div>
                  )
                },
                {
                  value: "settings",
                  label: "Settings",
                  content: (
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="text-lg font-medium">Account settings</h3>
                      <p>Manage your preferences and settings.</p>
                    </div>
                  )
                },
                {
                  value: "notifications",
                  label: "Notifications",
                  content: (
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="text-lg font-medium">Notification center</h3>
                      <p>Manage your alerts and notifications.</p>
                    </div>
                  )
                }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tabs
  variant="pills"
  size="lg"
  fullWidth={true}
  distribution="equal"
  animation="fade"
  padding="md"
  tabs={[
    {
      value: "profile",
      label: "Profile",
      content: (
        <div className="bg-muted/30 rounded-md p-4">
          <h3 className="text-lg font-medium">User profile</h3>
          <p>Profile information with fade animation.</p>
        </div>
      )
    },
    {
      value: "settings",
      label: "Settings",
      content: (
        <div className="bg-muted/30 rounded-md p-4">
          <h3 className="text-lg font-medium">Account settings</h3>
          <p>Manage your preferences and settings.</p>
        </div>
      )
    },
    {
      value: "notifications",
      label: "Notifications",
      content: (
        <div className="bg-muted/30 rounded-md p-4">
          <h3 className="text-lg font-medium">Notification center</h3>
          <p>Manage your alerts and notifications.</p>
        </div>
      )
    }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* Disabled tab */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Disabled tab</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Tabs
              tabs={[
                {
                  value: "tab1",
                  label: "Tab 1",
                  content: <p>Content of tab 1</p>
                },
                {
                  value: "tab2",
                  label: "Tab 2 (disabled)",
                  content: <p>Content of tab 2</p>,
                  disabled: true
                },
                {
                  value: "tab3",
                  label: "Tab 3",
                  content: <p>Content of tab 3</p>
                }
              ]}
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Tabs
  tabs={[
    {
      value: "tab1",
      label: "Tab 1",
      content: <p>Content of tab 1</p>
    },
    {
      value: "tab2",
      label: "Tab 2 (disabled)",
      content: <p>Content of tab 2</p>,
      disabled: true
    },
    {
      value: "tab3",
      label: "Tab 3",
      content: <p>Content of tab 3</p>
    }
  ]}
/>`} 
          />
        </div>
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">API Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Tabs Props</CardTitle>
            <CardDescription>
              Props accepted by the Tabs component
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
                    <td className="py-2 px-4 font-medium">tabs</td>
                    <td className="py-2 px-4 text-sm">TabItem[]</td>
                    <td className="py-2 px-4 text-sm">Array of objects defining the tabs and their content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">defaultValue</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Default selected tab value</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">value</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Selected tab value (controlled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onValueChange</td>
                    <td className="py-2 px-4 text-sm">(value: string) => void</td>
                    <td className="py-2 px-4 text-sm">Function called when the tab changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">variant</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the tabs (default, pills, underlined, cards, minimal)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">size</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size of the tabs (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">fullWidth</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the tabs should take up the full width available</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">distribution</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Distribution of the tabs (default, equal, start, center, end)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">animation</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Animation of the content (default, fade, slide, zoom)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">padding</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Padding of the content (default, sm, md, lg)</td>
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
