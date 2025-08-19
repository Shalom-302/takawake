"use client";

import { AspectRatio } from "@/components/starter_ui/aspect-ratio";
import Image from "next/image";

export default function ViewAspectRatio() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Aspect Ratio"}</span>
                </div>
                <div className="px-4 py-6 space-y-5">
                    <div className="relative w-full h-[300px] rounded-xl overflow-hidden ">
                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                            <Image
                                src="https://images.unsplash.com/photo-1530735606451-8f5f13955328"
                                alt="Illustration"
                                fill
                                className="h-full w-full object-center object-cover"
                            />
                        </AspectRatio>
                    </div>
                </div>
            </section>
        </>
    );
}
