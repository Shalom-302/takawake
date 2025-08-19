"use client";
import LoginForm from "@/components/auth/login-form";
import SocialProviders from "@/components/auth/social-providers";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Enter your credentials to sign in to your account
                    </p>
                </div>
                <LoginForm />
                <SocialProviders />
            </div>
        </div>
    );
}
