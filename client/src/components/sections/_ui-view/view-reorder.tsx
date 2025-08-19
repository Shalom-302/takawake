"use client";
import ReorderBloc from "@/components/starter_ui/reorder";
import { useState } from "react";

export default function ViewReorder() {
    const [baseData, setBaseData] = useState([
        {
            id: "aa",
            position: 0,
            content: <div>{"Alloco est doux que Frite"}</div>,
        },
        {
            id: "bb",
            position: 1,
            content: <div>{"Frite est doux que Alloco"}</div>,
        },
    ]);

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Re-order"}</span>
                </div>
                <div className="px-4 py-6 space-y-5 mb-5">
                    <ReorderBloc items={baseData} setItems={setBaseData} itemClassName="py-1" />
                </div>
            </section>
        </>
    );
}
