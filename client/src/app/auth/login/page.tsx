"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { useAuth } from "@/lib/contexts/auth-context";

const loginSchema = z.object({
    username: z.string().min(1, { message: "Email requis." }),
    password: z.string().min(1, { message: "Mot de passe requis." }),
});

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "", password: "" },
    });

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        setSubmitting(true);
        try {
            const user = await login(data.username, data.password);
            // Admin → back-office ; lecteur → site public (jamais le dashboard).
            if (user) router.push(user.role?.name === "admin" ? "/dashboard" : "/");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-xl border border-black/10 p-8">
                <h1 className="text-lg font-semibold">{"Connexion"}</h1>
                <p className="mt-1 text-sm opacity-60">
                    {"Connectez-vous pour accéder à tous les articles."}
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        <InputForm
                            control={form.control}
                            name="username"
                            label="Email"
                            placeholder="you@example.com"
                            isRequired
                            size={"md"}
                        />
                        <InputForm
                            control={form.control}
                            name="password"
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            isRequired
                            size={"md"}
                        />
                        <Button type="submit" size={"lg"} className="w-full" disabled={submitting}>
                            {submitting ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>
                </Form>
                <p className="mt-6 text-center text-sm opacity-70">
                    {"Pas encore de compte ? "}
                    <Link href="/auth/register" className="font-medium underline">
                        {"Créer un compte"}
                    </Link>
                </p>
            </div>
        </main>
    );
}
