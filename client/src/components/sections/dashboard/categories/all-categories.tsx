"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";
import veilleService from "@/lib/api/veille.service";

const formSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit faire au moins 2 caractères." }),
});

export default function AllCategories() {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { categories, error, isLoading, refreshCategories } = veilleService.useCategories({
        limit: 200,
    });
    const list = categories ?? [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setSubmitting(true);
        setServerError(null);
        try {
            await veilleService.createCategory({ name: data.name });
            await refreshCategories();
            form.reset();
            setOpen(false);
        } catch (e) {
            setServerError(
                e instanceof Error ? e.message : "Impossible de créer la catégorie.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: number, name: string) {
        if (!window.confirm(`Supprimer la catégorie "${name}" ?`)) return;
        try {
            await veilleService.deleteCategory(id);
            await refreshCategories();
        } catch (e) {
            window.alert(
                e instanceof Error ? e.message : "Impossible de supprimer la catégorie.",
            );
        }
    }

    return (
        <section className="main-container pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-lg font-semibold">{"Catégories"}</h1>
                    <p className="text-sm mt-1">
                        {"Liste de toutes les catégories de la plateforme."}
                    </p>
                </div>
                <Dialog
                    open={open}
                    onOpenChange={setOpen}
                    trigger={
                        <Button size={"md"} variant="primary">
                            {"Nouvelle catégorie"}
                        </Button>
                    }
                    title="Nouvelle catégorie"
                    description="Renseignez le nom de la catégorie."
                    content={
                        <div className="py-4">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <InputForm
                                        control={form.control}
                                        name="name"
                                        label="Nom"
                                        placeholder="Ex: Fintech"
                                        isRequired
                                        size={"md"}
                                    />
                                    {serverError && (
                                        <p className="text-sm text-red-600">{serverError}</p>
                                    )}
                                    <Button size={"lg"} className="w-full" disabled={submitting}>
                                        {submitting ? "Enregistrement..." : "Enregistrer"}
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
                        {"Chargement des catégories..."}
                    </div>
                )}
                {error && (
                    <div className="py-6 px-4 text-sm text-red-600">
                        {"Impossible de charger les catégories."}
                    </div>
                )}
                {!isLoading && !error && list.length === 0 && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Aucune catégorie pour le moment."}
                    </div>
                )}
                {list.map(category => (
                    <div key={category.id} className="border-black/10 border-b py-4 px-4">
                        <div className="flex items-center justify-between gap-10">
                            <div className="w-full">
                                <span className="font-semibold block text-sm">
                                    {category.name}
                                </span>
                            </div>
                            <div className="shrink-0 flex items-center gap-6">
                                <DropdownMenu
                                    trigger={<DropdownDotsButton />}
                                    align="end"
                                    contentClassName="min-w-[140px]"
                                    items={[
                                        {
                                            id: "delete",
                                            label: "Supprimer",
                                            onClick: () => handleDelete(category.id, category.name),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
