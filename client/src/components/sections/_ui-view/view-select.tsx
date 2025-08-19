"use client";

import Label from "@/components/starter_ui/label";
import Select from "@/components/starter_ui/select";
import { SelectMulti, SelectMultiTwo } from "@/components/starter_ui/select-multi";
import { SelectProps } from "@/lib/types/definitions";

import { useState } from "react";

export default function ViewSelect() {
    const [selectedElements, setSelectedElements] = useState<SelectProps[]>([]);

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Select"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sports">{"Select one"}</Label>
                        <Select
                            id="sports"
                            selectedElements={selectedElements}
                            setSelectedElements={setSelectedElements}
                            customSize="sm"
                            items={[
                                { label: "Football", value: "foo" },
                                { label: "Natation", value: "nat" },
                                { label: "Basket-ball", value: "bas" },
                                { label: "Volley-ball", value: "vol" },
                            ]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sports_2">{"Select one with search"}</Label>
                        <Select
                            id="sports_2"
                            selectedElements={selectedElements}
                            setSelectedElements={setSelectedElements}
                            customSize="sm"
                            items={[
                                { label: "Football", value: "foo" },
                                { label: "Natation", value: "nat" },
                                { label: "Basket-ball", value: "bas" },
                                { label: "Volley-ball", value: "vol" },
                            ]}
                            withSearch={true}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categories">{"Select multi"}</Label>
                        <SelectMulti
                            id="categories"
                            items={[
                                { label: "Football", value: "foo" },
                                { label: "Natation", value: "nat" },
                                { label: "Basket-ball", value: "bas" },
                                { label: "Volley-ball", value: "vol" },
                            ]}
                            placeholder="Choisissez vos préférences"
                            selectedElements={selectedElements}
                            setSelectedElements={setSelectedElements}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categories_2">{"Select multi with search"}</Label>
                        <SelectMulti
                            id="categories_2"
                            items={[
                                { label: "Football", value: "foo" },
                                { label: "Natation", value: "nat" },
                                { label: "Basket-ball", value: "bas" },
                                { label: "Volley-ball", value: "vol" },
                            ]}
                            withSearch={true}
                            placeholder="Choisissez vos préférences"
                            selectedElements={selectedElements}
                            setSelectedElements={setSelectedElements}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{"Options"}</Label>
                        <div className="flex gap-3 items-center">
                            <SelectMultiTwo
                                id="categories_m2"
                                items={[
                                    { label: "Football", value: "foo" },
                                    { label: "Natation", value: "nat" },
                                    { label: "Basket-ball", value: "bas" },
                                    { label: "Volley-ball", value: "vol" },
                                ]}
                                placeholder="Statut"
                                selectedElements={selectedElements}
                                setSelectedElements={setSelectedElements}
                            />
                            <SelectMultiTwo
                                id="categories_m3"
                                items={[
                                    { label: "Faible", value: "fai" },
                                    { label: "Moyenne", value: "moy" },
                                    { label: "Normale", value: "nor" },
                                    { label: "Haute", value: "hau" },
                                ]}
                                placeholder="Priorité"
                                selectedElements={selectedElements}
                                setSelectedElements={setSelectedElements}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
