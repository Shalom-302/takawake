"use client";
import { useState } from "react";
import { Slideout, SlideoutCustom } from "@/components/ui/slideout-menu";
import { ArrowLeft, Menu, Settings, User, Bell, ShoppingCart, X, Check } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail01, User01 } from "@untitled-ui/icons-react";
import { Switch } from "@/components/ui/switch";

export default function SlideoutPage() {
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);
    const [isOpen4, setIsOpen4] = useState(false);
    const [isOpen5, setIsOpen5] = useState(false);

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <button className="hover:underline mb-4 inline-flex items-center text-sm text-gray-600">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </button>
                <h1 className="text-3xl font-bold mt-2">Slideout Menu</h1>
                <p className="text-gray-600 mt-2">
                    Flexible slideout menu components for creating side panels, navigation drawers,
                    and modal-like experiences that slide in from the edge of the screen.
                </p>
            </div>

            {/* Basic Slideout */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">1. Basic Slideout</h2>
                <p className="text-sm text-gray-600 mb-6">
                    The simplest slideout menu with title, description, and content.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Button onClick={() => setIsOpen1(true)}>Open Slideout</Button>

                    <Slideout
                        open={isOpen1}
                        onOpenChange={setIsOpen1}
                        title="Slideout Title"
                        description="This is a basic slideout menu with a title and description."
                        content={
                            <div className="space-y-4 flex-1">
                                <p className="text-primary">
                                    This is the main content area of the slideout. You can put any
                                    content here.
                                </p>
                                <p className="text-primary">
                                    The slideout slides in from the right side of the screen and
                                    includes a backdrop overlay.
                                </p>
                            </div>
                        }
                        footer={
                            <div className="flex gap-3 justify-end">
                                <Button onClick={() => setIsOpen1(false)} variant={"secondary"}>
                                    Cancel
                                </Button>
                                <Button>Save Changes</Button>
                            </div>
                        }
                    />
                </div>

                <CodeBlock
                    code={`
<>
    <Button onClick={() => setIsOpen1(true)}>Open Slideout</Button>

    <Slideout
        open={isOpen1}
        onOpenChange={setIsOpen1}
        title="Slideout Title"
        description="This is a basic slideout menu with a title and description."
        content={
            <div className="space-y-4 flex-1">
                <p className="text-primary">
                    This is the main content area of the slideout. You can put any
                    content here.
                </p>
                <p className="text-primary">
                    The slideout slides in from the right side of the screen and
                    includes a backdrop overlay.
                </p>
            </div>
        }
        footer={
            <div className="flex gap-3 justify-end">
                <Button onClick={() => setIsOpen1(false)} variant={"secondary"}>
                    Cancel
                </Button>
                <Button>Save Changes</Button>
            </div>
        }
    />
</>`}
                />
            </div>

            {/* Navigation Menu */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">2. Navigation Menu</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Use slideout for mobile navigation with icons and structured menu items.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Button onClick={() => setIsOpen2(true)} leftIcon={Menu}>
                        Open Menu
                    </Button>
                    <Slideout
                        open={isOpen2}
                        onOpenChange={setIsOpen2}
                        title="Navigation"
                        description="Browse through our menu"
                        content={
                            <nav className="space-y-1">
                                {[
                                    { icon: User, label: "Profile", badge: null },
                                    { icon: Settings, label: "Settings", badge: null },
                                    { icon: Bell, label: "Notifications", badge: "3" },
                                    { icon: ShoppingCart, label: "Cart", badge: "12" },
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className="text-gray-600" />
                                            <span className="font-medium text-gray-900">
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <span className="px-2 py-1 text-xs font-semibold bg-utility-blue-100  text-utility-blue-700 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        }
                        footer={
                            <Button onClick={() => setIsOpen2(false)} className="w-full">
                                Close Menu
                            </Button>
                        }
                    />
                </div>

                <CodeBlock
                    code={`
<>
    <Button onClick={() => setIsOpen2(true)} leftIcon={Menu}>
        Open Menu
    </Button>
    <Slideout
        open={isOpen2}
        onOpenChange={setIsOpen2}
        title="Navigation"
        description="Browse through our menu"
        content={
            <nav className="space-y-1">
                {[
                    { icon: User, label: "Profile", badge: null },
                    { icon: Settings, label: "Settings", badge: null },
                    { icon: Bell, label: "Notifications", badge: "3" },
                    { icon: ShoppingCart, label: "Cart", badge: "12" },
                ].map(item => (
                    <button
                        key={item.label}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className="text-gray-600" />
                            <span className="font-medium text-gray-900">
                                {item.label}
                            </span>
                        </div>
                        {item.badge && (
                            <span className="px-2 py-1 text-xs font-semibold bg-utility-blue-100  text-utility-blue-700 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        }
        footer={
            <Button onClick={() => setIsOpen2(false)} className="w-full">
                Close Menu
            </Button>
        }
    />
</>`}
                />
            </div>

            {/* Settings Panel */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">3. Settings Panel</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Create a settings panel with form controls and toggles.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Button onClick={() => setIsOpen3(true)} leftIcon={Settings}>
                        Open Settings
                    </Button>
                    <Slideout
                        open={isOpen3}
                        onOpenChange={setIsOpen3}
                        title="Settings"
                        description="Manage your account preferences"
                        content={
                            <div className="space-y-6">
                                <Input
                                    type="text"
                                    placeholder="Enter your name"
                                    leftIcon={User01}
                                />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    leftIcon={Mail01}
                                />
                            </div>
                        }
                        footer={
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Marketing Emails</p>
                                    <p className="text-sm text-gray-500">
                                        Receive promotional content
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        }
                    />
                </div>

                <CodeBlock
                    code={`
<>
  <Button onClick={() => setIsOpen3(true)} leftIcon={Settings}>
      Open Settings
  </Button>
  <Slideout
      open={isOpen3}
      onOpenChange={setIsOpen3}
      title="Settings"
      description="Manage your account preferences"
      content={
          <div className="space-y-6">
              <Input
                  type="text"
                  placeholder="Enter your name"
                  leftIcon={User01}
              />
              <Input
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={Mail01}
              />
          </div>
      }
      footer={
          <div className="flex items-center justify-between">
              <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-500">
                      Receive promotional content
                  </p>
              </div>
              <Switch />
          </div>
      }
  />
</>
`}
                />
            </div>

            {/* Shopping Cart */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">4. Shopping Cart</h2>
                <p className="text-sm text-gray-600 mb-6">
                    E-commerce cart slideout with product list and checkout.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Button onClick={() => setIsOpen4(true)} leftIcon={ShoppingCart}>
                        View Cart (3)
                    </Button>
                    <Slideout
                        open={isOpen4}
                        onOpenChange={setIsOpen4}
                        title="Shopping Cart"
                        description="3 items in your cart"
                        content={
                            <div className="space-y-4">
                                {[
                                    { name: "Wireless Headphones", price: 99.99, qty: 1 },
                                    { name: "Smart Watch", price: 249.99, qty: 1 },
                                    { name: "Phone Case", price: 19.99, qty: 1 },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            IMG
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Quantity: {item.qty}
                                            </p>
                                            <p className="font-semibold text-gray-900 mt-2">
                                                ${item.price}
                                            </p>
                                        </div>
                                        <button className="text-gray-400 hover:text-red-600">
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span>$369.97</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping</span>
                                        <span>$10.00</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>$379.97</span>
                                    </div>
                                </div>
                            </div>
                        }
                        footer={<Button className="w-full">Proceed to Checkout</Button>}
                    />
                </div>

                <CodeBlock
                    code={`
<>
    <Button onClick={() => setIsOpen4(true)} leftIcon={ShoppingCart}>
        View Cart (3)
    </Button>
    <Slideout
        open={isOpen4}
        onOpenChange={setIsOpen4}
        title="Shopping Cart"
        description="3 items in your cart"
        content={
            <div className="space-y-4">
                {[
                    { name: "Wireless Headphones", price: 99.99, qty: 1 },
                    { name: "Smart Watch", price: 249.99, qty: 1 },
                    { name: "Phone Case", price: 19.99, qty: 1 },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            IMG
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                                {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Quantity: {item.qty}
                            </p>
                            <p className="font-semibold text-gray-900 mt-2">
                                $\{item.price}
                            </p>
                        </div>
                        <button className="text-gray-400 hover:text-red-600">
                            <X size={20} />
                        </button>
                    </div>
                ))}

                <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>$369.97</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>$10.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>$379.97</span>
                    </div>
                </div>
            </div>
        }
        footer={<Button className="w-full">Proceed to Checkout</Button>}
    />
</>
`}
                />
            </div>

            {/* Notification Panel */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">5. Notification Panel</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Display notifications and updates in a slideout panel.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Button onClick={() => setIsOpen5(true)} leftIcon={Bell} className="relative">
                        Notifications
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            5
                        </span>
                    </Button>

                    <SlideoutCustom.Root open={isOpen5} onOpenChange={setIsOpen5}>
                        <SlideoutCustom.Content>
                            <SlideoutCustom.Header>
                                <SlideoutCustom.Title>Notifications</SlideoutCustom.Title>
                                <SlideoutCustom.Description>
                                    You have 5 unread notifications
                                </SlideoutCustom.Description>
                            </SlideoutCustom.Header>

                            <SlideoutCustom.Body>
                                <div className="space-y-3">
                                    {[
                                        {
                                            type: "success",
                                            title: "Payment received",
                                            desc: "Your payment of $99.99 was processed",
                                            time: "2m ago",
                                        },
                                        {
                                            type: "info",
                                            title: "New message",
                                            desc: "You have a new message from John",
                                            time: "1h ago",
                                        },
                                        {
                                            type: "warning",
                                            title: "Update available",
                                            desc: "A new version is available",
                                            time: "3h ago",
                                        },
                                        {
                                            type: "success",
                                            title: "Order shipped",
                                            desc: "Your order #1234 has been shipped",
                                            time: "1d ago",
                                        },
                                        {
                                            type: "info",
                                            title: "Welcome!",
                                            desc: "Thanks for signing up",
                                            time: "2d ago",
                                        },
                                    ].map((notif, i) => (
                                        <div
                                            key={i}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        notif.type === "success"
                                                            ? "bg-green-100"
                                                            : notif.type === "warning"
                                                              ? "bg-yellow-100"
                                                              : "bg-blue-100"
                                                    }`}
                                                >
                                                    <Check
                                                        size={16}
                                                        className={
                                                            notif.type === "success"
                                                                ? "text-green-600"
                                                                : notif.type === "warning"
                                                                  ? "text-yellow-600"
                                                                  : "text-blue-600"
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {notif.desc}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {notif.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SlideoutCustom.Body>

                            <SlideoutCustom.Footer>
                                <Button className="w-full">Mark all as read</Button>
                            </SlideoutCustom.Footer>
                        </SlideoutCustom.Content>
                    </SlideoutCustom.Root>
                </div>

                <CodeBlock
                    code={`
<div className="border border-gray-200 rounded-lg p-8 mb-4">
    <Button onClick={() => setIsOpen5(true)} leftIcon={Bell} className="relative">
        Notifications
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            5
        </span>
    </Button>

    <SlideoutCustom.Root open={isOpen5} onOpenChange={setIsOpen5}>
        <SlideoutCustom.Content>
            <SlideoutCustom.Header>
                <SlideoutCustom.Title>Notifications</SlideoutCustom.Title>
                <SlideoutCustom.Description>
                    You have 5 unread notifications
                </SlideoutCustom.Description>
            </SlideoutCustom.Header>

            <SlideoutCustom.Body>
                <div className="space-y-3">
                    {[
                        {
                            type: "success",
                            title: "Payment received",
                            desc: "Your payment of $99.99 was processed",
                            time: "2m ago",
                        },
                        {
                            type: "info",
                            title: "New message",
                            desc: "You have a new message from John",
                            time: "1h ago",
                        },
                        {
                            type: "warning",
                            title: "Update available",
                            desc: "A new version is available",
                            time: "3h ago",
                        },
                        {
                            type: "success",
                            title: "Order shipped",
                            desc: "Your order #1234 has been shipped",
                            time: "1d ago",
                        },
                        {
                            type: "info",
                            title: "Welcome!",
                            desc: "Thanks for signing up",
                            time: "2d ago",
                        },
                    ].map((notif, i) => (
                        <div
                            key={i}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div
                                    className={\`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 \${
                                        notif.type === "success"
                                            ? "bg-green-100"
                                            : notif.type === "warning"
                                              ? "bg-yellow-100"
                                              : "bg-blue-100"
                                    }\`}
                                >
                                    <Check
                                        size={16}
                                        className={
                                            notif.type === "success"
                                                ? "text-green-600"
                                                : notif.type === "warning"
                                                  ? "text-yellow-600"
                                                  : "text-blue-600"
                                        }
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">
                                        {notif.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {notif.desc}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {notif.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SlideoutCustom.Body>

            <SlideoutCustom.Footer>
                <Button className="w-full">Mark all as read</Button>
            </SlideoutCustom.Footer>
        </SlideoutCustom.Content>
    </SlideoutCustom.Root>
</div>
`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 pb-2">API Reference</h2>

                <h3 className="text-xl font-medium mt-6 mb-3">Slideout Props (Simple API)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="py-2 px-4 text-left font-medium">Prop</th>
                                <th className="py-2 px-4 text-left font-medium">Type</th>
                                <th className="py-2 px-4 text-left font-medium">Default</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">open</td>
                                <td className="py-2 px-4 font-mono text-xs">boolean</td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Controls the open state</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">onOpenChange</td>
                                <td className="py-2 px-4 font-mono text-xs">
                                    (open: boolean) =&gt; void
                                </td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Callback when open state changes</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">title</td>
                                <td className="py-2 px-4 font-mono text-xs">string</td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Header title</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">description</td>
                                <td className="py-2 px-4 font-mono text-xs">string</td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Header description</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">content</td>
                                <td className="py-2 px-4 font-mono text-xs">ReactNode</td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Main content area</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">footer</td>
                                <td className="py-2 px-4 font-mono text-xs">ReactNode</td>
                                <td className="py-2 px-4 font-mono text-xs">—</td>
                                <td className="py-2 px-4">Footer content</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">showCloseButton</td>
                                <td className="py-2 px-4 font-mono text-xs">boolean</td>
                                <td className="py-2 px-4 font-mono text-xs">true</td>
                                <td className="py-2 px-4">Show close button in header</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium mt-8 mb-3">SlideoutCustom Components</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="py-2 px-4 text-left font-medium">Component</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Root</td>
                                <td className="py-2 px-4">
                                    Main wrapper with drawer functionality
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Trigger</td>
                                <td className="py-2 px-4">Button to open the slideout</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Content</td>
                                <td className="py-2 px-4">Main slideout panel container</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Header</td>
                                <td className="py-2 px-4">Header section with close button</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Title</td>
                                <td className="py-2 px-4">Title text component</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Description</td>
                                <td className="py-2 px-4">Description text component</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Body</td>
                                <td className="py-2 px-4">Scrollable content area</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-xs">Footer</td>
                                <td className="py-2 px-4">Footer section for actions</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
