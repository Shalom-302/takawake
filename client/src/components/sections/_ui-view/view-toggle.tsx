"use client";
import { Toggle } from "@/components/starter_ui/toggle";
import { useState } from "react";

export default function ViewToggle() {
    const [checkedElements, setCheckedElements] = useState<string[]>([""]);

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Toggle"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="">
                        <Toggle
                            id={"general_info"}
                            isChecked={checkedElements}
                            setIsChecked={setCheckedElements}
                        />
                    </div>
                    <div className="">
                        <Toggle
                            id={"two"}
                            isChecked={checkedElements}
                            setIsChecked={setCheckedElements}
                            disabled
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
