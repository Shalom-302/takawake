"use client";
import * as React from "react";
import Link from "next/link";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { User01, Building01, Share01, Users01 } from "@untitled-ui/icons-react";
import { CodeBlock } from "@/components/ui/code-block";

const steps = [
    {
        id: "step-1",
        title: "Your details",
        description: "Please provide your name and email",
    },
    {
        id: "step-2",
        title: "Company details",
        description: "A few details about your company",
    },
    {
        id: "step-3",
        title: "Invite your team",
        description: "Start collaborating with your team",
    },
    {
        id: "step-4",
        title: "Add your socials",
        description: "Share01 posts to your social accounts",
    },
];

const stepsWithIcons = [
    {
        id: "step-1",
        title: "Your details",
        description: "Please provide your name and email",
        icon: User01,
    },
    {
        id: "step-2",
        title: "Company details",
        description: "A few details about your company",
        icon: Building01,
    },
    {
        id: "step-3",
        title: "Invite your team",
        description: "Start collaborating with your team",
        icon: Users01,
    },
    {
        id: "step-4",
        title: "Add your socials",
        description: "Share01 posts to your social accounts",
        icon: Share01,
    },
];

export default function ProgressStepsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-12">
                <Link href="/ds" className="text-brand-600 hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-4xl font-bold mt-4">Progress Steps</h1>
                <p className="text-text-tertiary text-lg mt-3">
                    Powerful and customizable progress step components for multi-step forms,
                    onboarding flows, and process visualization.
                </p>
            </div>

            {/* Installation */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-4">Installation</h2>
                <CodeBlock
                    code={`import { ProgressSteps } from "@/components/ui/progress-steps";`}
                />
            </section>

            {/* Examples Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6">Examples</h2>
                <p className="text-text-tertiary mb-8">
                    Below are examples and variations of the progress steps component:
                </p>

                {/* Icon Left (Vertical) */}
                <ExampleCard
                    title="Icon Left - Vertical Layout"
                    description="Vertical progress steps with radio icons and connectors, ideal for sidebar navigation."
                >
                    <div className="max-w-sm">
                        <ProgressSteps steps={steps} currentStep={1} type="icon-left" size="sm" />
                    </div>
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={1}
    type="icon-left"
    size="sm"
/>`}
                    />
                </ExampleCard>

                {/* Icon Top (Horizontal) */}
                <ExampleCard
                    title="Icon Top - Horizontal Layout"
                    description="Horizontal progress steps with icons on top, perfect for multi-step forms."
                >
                    <ProgressSteps
                        showHorizontalConnector
                        steps={steps}
                        currentStep={1}
                        type="icon-top"
                        size="md"
                    />
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={1}
    type="icon-top"
    size="md"
/>`}
                    />
                </ExampleCard>

                {/* Number Left */}
                <ExampleCard
                    title="Number Left - Vertical with Numbers"
                    description="Numbered steps in vertical layout with dotted connectors."
                >
                    <div className="max-w-sm">
                        <ProgressSteps steps={steps} currentStep={2} type="number-left" size="sm" />
                    </div>
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={2}
    type="number-left"
    size="sm"
/>`}
                    />
                </ExampleCard>

                {/* Number Top */}
                <ExampleCard
                    title="Number Top - Horizontal with Numbers"
                    description="Numbered steps in horizontal layout."
                >
                    <ProgressSteps steps={steps} currentStep={0} type="number-top" size="md" />
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={0}
    type="number-top"
    size="md"
/>`}
                    />
                </ExampleCard>

                {/* Featured Icon Left */}
                <ExampleCard
                    title="Featured Icon Left - With Custom Icons"
                    description="Vertical layout with featured icons and connectors."
                >
                    <div className="max-w-sm">
                        <ProgressSteps
                            steps={stepsWithIcons}
                            currentStep={1}
                            type="featured-icon-left"
                            size="sm"
                        />
                    </div>
                    <CodeBlock
                        className="mt-6"
                        code={`import { User01, Building01, Users, Share01 } from "@untitled-ui/icons-react";

const stepsWithIcons = [
    { id: "1", title: "Your details", description: "...", icon: User01 },
    { id: "2", title: "Company details", description: "...", icon: Building01 },
    // ...
];

<ProgressSteps
    steps={stepsWithIcons}
    currentStep={1}
    type="featured-icon-left"
    size="sm"
/>`}
                    />
                </ExampleCard>

                {/* Featured Icon Top */}
                <ExampleCard
                    title="Featured Icon Top - Horizontal with Icons"
                    description="Horizontal layout with large featured icons."
                >
                    <ProgressSteps
                        steps={stepsWithIcons}
                        currentStep={2}
                        type="featured-icon-top"
                        size="md"
                    />
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={stepsWithIcons}
    currentStep={2}
    type="featured-icon-top"
    size="md"
