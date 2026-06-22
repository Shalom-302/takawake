import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                "display-xs",
                "display-sm",
                "display-md",
                "display-lg",
                "display-xl",
                "display-2xl",
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs));
}
