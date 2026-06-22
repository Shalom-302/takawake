"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    reviver?: (raw: unknown) => T
): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const item = localStorage.getItem(key);
            const parsed = item ? JSON.parse(item) : initialValue;
            return reviver ? reviver(parsed) : parsed;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
