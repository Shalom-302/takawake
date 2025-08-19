"use client";

import LoadingIndicator from "@/components/starter_ui/loading-indicator";

export default function ViewLoading() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Loading indicator"}</span>
                </div>
                <div className="px-4 py-6 space-y-4 flex flex-wrap gap-6">
                    <LoadingIndicator size={"sm"} />
                    <LoadingIndicator size={"md"} />
                    <LoadingIndicator size={"lg"} />
                    <LoadingIndicator size={"xl"} label="Opération en cours..." />
                </div>
            </section>
        </>
    );
}
