"use client";
import { CodeBlock } from "@/components/ui/code-block";
import { Carousel, CarouselCustom } from "@/components/ui/carousel";
import { ArrowLeft } from "@untitled-ui/icons-react";
import Link from "next/link";
import Image from "next/image";

export default function CarouselPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-primary">Carousel</h1>
                <p className="text-tertiary mt-2">
                    A flexible and accessible carousel component for displaying content in a sliding
                    format. Built with Embla Carousel for smooth animations and touch support.
                </p>
            </div>

            {/* Basic Carousel */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">1. Basic Carousel</h2>
                <p className="text-sm text-tertiary mb-6">
                    The simplest way to use the carousel with default controls and indicators.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Carousel
                        items={[
                            <div
                                key={1}
                                className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg text-white text-2xl font-bold"
                            >
                                Slide 1
                            </div>,
                            <div
                                key={2}
                                className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg text-white text-2xl font-bold"
                            >
                                Slide 2
                            </div>,
                            <div
                                key={3}
                                className="flex items-center justify-center h-64 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg text-white text-2xl font-bold"
                            >
                                Slide 3
                            </div>,
                        ]}
                    />
                </div>

                <CodeBlock
                    code={`import { Carousel } from "@/components/ui/carousel";

<Carousel
    items={[
      <div>Slide 1</div>,
      <div>Slide 2</div>,
      <div>Slide 3</div>,
    ]}
/>`}
                />
            </div>

            {/* Image Carousel */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">2. Image Carousel</h2>
                <p className="text-sm text-tertiary mb-6">
                    Perfect for showcasing product images or photo galleries.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Carousel
                        items={[
                            <div key={1} className="w-full h-[400px] relative">
                                <Image
                                    src="/img1.webp"
                                    alt="Image 1"
                                    fill
                                    className="object-cover"
                                />
                            </div>,
                            <div key={2} className="w-full h-[400px] relative">
                                <Image
                                    src="/img2.avif"
                                    alt="Image 2"
                                    fill
                                    className="object-cover"
                                />
                            </div>,
                            <div key={3} className="w-full h-[400px] relative">
                                <Image
                                    src="/img3.avif"
                                    alt="Image 3"
                                    fill
                                    className="object-cover"
                                />
                            </div>,
                        ]}
                        contentClassName="gap-2"
                        itemClassName="overflow-hidden rounded-xl"
                    />
                </div>

                <CodeBlock
                    code={`import { Carousel } from "@/components/ui/carousel";
import Image from "next/image";

<Carousel
    items={[
      <div key={1} className="w-full h-[400px] relative"><Image src="/img1.webp" alt="Image 1" fill className="object-cover" /></div>,
      <div key={2} className="w-full h-[400px] relative"><Image src="/img2.avif" alt="Image 2" fill className="object-cover" /></div>,
      <div key={3} className="w-full h-[400px] relative"><Image src="/img3.avif" alt="Image 3" fill className="object-cover" /></div>,
    ]}
    contentClassName="gap-2"
    itemClassName="overflow-hidden rounded-xl"
/>`}
                />
            </div>

            {/* Testimonial Carousel */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    3. Testimonial Carousel
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Display customer testimonials with custom styling.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <Carousel
                        items={[
                            <div
                                key={1}
                                className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm"
                            >
                                <p className="text-lg text-gray-700 mb-4 italic">
                                    {
                                        "This product has completely transformed how we work. Highly recommend!"
                                    }
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        JD
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">John Doe</p>
                                        <p className="text-sm text-gray-500">CEO, Company Inc.</p>
                                    </div>
                                </div>
                            </div>,
                            <div
                                key={2}
                                className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm"
                            >
                                <p className="text-lg text-gray-700 mb-4 italic">
                                    {
                                        "Incredible experience from start to finish. The team was amazing!"
                                    }
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                        JS
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Jane Smith</p>
                                        <p className="text-sm text-gray-500">
                                            Designer, Studio XYZ
                                        </p>
                                    </div>
                                </div>
                            </div>,
                            <div
                                key={3}
                                className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm"
                            >
                                <p className="text-lg text-gray-700 mb-4 italic">
                                    {
                                        "Best investment we've made this year. Results speak for themselves."
                                    }
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                        MB
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Mike Brown</p>
                                        <p className="text-sm text-gray-500">
                                            Founder, Startup Labs
                                        </p>
                                    </div>
                                </div>
                            </div>,
                        ]}
                        opts={{ loop: true, align: "center" }}
                        controlsClassName="bg-gray-800/80 hover:bg-gray-800"
                    />
                </div>

                <CodeBlock
                    code={`import { Carousel } from "@/components/ui/carousel";

<Carousel
  items={[
    <div className="p-8 bg-white rounded-lg">
      <p className="text-lg mb-4">"Amazing product!"</p>
      <div className="flex items-center gap-3">
        <img src="/avatar.jpg" className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-semibold">John Doe</p>
          <p className="text-sm text-gray-500">CEO, Company</p>
        </div>
      </div>
    </div>,
    // More testimonials...
  ]}
  opts={{ loop: true }}
/>`}
                />
            </div>

            {/* Carousel Without Controls */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    4. Auto-play Carousel
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Carousel without manual controls, ideal for banner rotations.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <Carousel
                        items={[
                            <div
                                key={1}
                                className="flex items-center justify-center h-48 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg text-white"
                            >
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">Summer Sale</h3>
                                    <p className="text-lg">Up to 50% off</p>
                                </div>
                            </div>,
                            <div
                                key={2}
                                className="flex items-center justify-center h-48 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg text-white"
                            >
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
                                    <p className="text-lg">Check out our latest collection</p>
                                </div>
                            </div>,
                            <div
                                key={3}
                                className="flex items-center justify-center h-48 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-lg text-white"
                            >
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">Free Shipping</h3>
                                    <p className="text-lg">On orders over $50</p>
                                </div>
                            </div>,
                        ]}
                        showControls={false}
                        opts={{ loop: true }}
                    />
                </div>

                <CodeBlock
                    code={`import { Carousel } from "@/components/ui/carousel";

<Carousel
  items={[...]}
  showControls={false}
  opts={{ loop: true }}
/>`}
                />
            </div>

            {/* Custom Carousel with CarouselCustom */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    5. Advanced Custom Carousel
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    For complex use cases, use CarouselCustom for full control over layout and
                    behavior.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <CarouselCustom.Root opts={{ align: "start", loop: true }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Featured Products</h3>
                            <div className="flex gap-2">
                                <CarouselCustom.PrevTrigger className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-30">
                                    ←
                                </CarouselCustom.PrevTrigger>
                                <CarouselCustom.NextTrigger className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-30">
                                    →
                                </CarouselCustom.NextTrigger>
                            </div>
                        </div>
                        <CarouselCustom.Content className="gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <CarouselCustom.Item key={i} className="basis-1/2 md:basis-1/3">
                                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="bg-gray-100 h-40 rounded-md mb-3 flex items-center justify-center text-gray-400">
                                            Product {i}
                                        </div>
                                        <h4 className="font-semibold mb-1">Product Name {i}</h4>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Description of product
                                        </p>
                                        <p className="font-bold text-lg">
                                            ${(i * 29.99).toFixed(2)}
                                        </p>
                                    </div>
                                </CarouselCustom.Item>
                            ))}
                        </CarouselCustom.Content>
                        <CarouselCustom.IndicatorGroup className="flex justify-center gap-2 mt-4">
                            {({ index }) => (
                                <CarouselCustom.Indicator
                                    key={index}
                                    index={index}
                                    className={({ isSelected }) =>
                                        `h-2 transition-all rounded-full ${
                                            isSelected ? "w-8 bg-gray-800" : "w-2 bg-gray-300"
                                        }`
                                    }
                                />
                            )}
                        </CarouselCustom.IndicatorGroup>
                    </CarouselCustom.Root>
                </div>

                <CodeBlock
                    code={`import { CarouselCustom } from "@/components/ui/carousel";

<CarouselCustom.Root opts={{ align: "start", loop: true }}>
  <div className="flex justify-between items-center mb-4">
    <h3>Featured Products</h3>
    <div className="flex gap-2">
      <CarouselCustom.PrevTrigger>←</CarouselCustom.PrevTrigger>
      <CarouselCustom.NextTrigger>→</CarouselCustom.NextTrigger>
    </div>
  </div>
  
  <CarouselCustom.Content className="gap-4">
    <CarouselCustom.Item className="basis-1/3">
      {/* Your content */}
    </CarouselCustom.Item>
  </CarouselCustom.Content>
  
  <CarouselCustom.IndicatorGroup>
    {({ index }) => (
      <CarouselCustom.Indicator 
        key={index} 
        index={index} 
      />
    )}
  </CarouselCustom.IndicatorGroup>
</CarouselCustom.Root>`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">API Reference</h2>

                <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">
                    Carousel Props (Simple API)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                                <th className="py-2 px-4 text-left font-medium">Prop</th>
                                <th className="py-2 px-4 text-left font-medium">Type</th>
                                <th className="py-2 px-4 text-left font-medium">Default</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">items</td>
                                <td className="py-2 px-4 font-mono">ReactNode[]</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Array of slides to display in the carousel.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">opts?</td>
                                <td className="py-2 px-4 font-mono">CarouselOptions</td>
                                <td className="py-2 px-4 font-mono">{}</td>
                                <td className="py-2 px-4">
                                    Embla Carousel options (loop, align, etc.).
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">orientation?</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;horizontal&quot; | &quot;vertical&quot;
                                </td>
                                <td className="py-2 px-4 font-mono">&quot;horizontal&quot;</td>
                                <td className="py-2 px-4">Direction of the carousel.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">showControls?</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4 font-mono">true</td>
                                <td className="py-2 px-4">
                                    Show previous/next navigation buttons.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">showIndicators?</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4 font-mono">true</td>
                                <td className="py-2 px-4">Show dot indicators for each slide.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">controlsClassName?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">Custom classes for control buttons.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">indicatorsClassName?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Custom classes for indicators container.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">itemClassName?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Custom classes for each carousel item.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">contentClassName?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">Custom classes for content container.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium mt-8 mb-3 text-gray-700">
                    CarouselCustom Components
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                                <th className="py-2 px-4 text-left font-medium">Component</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">Root</td>
                                <td className="py-2 px-4">
                                    Main carousel wrapper with context provider.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">Content</td>
                                <td className="py-2 px-4">
                                    Container for carousel items with overflow handling.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">Item</td>
                                <td className="py-2 px-4">Individual slide wrapper.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">PrevTrigger</td>
                                <td className="py-2 px-4">Button to navigate to previous slide.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">NextTrigger</td>
                                <td className="py-2 px-4">Button to navigate to next slide.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">IndicatorGroup</td>
                                <td className="py-2 px-4">Container for slide indicators.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">Indicator</td>
                                <td className="py-2 px-4">
                                    Individual dot indicator for each slide.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Common Options */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">Common Options</h2>
                <p className="text-sm text-tertiary mb-6">
                    Frequently used Embla Carousel options that you can pass to the{" "}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">opts</code> prop.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                                <th className="py-2 px-4 text-left font-medium">Option</th>
                                <th className="py-2 px-4 text-left font-medium">Type</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">loop</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4">Enable infinite looping.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">align</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;start&quot; | &quot;center&quot; | &quot;end&quot;
                                </td>
                                <td className="py-2 px-4">
                                    Align slides to start, center, or end.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">slidesToScroll</td>
                                <td className="py-2 px-4 font-mono">number</td>
                                <td className="py-2 px-4">Number of slides to scroll at once.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">skipSnaps</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4">Skip snapping to slides.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">dragFree</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4">Enable free-scroll dragging.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Tip:</strong> For a complete list of options, visit the{" "}
                        <a
                            href="https://www.embla-carousel.com/api/options/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-700"
                        >
                            Embla Carousel documentation
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
