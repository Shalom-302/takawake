"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import testService from "@/lib/services/test-service";

// ✅ Schema for Test creation
const testFormSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
    description: z.string().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

interface ManageTestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ManageTestDialog({ open, onOpenChange }: ManageTestDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TestFormValues>({
        resolver: zodResolver(testFormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (data: TestFormValues) => {
        setIsSubmitting(true);

        try {
            const response = await testService.createTest(data);
            toast.success(`Le test ${response.name} a été créé avec succès.`);

            form.reset();
            onOpenChange(false);
            window.location.reload();
        } catch (error: any) {
            console.error("Erreur lors de la création du test:", error);

            let errorMessage = "Impossible de créer le test. Veuillez réessayer.";

            if (error.response?.status === 422) {
                if (Array.isArray(error.response.data?.detail)) {
                    const errors = error.response.data.detail.map(
                        (err: { loc: string[]; msg: string }) => `${err.loc.join(".")} : ${err.msg}`
                    );
                    errorMessage = errors.join("\n");
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            }

            toast.error(`${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer un test</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations pour ajouter un test.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom du test" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optionnel)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description du test" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Création en cours...
                                    </>
                                ) : (
                                    "Créer le test"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
