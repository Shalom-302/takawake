"use client";

import { useAuthCallback } from "@/lib/hooks/use-auth-callback";

export default function AuthCallbackPage() {
    const { loading, error } = useAuthCallback();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900"></div>
                    <p className="text-sm text-neutral-500">Processing authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="mx-auto flex w-full max-w-md flex-col space-y-4 rounded-lg border border-red-100 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
                        Authentication Error
                    </h2>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    <a
                        href="/auth/login"
                        className="mx-auto rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-100"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    return null;
}
