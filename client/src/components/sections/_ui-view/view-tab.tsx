"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/starter_ui/tab";

export default function ViewTab() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Tab"}</span>
                </div>
                <div className="px-4 py-6 space-y-10">
                    {/* horizontal */}
                    <Tabs defaultValue="animals" display="horizontal" className="">
                        <TabsList className="">
                            <TabsTrigger value="animals">Animaux</TabsTrigger>
                            <TabsTrigger value="fruit">Fruit</TabsTrigger>
                            <TabsTrigger value="color">Couleurs</TabsTrigger>
                        </TabsList>
                        <TabsContent className="w-full py-4" value="animals">
                            Chien
                        </TabsContent>
                        <TabsContent className="w-full py-4" value="fruit">
                            Pomme
                        </TabsContent>
                        <TabsContent className="w-full py-4" value="color">
                            Rouge
                        </TabsContent>
                    </Tabs>

                    {/* vertical */}
                    <Tabs defaultValue="alpha" display="vertical" className="relative">
                        <TabsList className="w-[200px] shrink-0 ">
                            <TabsTrigger className="w-full text-left" value="alpha">
                                Pays
                            </TabsTrigger>
                            <TabsTrigger className="w-full text-left" value="beta">
                                Ville
                            </TabsTrigger>
                            <TabsTrigger className="w-full text-left" value="gamma">
                                Commune
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="alpha" className="w-full px-4">
                            <div>
                                xdgvxdvdv
                                <section>fghjkfgyjfj</section>
                            </div>
                        </TabsContent>
                        <TabsContent value="beta" className="w-full px-4">
                            {"Abidjan"}
                        </TabsContent>
                        <TabsContent value="gamma" className="w-full px-4">
                            {"Cocody"}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </>
    );
}
