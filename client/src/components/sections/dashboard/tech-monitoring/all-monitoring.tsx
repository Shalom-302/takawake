"use client";

import { Button } from "@/components/ui/button/button";
import { Badge, BadgeGroup, BadgeWithDot } from "@/components/ui/badge";
import { ChevronRightIcon, MessageCircleTwoIcon } from "@/components/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { InputForm } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import Link from "next/link";

const formSchema = z.object({
    subject: z.string().min(2, {
        message: "Veuillez renseigner un sujet pour lancer la veille.",
    }),
});

export default function AllMonitoring() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
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
                        <h1 className="text-lg font-semibold">{"Veilles"}</h1>
                        <p className="text-sm mt-1">
                            {
                                "Proin ultricies faucibus ante nec interdum, posuere ante nec, venenatis massa."
                            }
                        </p>
                    </div>
                    <div>
                        <Dialog
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
                                                placeholder="..."
                                                isRequired
                                                size={"md"}
                                            />

                                            <Button size={"lg"} className="w-full">
                                                {"Démarrer la veille"}
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
                                <div className="w-full flex items-center gap-6">
                                    <div className=" space-y-0.5">
                                        <span className="font-base block text-sm">
                                            {
                                                "In eget enim non nisl hendrerit ornare. Suspendisse turpis turpis, fringilla ut dolor non, accumsan rutrum neque. Sed ultrices, sapien vel tempus gravida, risus turpis sodales ex, ac sollicitudin ante erat id urna"
                                            }
                                        </span>
                                        <div className="flex items-end gap-1.5">
                                            <span className="font-base block text-sm opacity-60">
                                                {"3984 articles"}
                                            </span>
                                            <span className="font-base block text-xs opacity-60">
                                                -
                                            </span>
                                            <span className="font-base block text-sm opacity-60">
                                                {"23 déc 2025"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    {/* <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 flex items-center justify-center">
                                            <MessageCircleTwoIcon size={20} />
                                        </div>
                                        <span className="block text-sm">{"il y a 10 jours"}</span>
                                    </div> */}
                                    <div>
                                        {/* <BadgeGroup
                                            addonText="4 sur 20"
                                            color="error"
                                            theme="modern"
                                            align="right"
                                            size="md"
                                            rightIcon={<></>}
                                        >
                                            {"Score insuffisant"}
                                        </BadgeGroup>
                                        <BadgeGroup
                                            addonText="15 sur 20"
                                            color="success"
                                            theme="modern"
                                            align="right"
                                            size="md"
                                            rightIcon={<></>}
                                        >
                                            {"Score satisfaisant"}
                                        </BadgeGroup> */}
                                        <BadgeGroup
                                            addonText="11 sur 20"
                                            color="brand"
                                            theme="modern"
                                            align="right"
                                            size="md"
                                            rightIcon={<></>}
                                        >
                                            {"Score moyen"}
                                        </BadgeGroup>
                                    </div>
                                    <div>
                                        <Badge color="success">Effectué</Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/dashboard/tech-monitoring/one/id-here`}>
                                            <div className="h-6 w-6 shrink-0 flex cursor-pointer items-center justify-center">
                                                <ChevronRightIcon size={20} />
                                            </div>
                                        </Link>
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
