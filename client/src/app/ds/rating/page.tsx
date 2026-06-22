import { CodeBlock } from "@/components/ui/code-block";
import { RatingBadge, RatingStars } from "@/components/ui/rating";
import { ArrowLeft } from "@untitled-ui/icons-react";
import Link from "next/link";

export default function RatingPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-primary">Rating Badge and Stars</h1>
                <p className="text-tertiary mt-2">
                    Components for displaying user ratings and reviews, available in star-based or
                    badge formats.
                </p>
            </div>

            {/* RatingStars Example */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">1. Rating Stars</h2>
                <p className="text-sm text-tertiary mb-6">
                    Displays a numeric rating using five stars, including partial filling for
                    decimal values.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 flex justify-center">
                    <RatingStars rating={3.5} />
                </div>

                <CodeBlock
                    code={`import { RatingStars } from "@/components/ui/rating";

<RatingStars rating={3.5} />
`}
                />
            </div>

            {/* RatingBadge Example */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">2. Rating Badge</h2>
                <p className="text-sm text-tertiary mb-6">
                    Displays a rating in a compact badge format, with a title and subtitle to
                    provide context (e.g., number of reviews).
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 flex justify-center">
                    <RatingBadge rating={4.7} title="Best Design Tool" subtitle="2,000+ reviews" />
                </div>

                <CodeBlock
                    code={`import { RatingBadge } from "@/components/ui/rating";

<RatingBadge 
  rating={4.7} 
  title="Best Design Tool" 
  subtitle="2,000+ reviews" 
/>`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">API Reference</h2>
                <div className="overflow-x-auto">
                    <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">
                        RatingStars Props
                    </h3>
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
                                <td className="py-2 px-4 font-mono">rating</td>
                                <td className="py-2 px-4 font-mono">number</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    The current rating value, usually between 0 and 5. Supports
                                    decimals.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">maxStars?</td>
                                <td className="py-2 px-4 font-mono">number</td>
                                <td className="py-2 px-4 font-mono">5</td>
                                <td className="py-2 px-4">
                                    The maximum number of stars to display.
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">
                        RatingBadge Props
                    </h3>
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
                                <td className="py-2 px-4 font-mono">rating</td>
                                <td className="py-2 px-4 font-mono">number</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    The rating value, typically formatted with one decimal.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">title</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    The main title of the badge (e.g., &quot;Best Tool&quot;).
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">subtitle</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    The subtitle providing context (e.g., &quot;2,000+
                                    reviews&quot;).
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
