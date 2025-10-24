"use client";

import React, { FC, HTMLAttributes } from "react";
import {
    ChevronSelectorVertical,
    BookOpen01,
    LogOut01,
    Plus,
    Settings01,
    User01,
} from "@untitled-ui/icons-react";
import { AvatarLabel } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import { cn } from "@/lib/utils/cn";
import { Kbd } from "@/components/ui/kbd";
import { Popover } from "@/components/ui/popover";
import { RadioGroupCustom as RadioGroup } from "@/components/ui/radio-group";

type NavAccountType = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: "online" | "offline";
};

const placeholderAccounts: NavAccountType[] = [
    {
        id: "olivia",
        name: "Olivia Rhye",
        email: "olivia@untitledui.com",
        avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
        status: "online",
    },
    {
        id: "sienna",
        name: "Sienna Hewitt",
        email: "sienna@untitledui.com",
        avatar: "https://www.untitledui.com/images/avatars/transparent/sienna-hewitt?bg=%23E0E0E0",
        status: "online",
    },
];

const NavAccountCardMenuItem = ({
    icon: Icon,
    label,
    shortcut,
    ...buttonProps
}: {
    icon?: FC<{ className?: string }>;
    label: string;
    shortcut?: string;
} & HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...buttonProps}
            className={cn(
                "group/item w-full cursor-pointer px-1.5 focus:outline-hidden",
                buttonProps.className
            )}
        >
            <div
                className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md p-2 group-hover/item:bg-primary_hover",
                    "outline-focus-ring group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-2"
                )}
            >
                <div className="flex gap-2 text-sm font-semibold text-secondary group-hover/item:text-secondary_hover">
                    {Icon && <Icon className="size-5 text-fg-quaternary" />} {label}
                </div>

                {shortcut && <Kbd>{shortcut}</Kbd>}
            </div>
        </button>
    );
};

export const NavAccountMenu = ({
    className,
    selectedAccountId = "olivia",
    accounts = placeholderAccounts,
}: {
    className?: string;
    accounts?: NavAccountType[];
    selectedAccountId?: string;
}) => {
    return (
        <div
            className={cn(
                "w-66 rounded-xl bg-secondary_alt shadow-lg ring ring-secondary_alt outline-hidden",
                className
            )}
        >
            <div className="rounded-xl bg-primary ring-1 ring-secondary">
                <div className="flex flex-col gap-0.5 py-1.5">
                    <NavAccountCardMenuItem label="View profile" icon={User01} shortcut="⌘K-->P" />
                    <NavAccountCardMenuItem
                        label="Account settings"
                        icon={Settings01}
                        shortcut="⌘S"
                    />
                    <NavAccountCardMenuItem label="Documentation" icon={BookOpen01} />
                </div>
                <div className="flex flex-col gap-0.5 border-t border-secondary py-1.5">
                    <div className="px-3 pt-1.5 pb-1 text-xs font-semibold text-tertiary">
                        Switch account
                    </div>

                    <div className="flex flex-col gap-0.5 px-1.5">
                        <RadioGroup.Root defaultValue={selectedAccountId}>
                            {accounts.map(account => (
                                <label
                                    key={account.id}
                                    className={cn(
                                        "relative w-full cursor-pointer rounded-md px-2 py-1.5 text-left outline-focus-ring hover:bg-primary_hover focus:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                                        account.id === selectedAccountId && "bg-primary_hover"
                                    )}
                                >
                                    <AvatarLabel
                                        size="md"
                                        src={account.avatar}
                                        alt={account.name}
                                        title={account.name}
                                        subtitle={account.email}
                                        status={account.status}
                                    />
                                    <span className="absolute top-2 right-2 ">
                                        <RadioGroup.Item value={account.id} />
                                    </span>
                                </label>
                            ))}
                        </RadioGroup.Root>
                    </div>
                </div>
                <div className="flex flex-col gap-2 px-2 pt-0.5 pb-2">
                    <Button leftIcon={Plus} variant="secondary" size="sm">
                        Add account
                    </Button>
                </div>
            </div>

            <div className="pt-1 pb-1.5">
                <NavAccountCardMenuItem label="Sign out" icon={LogOut01} shortcut="⌥⇧Q" />
            </div>
        </div>
    );
};

export const NavAccountCard = ({
    selectedAccountId = "olivia",
    items = placeholderAccounts,
}: {
    selectedAccountId?: string;
    items?: NavAccountType[];
}) => {
    const isDesktop = useBreakpoint("lg");

    const selectedAccount =
        items.find(account => account.id === selectedAccountId) || placeholderAccounts[0];

    if (!selectedAccount) {
        console.warn(`Account with ID ${selectedAccountId} not found in <NavAccountCard />`);
        return null;
    }

    return (
        <div className="relative flex items-center gap-3 rounded-xl p-3 ring-1 ring-secondary ring-inset">
            <AvatarLabel
                size="md"
                src={selectedAccount.avatar}
                title={selectedAccount.name}
                subtitle={selectedAccount.email}
                status={selectedAccount.status}
            />

            <div className="absolute top-1.5 right-1.5">
                <Popover
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <ChevronSelectorVertical className="size-4 shrink-0" />
                        </Button>
                    }
                    content={
                        <NavAccountMenu selectedAccountId={selectedAccountId} accounts={items} />
                    }
                    contentClassName={cn(isDesktop ? "max-w-xs" : "max-w-sm", "p-0")}
                    align={"end"}
                    sideOffset={8}
                />
            </div>
        </div>
    );
};
