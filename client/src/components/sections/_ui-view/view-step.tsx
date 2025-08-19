"use client";

import Button from "@/components/starter_ui/button";
import { Step } from "@/components/starter_ui/step";
import { StepLabel } from "@/components/starter_ui/step-label";
import { useState } from "react";

export default function ViewStep() {
    const [currentStep, setCurrentStep] = useState(2);
    const NUMBER_OF_STEP = 4;

    const allSteps = [
        { id: 1, label: "" },
        { id: 2, label: "" },
        { id: 3, label: "" },
        { id: 4, label: "" },
    ];

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Step"}</span>
                </div>
                <div className="px-4 py-6 space-y-5 mb-5">
                    <Step activeStep={currentStep} NumberOfStep={NUMBER_OF_STEP} />

                    <Step
                        activeStep={currentStep}
                        NumberOfStep={NUMBER_OF_STEP}
                        direction="vertical"
                        className="min-h-[200px]"
                    />
                </div>

                <div className="px-4 py-6 space-y-5 mb-5">
                    <StepLabel
                        activeStep={currentStep}
                        direction="vertical"
                        className="min-h-[200px]"
                        steps={allSteps}
                    />
                </div>

                <div className="px-4 py-6 space-y-5 mb-5">
                    <StepLabel
                        activeStep={currentStep}
                        direction="horizontal"
                        className=""
                        steps={allSteps}
                    />
                </div>

                <div className="px-4 py-6 space-y-5">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={currentStep === 1}
                        >
                            {"Prev"}
                        </Button>
                        <Button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={currentStep > NUMBER_OF_STEP}
                        >
                            {"Next"}
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
