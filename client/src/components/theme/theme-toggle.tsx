"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Tooltip } from "../ui/tooltip";
import { Button } from "../ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Éviter les problèmes d'hydratation
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Tooltip
            title={<p>{theme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}</p>}
        >
            <Button
                variant="tertiary"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Basculer le thème"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Basculer le thème</span>
            </Button>
        </Tooltip>
    );
}
