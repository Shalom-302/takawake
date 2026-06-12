"use client";

import { useCallback, useRef, useState } from "react";

const DEFAULT_TIMEOUT = 2000;

type UseClipboardOptions = {
    timeout?: number;
};

type UseClipboardReturnType = {
    copied: string | boolean;
    copy: (text: string, id?: string) => Promise<{ success: boolean; error?: Error }>;
    reset: () => void;
};

/**
 * Custom hook to copy text to the clipboard.
 *
 * @param {UseClipboardOptions} options - Configuration options.
 * @returns {UseClipboardReturnType} - An object containing the copied state, copy function, and reset function.
 */
export const useClipboard = (options?: UseClipboardOptions): UseClipboardReturnType => {
    const [copied, setCopied] = useState<string | boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

    // Fallback function for older browsers
    const fallback = useCallback(
        (text: string, id?: string) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "absolute";
                textArea.style.left = "-99999px";
                textArea.style.top = "0";
                textArea.setAttribute("readonly", "");

                document.body.appendChild(textArea);

                // Better selection for iOS
                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    const range = document.createRange();
                    range.selectNodeContents(textArea);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                } else {
                    textArea.select();
                }

                const success = document.execCommand("copy");
                textArea.remove();

                if (success) {
                    setCopied(id || true);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => setCopied(false), timeout);
                }

                return success
                    ? { success: true }
                    : { success: false, error: new Error("execCommand returned false") };
            } catch (err) {
                return {
                    success: false,
                    error: err instanceof Error ? err : new Error("Fallback copy failed"),
                };
            }
        },
        [timeout]
    );

    const copy = useCallback(
        async (text: string, id?: string) => {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);

                    setCopied(id || true);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => setCopied(false), timeout);

                    return { success: true };
                } catch (err) {
                    console.log("error", err);
                    return fallback(text, id);
                }
            }
            return fallback(text, id);
        },
        [fallback, timeout]
    );

    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setCopied(false);
    }, []);

    return { copied, copy, reset };
};
