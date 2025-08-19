"use client";

import Button from "@/components/starter_ui/button";
import { Sheet } from "@/components/starter_ui/sheet";
import { useState } from "react";

export default function ViewSheet() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const toggleSheet = () => {
        setIsSheetOpen(prev => !prev);
    };

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Sheet"}</span>
                </div>
                <div className="px-4 py-6">
                    <Button onClick={toggleSheet}>
                        {"Open sheet"}
                    </Button>

                    <Sheet side="right" isOpen={isSheetOpen} onClose={toggleSheet}>
                        <div>Mon contenu</div>
                    </Sheet>
                </div>
            </section>
        </>
    );
}
