"use client";

import { Badge, BadgeGroup } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";


export default function OneMonitoring() {
    const router = useRouter();

    return (
        <>
            <section className="main-container pt-10 pb-16">
                <Breadcrumb
                    items={[
                        { href: "/dashboard/tech-monitoring", label: "Veilles" },
                        { label: "Détails d'une veille" },
                    ]}
                    variant="text"
                    separator="icon"
                    showHomeIcon={false}
                />
                <div className="flex items-end justify-between gap-4 mb-4 mt-10">
                    <div className="w-full max-w-[450px] ">
                        <h1 className="text-lg font-semibold">
                            {
                                "Proin ultricies faucibus ante nec interdum, posuere ante nec, venenatis massa."
                            }
                        </h1>
                        <p className="text-sm mt-1 opacity-60">{"lancée le 23 déc. 2025"}</p>
                        <div className="flex items-center gap-2 mt-4">
                            <Badge color="success" size="md">
                                Effectué
                            </Badge>
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
                    </div>
                    {/* <div className="w-auto shrink-0 ">
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
                    </div> */}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-10">
                    <Card
                        className="w-full"
                        content={
                            <>
                                <h1 className="font-bold text-xl">{"349876"}</h1>
                                <p className="text-sm">Nombre d'articles récupérés</p>
                            </>
                        }
                    />
                    <Card
                        className="w-full"
                        content={
                            <>
                                <h1 className="font-bold text-xl">{"249000"}</h1>
                                <p className="text-sm">Nombre d'articles incomplets</p>
                            </>
                        }
                    />
                    <Card
                        className="w-full"
                        content={
                            <>
                                <h1 className="font-bold text-xl">{"249000"}</h1>
                                <p className="text-sm">Nombre d'articles complets</p>
                            </>
                        }
                    />
                </div>
                <div className="mt-12 border-t border-black/10">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className=" border-black/10 border-b py-4 px-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="w-full flex items-center gap-4">
                                    <div className="w-[100px] h-[72px] bg-black/10 rounded-lg shrink-0  "></div>
                                    <div className=" space-y-0.5">
                                        <span className="font-semibold block text-sm">
                                            {
                                                "In eget enim non nisl hendrerit ornare. Suspendisse turpis turpis, fringilla ut dolor non, accumsan rutrum neque. Sed ultrices, sapien vel tempus gravida, risus turpis sodales ex, ac sollicitudin ante erat id urna"
                                            }
                                        </span>
                                        <span className="font-base block text-sm opacity-60">
                                            {"Source de l'article ici"}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    <div className="">
                                        <Badge color="success">Complet</Badge>
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
                                                    id: "view",
                                                    label: "Informations de l'article",
                                                    onClick: () => {
                                                        router.push(
                                                            `/dashboard/scraping-articles/one/id-here`
                                                        );
                                                    },
                                                },
                                                {
                                                    id: "archive",
                                                    label: "Lire l'article source",
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
