"use client";

import { Card } from "@/components/starter_ui/card";
import { CardArticle } from "@/components/starter_ui/card-article";
import { CardTontine } from "@/components/starter_ui/card-tontine";
import SliderCard from "@/components/starter_ui/slider-card";
import { OneCardType } from "@/lib/types/definitions";

export default function ViewCard() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Card"}</span>
                </div>
                <div className="px-4 py-6">
                    <Card>content here</Card>
                </div>
                <div className="px-4 py-6 grid grid-cols-2 gap-4">
                    {[
                        {
                            id: 1,
                            title: "C’est quoi un Fonds d’Investissement et comment ça marche ?",
                            label: "5 min de lecture",
                            illustration:
                                "https://images.unsplash.com/photo-1583502070955-f195c352ff30",
                            redirection: "/",
                        },
                        {
                            id: 2,
                            title: "5 erreurs à éviter quand tu gères ton argent chaque mois",
                            label: "5 min de lecture",
                            illustration:
                                "https://images.unsplash.com/photo-1578762915100-7a2d602a09bc",
                            redirection: "/",
                        },
                        {
                            id: 3,
                            title: "Épargne, cotisation, investissement : quelle différence ?",
                            label: "5 min de lecture",
                            illustration:
                                "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
                            redirection: "/",
                        },
                        {
                            id: 4,
                            title: "Pourquoi le KYC est important pour protéger ton argent",
                            label: "5 min de lecture",
                            illustration:
                                "https://images.unsplash.com/photo-1580196969807-cc6de06c05be",
                            redirection: "/",
                        },
                    ]?.map((item: OneCardType) => (
                        <div key={item?.id} className="min-w-[280px] lg:min-w-0 flex-shrink-0">
                            <CardArticle
                                title={item?.title}
                                label={item?.label}
                                illustration={item?.illustration}
                                redirection={item?.redirection}
                            />
                        </div>
                    ))}
                </div>
                <div className="px-4 py-6">
                    <SliderCard
                        title={"Card slider"}
                        datas={[
                            {
                                id: 1,
                                title: "C’est quoi un Fonds d’Investissement et comment ça marche ?",
                                label: "5 min de lecture",
                                illustration:
                                    "https://images.unsplash.com/photo-1583502070955-f195c352ff30",
                                redirection: "/",
                            },
                            {
                                id: 2,
                                title: "5 erreurs à éviter quand tu gères ton argent chaque mois",
                                label: "5 min de lecture",
                                illustration:
                                    "https://images.unsplash.com/photo-1578762915100-7a2d602a09bc",
                                redirection: "/",
                            },
                            {
                                id: 3,
                                title: "Épargne, cotisation, investissement : quelle différence ?",
                                label: "5 min de lecture",
                                illustration:
                                    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
                                redirection: "/",
                            },
                            {
                                id: 4,
                                title: "Pourquoi le KYC est important pour protéger ton argent",
                                label: "5 min de lecture",
                                illustration:
                                    "https://images.unsplash.com/photo-1580196969807-cc6de06c05be",
                                redirection: "/",
                            },
                        ]}
                    />
                </div>
                <div className="px-4 py-6 grid grid-cols-2 gap-5 w-full">
                    {[
                        {
                            id: "1",
                            tontine_name: "Tontine Familiale",
                            tontine_illustration:
                                "https://images.unsplash.com/photo-1617791160588-241658c0f566",
                            progression: 0,
                            manager: {
                                fullname: "Emmanuel Rhye",
                                photo: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                id: "aofga",
                            },
                            members: [
                                {
                                    id: "u1",
                                    photo: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u2",
                                    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u3",
                                    photo: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u4",
                                    photo: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u5",
                                    photo: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u6",
                                    photo: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                            ],
                            areAllMembersIdentified: false,
                            actionForDetails: () => {},
                            actionToContribute: () => {},
                            date: "28/10/2025",
                            metric: null,
                        },
                        {
                            id: "2",
                            tontine_name: "Tontine Voyage",
                            tontine_illustration:
                                "https://images.unsplash.com/photo-1721013244188-5c4f4593ee72?w=500",
                            progression: 20,
                            manager: {
                                fullname: "Jordan Alto",
                                photo: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                id: "df",
                            },
                            members: [
                                {
                                    id: "u1",
                                    photo: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u2",
                                    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u3",
                                    photo: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u4",
                                    photo: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u5",
                                    photo: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u6",
                                    photo: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                            ],
                            areAllMembersIdentified: true,
                            actionForDetails: () => {},
                            actionToContribute: () => {},
                            date: "15/11/2025",
                            metric: "3/10",
                        },
                        {
                            id: "3",
                            tontine_name: "Notre entreprise",
                            tontine_illustration:
                                "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500",
                            progression: 100,
                            manager: {
                                fullname: "Laura Colline",
                                photo: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                id: "aaa",
                            },
                            members: [
                                {
                                    id: "u1",
                                    photo: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                    abreviation: "AA",
                                    name: "aa",
                                },
                                {
                                    id: "u2",
                                    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                    abreviation: "AA",
                                    name: "aaa",
                                },
                                {
                                    id: "u3",
                                    photo: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                    abreviation: "AA",
                                    name: "aaa",
                                },
                                {
                                    id: "u4",
                                    photo: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                    abreviation: "AA",
                                    name: "aaa",
                                },
                                {
                                    id: "u5",
                                    photo: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                    abreviation: "AA",
                                    name: "aaa",
                                },
                                {
                                    id: "u6",
                                    photo: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                    abreviation: "AA",
                                    name: "aaa",
                                },
                            ],
                            areAllMembersIdentified: true,
                            actionForDetails: () => {},
                            actionToContribute: () => {},
                            date: "9/07/2025",
                            metric: "1",
                        },
                    ]?.map(item => (
                        <CardTontine
                            key={item?.id}
                            tontine_name={item?.tontine_name}
                            tontine_illustration={item?.tontine_illustration}
                            progression={item?.progression}
                            manager={item?.manager}
                            members={item?.members}
                            areAllMembersIdentified={item?.areAllMembersIdentified}
                            actionForDetails={item?.actionForDetails}
                            actionToContribute={item?.actionToContribute}
                            date={item?.date}
                            metric={item?.metric}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}
