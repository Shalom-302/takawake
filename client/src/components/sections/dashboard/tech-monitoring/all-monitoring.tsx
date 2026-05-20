"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { InputForm } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import veilleService, { VeilleStatus } from "@/lib/api/veille.service";

const formSchema = z.object({
    subject: z
        .string()
        .min(3, { message: "Le sujet doit faire au moins 3 caractères." }),
});

const STATUS_BADGE: Record<VeilleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    SUCCESS: { label: "Effectué", color: "success" },
    PENDING: { label: "En cours", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

export default function AllMonitoring() {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { veilles, error, isLoading, refreshVeilles } = veilleService.useVeilles({ limit: 100 });
    const list = veilles ?? [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { subject: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setSubmitting(true);
        setServerError(null);
        try {
            await veilleService.runVeille(data.subject);
            await refreshVeilles();
            form.reset();
            setOpen(false);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : "Impossible de lancer la veille.";
            setServerError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="main-container pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-lg font-semibold">{"Veilles"}</h1>
                    <p className="text-sm mt-1">
                        {"Sessions de veille lancées sur l'écosystème tech."}
                    </p>
                </div>
                <Dialog
                    open={open}
                    onOpenChange={setOpen}
                    trigger={
                        <Button size={"md"} variant="primary">
                            {"Nouvelle veille"}
                        </Button>
                    }
                    title="Nouvelle veille"
                    description="Lancer une veille sur un sujet en rapport avec la tech."
                    content={
                        <div className="py-4">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <InputForm
                                        control={form.control}
                                        name="subject"
                                        label="Sujet"
                                        placeholder="Ex: Tendances Fintech au Nigeria"
                                        isRequired
                                        size={"md"}
                                    />
                                    {serverError && (
                                        <p className="text-sm text-red-600">{serverError}</p>
                                    )}
                                    <Button size={"lg"} className="w-full" disabled={submitting}>
                                        {submitting ? "Lancement..." : "Démarrer la veille"}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    }
                />
            </div>

            <div className="mt-12 border-t border-black/10">
                {isLoading && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Chargement des veilles..."}
                    </div>
                )}
                {error && (
                    <div className="py-6 px-4 text-sm text-red-600">
                        {"Impossible de charger les veilles."}
                    </div>
                )}
                {!isLoading && !error && list.length === 0 && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Aucune veille lancée pour le moment."}
                    </div>
                )}
                {list.map(veille => {
                    const statusInfo = STATUS_BADGE[veille.status];
                    return (
                        <div key={veille.id} className="border-black/10 border-b py-4 px-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="w-full">
                                    <span className="font-base block text-sm">
                                        {veille.prompt}
                                    </span>
                                    <div className="flex items-end gap-1.5 mt-1">
                                        <span className="text-sm opacity-60">
                                            {new Date(veille.created_at).toLocaleString("fr-FR")}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                                    <Link
                                        href={`/dashboard/tech-monitoring/one/${veille.id}`}
                                        className="h-6 w-6 shrink-0 flex items-center justify-center"
                                    >
                                        <ChevronRightIcon size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
