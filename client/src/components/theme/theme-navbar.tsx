"use client";

import { ThemeToggle } from "./theme-toggle";

export function ThemeNavbar() {
    return (
        <div className="flex items-center justify-end p-4">
            <ThemeToggle />
        </div>
    );
}