/>`}
                    />
                </ExampleCard>

                {/* Text Line */}
                <ExampleCard
                    title="Text Line - Minimal Layout"
                    description="Simple horizontal layout with colored top borders indicating progress."
                >
                    <ProgressSteps steps={steps} currentStep={1} type="text-line" size="sm" />
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={1}
    type="text-line"
    size="sm"
/>`}
                    />
                </ExampleCard>

                {/* Without Connectors */}
                <ExampleCard
                    title="Without Connectors"
                    description="Horizontal layouts can hide connectors for a cleaner look."
                >
                    <ProgressSteps
                        steps={steps}
                        currentStep={1}
                        type="icon-top"
                        size="md"
                        showHorizontalConnector={false}
                    />
                    <CodeBlock
                        className="mt-6"
                        code={`<ProgressSteps
    steps={steps}
    currentStep={1}
    type="icon-top"
    size="md"
    showHorizontalConnector={false}
/>`}
                    />
                </ExampleCard>

                {/* Interactive / Clickable */}
                <ExampleCard
                    title="Interactive Steps"
                    description="Clickable steps that allow navigation through the process."
                >
                    <InteractiveDemo />
                    <CodeBlock
                        className="mt-6"
                        code={`function MyForm() {
    const [currentStep, setCurrentStep] = React.useState(0);

    return (
        <div>
            <ProgressSteps
                steps={steps}
                currentStep={currentStep}
                type="icon-left"
                onStepClick={(index) => setCurrentStep(index)}
            />
            
            {/* Your step content */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3>{steps[currentStep].title}</h3>
                <p>{steps[currentStep].description}</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
                <button 
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                >
                    Previous
                </button>
                <button 
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    disabled={currentStep === steps.length - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
}`}
                    />
                </ExampleCard>

                {/* Sizes Comparison */}
                <ExampleCard
                    title="Size Variants"
                    description="Progress steps come in two sizes: sm and md."
                >
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-4">Size: sm</p>
                            <div className="max-w-sm">
                                <ProgressSteps
                                    steps={steps.slice(0, 3)}
                                    currentStep={1}
                                    type="icon-left"
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-4">Size: md</p>
                            <div className="max-w-sm">
                                <ProgressSteps
                                    steps={steps.slice(0, 3)}
                                    currentStep={1}
                                    type="icon-left"
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>
                    <CodeBlock
                        className="mt-6"
                        code={`// Small
<ProgressSteps size="sm" {...props} />

// Medium
<ProgressSteps size="md" {...props} />`}
                    />
                </ExampleCard>
            </section>

            {/* API Reference */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6">API Reference</h2>

                {/* ProgressSteps Props */}
                <div className="mb-12">
                    <h3 className="text-xl font-semibold mb-4">ProgressSteps</h3>
                    <div className="border border-secondary rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-tertiary">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Prop
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Type
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Default
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">steps</td>
                                    <td className="py-3 px-4 text-sm">StepData[]</td>
                                    <td className="py-3 px-4 text-sm">-</td>
                                    <td className="py-3 px-4 text-sm">
                                        Array of step data objects
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">currentStep</td>
                                    <td className="py-3 px-4 text-sm">number</td>
                                    <td className="py-3 px-4 text-sm">-</td>
                                    <td className="py-3 px-4 text-sm">
                                        Current active step index (0-based)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">type</td>
                                    <td className="py-3 px-4 text-sm font-mono">
                                        {`"icon-left" | "icon-top" | "number-left" | "number-top" | "featured-icon-left" | "featured-icon-top" | "text-line"`}
                                    </td>
                                    <td className="py-3 px-4 text-sm">-</td>
                                    <td className="py-3 px-4 text-sm">Layout and style variant</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">size</td>
                                    <td className="py-3 px-4 text-sm">{`"sm" | "md"`}</td>
                                    <td className="py-3 px-4 text-sm">{`"sm"`}</td>
                                    <td className="py-3 px-4 text-sm">
                                        Size of indicators and text
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">
                                        showHorizontalConnector
                                    </td>
                                    <td className="py-3 px-4 text-sm">boolean</td>
                                    <td className="py-3 px-4 text-sm">true</td>
                                    <td className="py-3 px-4 text-sm">
                                        Show/hide connector lines between steps (applies to
                                        horizontal layouts)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">onStepClick</td>
                                    <td className="py-3 px-4 text-sm">
                                        (index: number) =&gt; void
                                    </td>
                                    <td className="py-3 px-4 text-sm">-</td>
                                    <td className="py-3 px-4 text-sm">
                                        Callback when a step is clicked
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* StepData Type */}
                <div className="mb-12">
                    <h3 className="text-xl font-semibold mb-4">StepData</h3>
                    <div className="border border-secondary rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-tertiary">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Property
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Type
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">id</td>
                                    <td className="py-3 px-4 text-sm">string</td>
                                    <td className="py-3 px-4 text-sm">
                                        Unique identifier for the step
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">title</td>
                                    <td className="py-3 px-4 text-sm">string</td>
                                    <td className="py-3 px-4 text-sm">Step title</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">description</td>
                                    <td className="py-3 px-4 text-sm">string</td>
                                    <td className="py-3 px-4 text-sm">Optional step description</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-mono text-sm">icon</td>
                                    <td className="py-3 px-4 text-sm">FC | ReactNode</td>
                                    <td className="py-3 px-4 text-sm">
                                        Icon component (for featured-icon variants)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Helper Components
function ExampleCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-12 p-8 border border-secondary rounded-xl bg-primary">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-text-tertiary">{description}</p>
            </div>
            {children}
        </div>
    );
}

function InteractiveDemo() {
    const [currentStep, setCurrentStep] = React.useState(0);

    return (
        <div className="space-y-6">
            <div className="max-w-sm">
                <ProgressSteps
                    steps={steps}
                    currentStep={currentStep}
                    type="icon-left"
                    size="sm"
                    onStepClick={index => setCurrentStep(index)}
                />
            </div>

            <div className="p-6 bg-tertiary rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
                <p className="text-sm text-text-tertiary mb-4">{steps[currentStep].description}</p>

                <div className="flex gap-3">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 bg-primary border border-secondary rounded-md text-sm font-medium hover:bg-primary_hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 bg-brand-solid text-white rounded-md text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {currentStep === steps.length - 1 ? "Finish" : "Next"}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <span>
                    Step {currentStep + 1} of {steps.length}
                </span>
            </div>
        </div>
    );
}
