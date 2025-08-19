"use client";

import { XCloseIcon } from "@/components/icons";
import { Alert } from "@/components/starter_ui/alert";
import Button from "@/components/starter_ui/button";
import { Toaster } from "@/components/starter_ui/sonner";
import { useAlert } from "@/lib/contexts/alert.context";

import Link from "next/link";
import { toast } from "sonner";

export default function ViewSonner() {
    const { showAlert } = useAlert();

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Sonner (Alert, notification)"}</span>
                </div>
                <div className="px-4 py-6 space-y-4 flex flex-wrap gap-4">
                    <Button
                        onClick={() =>
                            showAlert({
                                type: "error",
                                title: "Erreur lors de la connexion",
                                desc: "Nom d'utilisateur ou mot de passe incorrect.",
                                position: "top-right",
                            })
                        }
                        variant={"secondary"}
                    >
                        {"Show default alert"}
                    </Button>
                    <Button
                        onClick={() =>
                            showAlert({
                                position: "bottom-right",
                                customComponent: t => (
                                    <div className="p-4 bg-blue-100 border rounded shadow">
                                        <p className="text-blue-800 font-bold">Message customisé</p>
                                        <button
                                            onClick={() => toast.dismiss(t)}
                                            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                ),
                            })
                        }
                        variant={"secondary"}
                    >
                        {"Show custom alert"}
                    </Button>
                    {/* <Button
                        onClick={() => {
                            toast.custom(t => (
                                <div className="border border-[var(--border-tertiary)] min-w-[300px] rounded-xl shadow-lg bg-[var(--bg-primary_alt)] ">
                                    <div className="flex items-center justify-between gap-2 pt-2 px-4 pr-2">
                                        <div className="h-8 w-8 shrink-0 bg-neutral-light-100"></div>
                                        <Button
                                            size={"icon-sm"}
                                            variant={"tertiary"}
                                            className="border-none shadow-none"
                                            onClick={() => toast.dismiss(t)}
                                        >
                                            <XCloseIcon size={20} />
                                        </Button>
                                    </div>
                                    <div className="px-4 pt-1 pb-4">
                                        <span className="text-sm font-semibold">
                                            {"Nemo enim ipsam voluptatem"}
                                        </span>
                                        <p className="text-sm mt-1">
                                            {
                                                "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                            }
                                        </p>
                                    </div>
                                </div>
                            ));
                        }}
                        variant={"secondary"}
                    >
                        {"Show notification"}
                    </Button>

                    <Toaster position="top-right" /> */}

                    {/* 
                        ALERT
                    ---------- */}

                    {/* <Alert 
                        type={"error"} 
                        title={"Erreur lors de la connexion"}
                        desc={"all message here"}
                        action={() => {}} 
                    /> */}

                    {/* ------------ */}
                    <div className="border border-[var(--border-tertiary)] min-w-[300px] rounded-xl shadow-xs bg-[var(--bg-primary_alt)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-neutral-light-100"></div>
                                <div className="">
                                    <span className="text-sm font-semibold">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"tertiary"}
                                className="border-none shadow-none"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className=" min-w-[300px] rounded-xl bg-[var(--bg-brand-secondary)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-[var(--bg-primary)]"></div>
                                <div className="">
                                    <span className="text-sm font-semibold text-[var(--text-secondary)] ">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"secondary"}
                                className="border-none shadow-none  bg-[var(--bg-brand-secondary)] sm:hover:bg-[var(--bg-brand-secondary)]"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className=" min-w-[300px] rounded-xl bg-[var(--bg-primary_hover)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-[var(--bg-primary)]"></div>
                                <div className="">
                                    <span className="text-sm font-semibold text-[var(--text-secondary)] ">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"tertiary"}
                                className="border-none shadow-none  bg-[var(--bg-primary_hover)] sm:hover:bg-[var(--bg-primary_hover)]"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className=" min-w-[300px] rounded-xl bg-[var(--bg-error-secondary)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-[var(--bg-primary)]"></div>
                                <div className="">
                                    <span className="text-sm font-semibold text-[var(--text-secondary)] ">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"tertiary"}
                                className="border-none shadow-none  bg-[var(--bg-error-secondary)] sm:hover:bg-[var(--bg-error-secondary)]"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className=" min-w-[300px] rounded-xl bg-[var(--bg-warning-secondary)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-[var(--bg-primary)]"></div>
                                <div className="">
                                    <span className="text-sm font-semibold text-[var(--text-secondary)] ">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"tertiary"}
                                className="border-none shadow-none  bg-[var(--bg-warning-secondary)] sm:hover:bg-[var(--bg-warning-secondary)]"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className=" min-w-[300px] rounded-xl bg-[var(--bg-success-secondary)] ">
                        <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 bg-[var(--bg-primary)]"></div>
                                <div className="">
                                    <span className="text-sm font-semibold text-[var(--text-secondary)] ">
                                        {"Nemo enim ipsam voluptatem"}
                                    </span>
                                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                                        {
                                            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"icon-sm"}
                                variant={"tertiary"}
                                className="border-none shadow-none  bg-[var(--bg-success-secondary)] sm:hover:bg-[var(--bg-success-secondary)]"
                                onClick={() => {}}
                            >
                                <XCloseIcon size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
