"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputForm } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Veuillez renseigner un sujet pour lancer la veille.",
    }),
});

export default function AllCategories() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    });

    // Fonction de soumission de formulaire
    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log("data", data);
    }
    return (
        <>
            <section className="main-container pt-10 pb-16">
                <div className="flex items-end justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-lg font-semibold">{"Catégories"}</h1>
                        <p className="text-sm mt-1">
                            {"Liste de toutes les catégories de la plateforme"}
                        </p>
                    </div>
                    <div>
                        <Dialog
                            trigger={
                                <Button size={"md"} variant="primary">
                                    {"Nouvelle catégorie"}
                                </Button>
                            }
                            title="Nouvelle catégorie"
                            description="Renseignez correctement le champs ci-dessous"
                            content={
                                <div className="py-4">
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(onSubmit)}
                                            className="space-y-6"
                                        >
                                            <InputForm
                                                control={form.control}
                                                name="title"
                                                label="Titre"
                                                placeholder="..."
                                                isRequired
                                                size={"md"}
                                            />

                                            <Button size={"lg"} className="w-full">
                                                {"Enregistrer"}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            }
                        />
                    </div>
                </div>

                <div className="mt-12 border-t border-black/10">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className=" border-black/10 border-b py-4 px-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="w-full flex items-center gap-4">
                                    <div className=" space-y-0.5">
                                        <span className="font-semibold block text-sm">
                                            {
                                                "In eget enim non nisl hendrerit ornspendisse turpis turpis"
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    <div>
                                        <Badge color="success">En ligne</Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* <div className="h-6 w-6 shrink-0 flex cursor-pointer items-center justify-center">
                                            <ChevronRightIcon size={20} />
                                        </div> */}
                                        <DropdownMenu
                                            trigger={<DropdownDotsButton />}
                                            align="end"
                                            contentClassName="min-w-[100px]"
                                            items={[
                                                {
                                                    id: "edit",
                                                    label: "Modifier",
                                                    onClick: () => {},
                                                },
                                                {
                                                    id: "publish",
                                                    label: "Publier",
                                                    onClick: () => {},
                                                },
                                                {
                                                    id: "archive",
                                                    label: "archiver",
                                                    onClick: () => {},
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
