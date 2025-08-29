"use client";

// import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/buttons/button";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";
// import Link from "next/link";

import { useState } from "react";

export default function ViewDropdown() {
    const [theme, setTheme] = useState("light");
    const [showNotifications, setShowNotifications] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    return (
        <section className="border border-neutral-200 rounded-lg">
            <div className="px-4 py-2 border-b border-neutral-200">
                <span>{"Dropdown"}</span>
            </div>
            <div className="px-4 py-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                    {/* Menu avec séparateur et action destructive */}
                    <DropdownMenu
                        trigger={<Button variant="secondary">{"Actions"}</Button>}
                        contentClassName="min-w-[120px]"
                        items={[
                            { id: "edit", label: "Edit", onClick: () => console.log("Edit") },
                            {
                                id: "duplicate",
                                label: "Duplicate",
                                onClick: () => console.log("Duplicate"),
                            },
                            { id: "sep1", type: "separator" },
                            {
                                id: "delete",
                                label: "Delete",
                                variant: "destructive",
                                onClick: () => console.log("Delete"),
                            },
                        ]}
                    />

                    {/* Menu avec radio group */}
                    <DropdownMenu
                        trigger={<Button>{"Theme"}</Button>}
                        contentClassName="min-w-[120px]"
                        radioGroupValue={theme}
                        onRadioValueChange={setTheme}
                        items={[
                            { id: "light", type: "radio", label: "Light", value: "light" },
                            { id: "dark", type: "radio", label: "Dark", value: "dark" },
                            { id: "system", type: "radio", label: "System", value: "system" },
                        ]}
                    />

                    {/* Menu avec checkboxes */}
                    <DropdownMenu
                        trigger={<Button>{"Options"}</Button>}
                        contentClassName="min-w-[180px]"
                        items={[
                            {
                                id: "notifications",
                                type: "checkbox",
                                label: "Show notifications",
                                checked: showNotifications,
                                onClick: () => setShowNotifications(!showNotifications),
                            },
                            {
                                id: "darkmode",
                                type: "checkbox",
                                label: "Enable dark mode",
                                checked: darkModeEnabled,
                                onClick: () => setDarkModeEnabled(!darkModeEnabled),
                            },
                        ]}
                    />

                    {/* Menu avec groupes et sous-menus */}
                    <DropdownMenu
                        trigger={<Button variant="secondary">Open</Button>}
                        contentClassName="w-56"
                        align="start"
                        contentLabel="My Account"
                        groups={[
                            {
                                id: "account",
                                items: [
                                    { id: "profile", label: "Profile", shortcut: "⇧⌘P" },
                                    { id: "billing", label: "Billing", shortcut: "⌘B" },
                                    { id: "settings", label: "Settings", shortcut: "⌘S" },
                                    {
                                        id: "shortcuts",
                                        label: "Keyboard shortcuts",
                                        shortcut: "⌘K",
                                    },
                                ],
                            },
                            {
                                id: "team",
                                items: [
                                    { id: "team", label: "Team" },
                                    {
                                        id: "invite",
                                        type: "sub",
                                        label: "Invite users",
                                        items: [
                                            { id: "email", label: "Email" },
                                            { id: "message", label: "Message" },
                                            { id: "sep2", type: "separator" },
                                            { id: "more", label: "More..." },
                                        ],
                                    },
                                    { id: "newteam", label: "New Team", shortcut: "⌘+T" },
                                ],
                            },
                            {
                                id: "external",
                                items: [
                                    { id: "github", label: "GitHub" },
                                    { id: "support", label: "Support" },
                                    { id: "api", label: "API", disabled: true },
                                ],
                            },
                            {
                                id: "logout",
                                items: [{ id: "logout", label: "Log out", shortcut: "⇧⌘Q" }],
                            },
                        ]}
                    />

                    {/* Menu avec bouton dots */}
                    <DropdownMenu
                        trigger={<DropdownDotsButton />}
                        align="end"
                        contentClassName="min-w-[100px]"
                        items={[
                            { id: "view", label: "View details" },
                            { id: "archive", label: "Archive" },
                            { id: "remove", label: "Remove", variant: "destructive" },
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
