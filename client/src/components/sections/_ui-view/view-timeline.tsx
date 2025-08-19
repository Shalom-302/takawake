"use client";

import { Timeline } from "@/components/starter_ui/timeline";
import Image from "next/image";

export default function ViewTimeline() {
    const DATAS = [
        {
            id: 1,
            illustration: (
                <div className="h-full w-full">
                    <Image
                        src={"https://images.unsplash.com/photo-1438761681033-6461ffad8d80"}
                        fill
                        alt="illustration"
                        className="object-cover rounded-lg"
                    />
                </div>
            ),
            content: (
                <>
                    <div className="flex items-end gap-2">
                        <span className="text-primary text-sm font-medium block">
                            {"Drew Morison"}
                        </span>
                        <span className="text-primary text-xs block">
                            {"Il y a 12 heures"}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-primary">
                            {"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet"}
                        </p>
                    </div>
                </>
            ),
        },
        {
            id: 2,
            illustration: (
                <div className="h-full w-full">
                    <Image
                        src={"https://images.unsplash.com/photo-1701615004837-40d8573b6652"}
                        fill
                        alt="illustration"
                        className="object-cover rounded-lg"
                    />
                </div>
            ),
            content: (
                <>
                    <div className="flex items-end gap-2">
                        <span className="text-primary text-sm font-medium block">
                            {"Drew Morison"}
                        </span>
                        <span className="text-primary text-xs block">
                            {"Il y a 12 heures"}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-primary">
                            {"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet"}
                        </p>
                    </div>
                </>
            ),
        },
    ];

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Timeline"}</span>
                </div>
                <div className="px-4 py-6 space-y-5 mb-5">
                    <Timeline datas={DATAS} />

                    <Timeline datas={DATAS} direction="vertical" className="" />
                </div>
            </section>
        </>
    );
}
