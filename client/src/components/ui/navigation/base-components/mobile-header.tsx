"use client";

import type { PropsWithChildren } from "react";
import React from "react";
import { UntitledLogo } from "@/components/icons/_old/logo/untitledui-logo";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils/cn";
import { DrawerCustom as Drawer } from "@/components/ui/drawer";
import { Menu02, X as CloseIcon } from "@untitled-ui/icons-react";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    return (
        <>
            <Drawer.Root direction="left">
                {/* Header fixe toujours visible sur mobile */}
                <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-secondary bg-primary py-3 pr-2 pl-4 lg:hidden">
                    <UntitledLogo className="h-8" />

                    <Drawer.Trigger asChild>
                        <Button
                            variant="tertiary"
                            size="sm"
                            aria-label="Open navigation menu"
                            className="flex items-center justify-center rounded-lg p-2 text-fg-secondary outline-focus-ring hover:bg-primary_hover hover:text-fg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <Menu02 className="size-6" />
                        </Button>
                    </Drawer.Trigger>
                </header>

                {/* Spacer pour compenser le header fixe */}
                <div className="h-16 lg:hidden" />

                <Drawer.Content
                    showCloseButton={false}
                    className={cn(
                        "flex flex-col border-secondary bg-primary p-0",
                        "data-[vaul-drawer-direction=left]:w-[85%] data-[vaul-drawer-direction=left]:max-w-sm"
                    )}
                >
                    {/* Header du drawer */}
                    <div className="flex h-16 shrink-0 items-center justify-between border-b border-secondary px-4 py-3">
                        <UntitledLogo className="h-8" />

                        <Drawer.Close asChild>
                            <Button
                                variant="tertiary"
                                size="sm"
                                aria-label="Close navigation menu"
                                className="flex items-center justify-center rounded-lg p-2 text-fg-secondary outline-focus-ring hover:bg-primary_hover hover:text-fg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                <CloseIcon className="size-6" />
                            </Button>
                        </Drawer.Close>
                    </div>

                    {/* Contenu scrollable */}
                    <div className="flex-1 overflow-auto">{children}</div>
                </Drawer.Content>
            </Drawer.Root>
        </>
    );
};
