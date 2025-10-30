import { CodeBlock } from "@/components/ui/code-block";
import { CreditCard } from "@/components/ui/credit-card";
import Link from "next/link";

export default function CreditCardDocsPage() {
    return (
        <main className="min-h-screen ">
            <div className="max-w-6xl mx-auto py-16 px-4 space-y-20">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                        ← Back to Design System
                    </Link>
                    <p className="text-tertiary text-lg max-w-2xl">
                        A responsive and stylized credit card component with support for multiple
                        variants, sizes, and brand themes.
                    </p>
                </div>

                {/* Basic Usage */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">Basic Usage</h2>
                        <p className="text-tertiary">
                            Display customizable cards with details such as company name,
                            cardholder, and expiration date.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-8 items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
                            <CreditCard
                                type="brand-dark"
                                company="BREX"
                                cardNumber="5678 9012 3456 7890"
                                cardHolder="PEDRO FRANCESCHI"
                                cardExpiration="12/28"
                                width={300}
                            />
                            <CreditCard
                                type="gradient-strip"
                                company="Apple Inc."
                                cardNumber="0987 6543 2109 8765"
                                cardHolder="TIM COOK"
                                cardExpiration="03/29"
                                width={300}
                            />
                        </div>

                        <CodeBlock
                            code={`<CreditCard
  type="brand-dark"
  company="BREX"
  cardNumber="5678 9012 3456 7890"
  cardHolder="PEDRO FRANCESCHI"
  cardExpiration="12/28"
/>

<CreditCard
  type="gradient-strip"
  company="Apple Inc."
  cardNumber="0987 6543 2109 8765"
  cardHolder="TIM COOK"
  cardExpiration="03/29"
/>`}
                        />
                    </div>
                </section>

                {/* Width Scaling */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">Width Scaling</h2>
                        <p className="text-tertiary">
                            Adjust the{" "}
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-purple-600">
                                width
                            </code>{" "}
                            prop to resize the card proportionally while maintaining its aspect
                            ratio.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="flex flex-wrap gap-6 justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100">
                            <CreditCard type="brand-dark" width={220} />
                            <CreditCard type="brand-dark" width={280} />
                            <CreditCard type="brand-dark" width={340} />
                        </div>

                        <CodeBlock
                            code={`<CreditCard type="brand-dark" width={220} />
<CreditCard type="brand-dark" width={280} />
<CreditCard type="brand-dark" width={340} />`}
                        />
                    </div>
                </section>

                {/* Visual Variants */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">Visual Variants</h2>
                        <p className="text-tertiary">
                            Several predefined designs are available, including light, dark, and
                            gradient styles.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="grid grid-cols-2 gap-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700">
                            <CreditCard type="transparent" width={200} />
                            <CreditCard type="transparent-gradient" width={200} />
                            <CreditCard type="brand-dark" width={200} />
                            <CreditCard type="brand-light" width={200} />
                            <CreditCard type="gray-dark" width={200} />
                            <CreditCard type="gray-light" width={200} />
                            <CreditCard type="transparent-strip" width={200} />
                            <CreditCard type="gray-strip" width={200} />
                            <CreditCard type="gradient-strip" width={200} />
                            <CreditCard type="salmon-strip" width={200} />
                            <CreditCard type="gray-strip-vertical" width={200} />
                            <CreditCard type="salmon-strip-vertical" width={200} />
                        </div>

                        <CodeBlock
                            code={`<CreditCard type="transparent" />
<CreditCard type="transparent-gradient" />
<CreditCard type="brand-dark" />
<CreditCard type="brand-light" />
<CreditCard type="gray-dark" />
<CreditCard type="gray-light" />
<CreditCard type="transparent-strip" />
<CreditCard type="gray-strip" />
<CreditCard type="gradient-strip" />
<CreditCard type="salmon-strip" />
<CreditCard type="gray-strip-vertical" />
<CreditCard type="salmon-strip-vertical" />`}
                        />
                    </div>
                </section>

                {/* API Reference */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">API Reference</h2>
                        <p className="text-tertiary mb-6">
                            Available props for the <code>CreditCard</code> component.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Property
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Default
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">type</code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">string</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Visual variant of the card.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">{`"brand-dark"`}</code>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            width
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">number</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        The card width (height adjusts automatically).
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">316</code>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            company
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">string</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        The displayed company name.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">{`"Untitled."`}</code>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            cardNumber
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">string</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        The visible number on the card.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">{`"1234 1234..."`}</code>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            cardHolder
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">string</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        The cardholder’s name.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">{`"OLIVIA RHYE"`}</code>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            cardExpiration
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">string</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Expiration date.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">{`"06/28"`}</code>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
