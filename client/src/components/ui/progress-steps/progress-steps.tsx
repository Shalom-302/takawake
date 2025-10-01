"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StepBase, type StepBaseType } from "./step-base";
import { type StepIconStatus, type StepIconSize } from "./step-icon";
import type { FC, ReactNode } from "react";

// ============ Types ============

interface StepData {
    id: string;
    title: string;
    description?: string;
    icon?: FC<{ className?: string }> | ReactNode;
}

interface ProgressStepsProps extends React.ComponentProps<"div"> {
    steps: StepData[];
    currentStep: number;
    type: StepBaseType;
    size?: StepIconSize;
    showConnector?: boolean;
    onStepClick?: (stepIndex: number) => void;
}

// ============ Component Principal ============

export function ProgressSteps({
    steps,
    currentStep,
    type,
    size = "sm",
    showConnector = true,
    onStepClick,
    className,
    ...props
}: ProgressStepsProps) {
    const getStepStatus = (index: number): StepIconStatus => {
        if (index < currentStep) return "complete";
        if (index === currentStep) return "current";
        return "incomplete";
    };

    const isLeftLayout = type.includes("-left");
    const isTopLayout = type.includes("-top");

    // Pour les layouts horizontaux, on utilise une grille avec gaps
    const containerClass = isLeftLayout
        ? "flex flex-col"
        : `flex flex-row items-start ${type.includes("-line") ? "gap-4" : ""} `;

    const handleStepClick = (index: number) => {
        if (onStepClick && index <= currentStep) {
            onStepClick(index);
        }
    };

    return (
        <div className={cn("w-full", className)} {...props}>
            <div className={containerClass}>
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isLast = index === steps.length - 1;
                    const showStepConnector = isLeftLayout ? !isLast : false;
                    const isClickable = index <= currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            <StepBase
                                type={type}
                                status={status}
                                size={size}
                                title={step.title}
                                description={step.description}
                                number={index + 1}
                                icon={step.icon}
                                connector={showStepConnector}
                                className={isClickable ? "cursor-pointer" : undefined}
                                onClick={() => handleStepClick(index)}
                            />
                            {isTopLayout && !isLast && showConnector && (
                                <div className="flex flex-1">
                                    <HorizontalConnector status={status} type={type} size={size} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ============ Horizontal Connector Component ============

function HorizontalConnector({
    status,
    type,
    size = "sm",
}: {
    status: StepIconStatus;
    type: StepBaseType;
    size?: StepIconSize;
}) {
    const isComplete = status === "complete";

    if (type === "icon-top" || type === "featured-icon-top") {
        return (
            <div className={cn("w-full", size === "sm" ? "pt-3" : "pt-4")}>
                <div
                    className={cn(
                        "h-0.5 w-[200px] border-t-2  transition-colors",
                        isComplete && type === "featured-icon-top"
                            ? "border-fg-secondary"
                            : "border-secondary",
                        isComplete && type === "icon-top"
                            ? "border-fg-brand-primary"
                            : "border-secondary"
                    )}
                />
            </div>
        );
    }

    return (
        <div className={cn("w-full", size === "sm" ? "pt-3" : "pt-4")}>
            <div className="h-0.5 w-[200px] bg-border-secondary transition-colors" />
        </div>
    );
}

// ============ Exemples d'utilisation ============

/*
import { User, Building, Users, Share } from "@untitled-ui/icons-react";

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
        description: "Share posts to your social accounts",
    },
];

const stepsWithIcons = [
    {
        id: "step-1",
        title: "Your details",
        description: "Please provide your name and email",
        icon: User,
    },
    {
        id: "step-2",
        title: "Company details",
        description: "A few details about your company",
        icon: Building,
    },
    {
        id: "step-3",
        title: "Invite your team",
        description: "Start collaborating with your team",
        icon: Users,
    },
    {
        id: "step-4",
        title: "Add your socials",
        description: "Share posts to your social accounts",
        icon: Share,
    },
];

// ============ Exemples ============

// 1. Icon Left (vertical avec connectors)
<ProgressSteps
    steps={steps}
    currentStep={1}
    type="icon-left"
    size="sm"
/>

// 2. Icon Top (horizontal)
<ProgressSteps
    steps={steps}
    currentStep={2}
    type="icon-top"
    size="md"
/>

// 3. Number Left (vertical avec connectors)
<ProgressSteps
    steps={steps}
    currentStep={0}
    type="number-left"
    size="sm"
/>

// 4. Number Top (horizontal)
<ProgressSteps
    steps={steps}
    currentStep={3}
    type="number-top"
    size="md"
/>

// 5. Featured Icon Left (vertical avec connectors)
<ProgressSteps
    steps={stepsWithIcons}
    currentStep={1}
    type="featured-icon-left"
    size="sm"
/>

// 6. Featured Icon Top (horizontal)
<ProgressSteps
    steps={stepsWithIcons}
    currentStep={2}
    type="featured-icon-top"
    size="md"
/>

// 7. Text Line (horizontal avec bordures)
<ProgressSteps
    steps={steps}
    currentStep={1}
    type="text-line"
    size="sm"
/>

// 8. Avec navigation cliquable
<ProgressSteps
    steps={steps}
    currentStep={2}
    type="icon-left"
    size="md"
    onStepClick={(stepIndex) => {
        console.log("Navigate to step:", stepIndex);
        // Logique de navigation ici
    }}
/>

// 9. Sans connecteurs (horizontal)
<ProgressSteps
    steps={steps}
    currentStep={1}
    type="icon-top"
    size="md"
    showConnector={false}
/>

// 10. Exemple complet avec state
function MyForm() {
    const [currentStep, setCurrentStep] = React.useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="p-8">
            <ProgressSteps
                steps={steps}
                currentStep={currentStep}
                type="icon-left"
                size="sm"
                onStepClick={setCurrentStep}
            />
            
            <div className="mt-8 space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        {steps[currentStep].title}
                    </h2>
                    <p className="text-gray-600">
                        {steps[currentStep].description}
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 bg-brand-solid text-white rounded disabled:opacity-50"
                    >
                        {currentStep === steps.length - 1 ? "Finish" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 10. Layouts côte à côte
<div className="grid grid-cols-2 gap-8 p-8">
    <div>
        <h3 className="text-lg font-semibold mb-4">Icon Left (Vertical)</h3>
        <ProgressSteps
            steps={steps}
            currentStep={1}
            type="icon-left"
            size="sm"
        />
    </div>
    
    <div>
        <h3 className="text-lg font-semibold mb-4">Number Left (Vertical)</h3>
        <ProgressSteps
            steps={steps}
            currentStep={2}
            type="number-left"
            size="sm"
        />
    </div>
</div>

<div className="space-y-8 p-8">
    <div>
        <h3 className="text-lg font-semibold mb-4">Icon Top (Horizontal)</h3>
        <ProgressSteps
            steps={steps}
            currentStep={1}
            type="icon-top"
            size="md"
        />
    </div>
    
    <div>
        <h3 className="text-lg font-semibold mb-4">Text Line (Horizontal)</h3>
        <ProgressSteps
            steps={steps}
            currentStep={2}
            type="text-line"
            size="sm"
        />
    </div>
</div>
*/
