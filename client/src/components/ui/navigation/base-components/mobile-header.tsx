"use client";

import type { PropsWithChildren } from "react";
import React from "react";
import { UntitledLogo } from "@/components/icons/logo/untitledui-logo";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils/cn";
import { DialogCustom as Dialog } from "@/components/ui/dialog";
import { Menu02, X as CloseIcon } from "@untitled-ui/icons-react";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    return (
        <Dialog.Root>
            <header className="flex h-16 items-center justify-between border-b border-secondary bg-primary py-3 pr-2 pl-4 lg:hidden">
                <UntitledLogo />

                <Dialog.Trigger asChild>
                    <Button
                        variant="tertiary"
                        size="sm"
                        aria-label="Expand navigation menu"
                        className="group relative flex items-center justify-center rounded-lg bg-primary p-2 text-fg-secondary outline-focus-ring hover:bg-primary_hover hover:text-fg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <Menu02 className="size-6" />
                    </Button>
                </Dialog.Trigger>
            </header>

            <Dialog.Content
                showCloseButton={false}
                className={cn(
                    "fixed inset-0 z-50 bg-transparent border-0 p-0 shadow-none max-w-none lg:hidden"
                )}
            >
                {/* Bouton de fermeture flottant */}
                <Dialog.Close asChild>
                    <Button
                        variant="tertiary"
                        size="sm"
                        aria-label="Close navigation menu"
                        className="fixed top-3 right-2 z-10 flex cursor-pointer items-center justify-center rounded-lg p-2 text-fg-white/70 outline-focus-ring hover:bg-white/10 hover:text-fg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <CloseIcon className="size-6" />
                    </Button>
                </Dialog.Close>

                {/* Contenu du menu */}
                <div className="w-full h-dvh cursor-auto will-change-transform pr-16">
                    <div className="h-dvh outline-hidden focus:outline-hidden">{children}</div>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
