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

// Le backend exige 8+ caractères, une majuscule, une minuscule, un chiffre et un
// caractère spécial. On valide ici pour un retour immédiat avant l'appel réseau.
const registerSchema = z
    .object({
        email: z.string().email({ message: "Email invalide." }),
        password: z
            .string()
            .min(8, { message: "8 caractères minimum." })
            .regex(/[A-Z]/, { message: "Au moins une majuscule." })
            .regex(/[a-z]/, { message: "Au moins une minuscule." })
            .regex(/[0-9]/, { message: "Au moins un chiffre." })
            .regex(/[^A-Za-z0-9]/, { message: "Au moins un caractère spécial." }),
        confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas.",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    async function onSubmit(data: z.infer<typeof registerSchema>) {
        setSubmitting(true);
        try {
            // Inscription = compte lecteur (rôle reader forcé côté backend).
            const ok = await register(data.email, data.password);
            // Lecteur → on reste sur le site public.
            if (ok) router.push("/");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-xl border border-black/10 p-8">
                <h1 className="text-lg font-semibold">{"Créer un compte"}</h1>
                <p className="mt-1 text-sm opacity-60">
                    {"Inscrivez-vous gratuitement pour lire tous les articles."}
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        <InputForm
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="vous@exemple.com"
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
                        <InputForm
                            control={form.control}
                            name="confirmPassword"
                            label="Confirmer le mot de passe"
                            type="password"
                            placeholder="••••••••"
                            isRequired
                            size={"md"}
                        />
                        <Button type="submit" size={"lg"} className="w-full" disabled={submitting}>
                            {submitting ? "Création..." : "Créer mon compte"}
                        </Button>
                    </form>
                </Form>
                <p className="mt-6 text-center text-sm opacity-70">
                    {"Déjà un compte ? "}
                    <Link href="/auth/login" className="font-medium underline">
                        {"Se connecter"}
                    </Link>
                </p>
            </div>
        </main>
    );
}
