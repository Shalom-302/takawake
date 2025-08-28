"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Circle, Clock, FileText, FileSignature, Shield, Archive } from "lucide-react";
import { WorkflowStep } from "@/lib/services/document-service";
import { useDocuments } from "@/lib/contexts/document-context";
import { Progress } from "@/components/ui/progress-indicators/progress";
import { cn } from "@/lib/utils/cn";

interface WorkflowStatusProps {
    documentId: string;
    className?: string;
}

interface WorkflowStatus {
    current_step: WorkflowStep;
    next_step: WorkflowStep | null;
    progress: number;
    pending_actions: string[];
}

export function WorkflowStatus({ documentId, className }: WorkflowStatusProps) {
    const { getWorkflowStatus } = useDocuments();
    const [status, setStatus] = useState<WorkflowStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const data = await getWorkflowStatus(documentId);
                if (data) {
                    setStatus(data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        // Idéalement, nous devrions aussi mettre en place une souscription WebSocket ici
        // pour recevoir les mises à jour du workflow en temps réel
        // Exemple: socket.subscribe(`document:${documentId}:workflow`)

        return () => {
            // Cleanup de la souscription WebSocket
        };
    }, [documentId, getWorkflowStatus]);

    // Configuration des étapes
    const steps = [
        {
            id: WorkflowStep.PREPARATION,
            name: "Préparation",
            description: "Le document est en cours de préparation",
            icon: FileText,
        },
        {
            id: WorkflowStep.SIGNATURE,
            name: "Signature",
            description: "En attente des signatures requises",
            icon: FileSignature,
        },
        {
            id: WorkflowStep.VERIFICATION,
            name: "Vérification",
            description: "Vérification des signatures et du document",
            icon: Shield,
        },
        {
            id: WorkflowStep.ARCHIVING,
            name: "Archivage",
            description: "Le document est archivé et sécurisé",
            icon: Archive,
        },
    ];

    const getStepStatus = (stepId: WorkflowStep) => {
        if (!status) return "pending";

        // Obtenir les indices pour comparer où nous en sommes
        const currentIndex = steps.findIndex(step => step.id === status.current_step);
        const stepIndex = steps.findIndex(step => step.id === stepId);

        if (stepIndex < currentIndex) return "completed";
        if (stepIndex === currentIndex) return "current";
        return "pending";
    };

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-lg font-medium flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Progression du document
            </h3>

            {loading ? (
                <Progress value={20} className="h-2" />
            ) : status ? (
                <>
                    <Progress value={status.progress} className="h-2" />
                    <div className="pt-2">
                        <div className="flex space-x-2 items-center">
                            <div className="flex-1 text-sm font-medium">
                                {status.progress}% complété
                            </div>
                            {status.next_step && (
                                <div className="text-sm text-muted-foreground">
                                    Prochaine étape :{" "}
                                    {steps.find(s => s.id === status.next_step)?.name || ""}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {steps.map((step, index) => {
                            const status = getStepStatus(step.id);
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex items-start p-3 rounded-lg transition-colors",
                                        status === "current" && "bg-primary/10",
                                        status === "completed" && "bg-muted"
                                    )}
                                >
                                    <div className="mr-4">
                                        {status === "completed" ? (
                                            <div className="rounded-full bg-primary text-primary-foreground p-1">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                        ) : status === "current" ? (
                                            <div className="rounded-full bg-primary/20 text-primary p-1">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <div className="rounded-full border border-muted-foreground/20 text-muted-foreground p-1">
                                                <Circle className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4
                                                className={cn(
                                                    "font-medium text-sm",
                                                    status === "pending" && "text-muted-foreground"
                                                )}
                                            >
                                                {step.name}
                                            </h4>

                                            {index < steps.length - 1 && status !== "pending" && (
                                                <div className="text-xs text-muted-foreground">
                                                    {status === "completed"
                                                        ? "Complété"
                                                        : "En cours"}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {status.pending_actions.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg space-y-2">
                            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                Actions en attente
                            </h4>
                            <ul className="text-xs space-y-1 text-amber-700 dark:text-amber-400">
                                {status.pending_actions.map((action, index) => (
                                    <li key={index} className="flex items-center">
                                        <Circle className="h-1.5 w-1.5 mr-2" />
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-sm text-muted-foreground">
                    Impossible de récupérer l'état du workflow
                </div>
            )}
        </div>
    );
}
