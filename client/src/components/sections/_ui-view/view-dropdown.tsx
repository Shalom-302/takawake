"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function ViewDropdown() {
    return (
        <section className="border border-neutral-200 rounded-lg">
            <div className="px-4 py-2 border-b border-neutral-200">
                <span>{"Dropdown"}</span>
            </div>
            <div className="px-4 py-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                    {/* Menu simple */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="secondary" iconRight={<ChevronDownIcon size={16} />}>
                                {"Account"}
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="min-w-[220px]">
                            {[
                                { id: 1, label: "My account" },
                                { id: 2, label: "Profile" },
                                { id: 3, label: "Settings" },
                                { id: 4, label: "Keyboard shortcuts" },
                            ].map(el => (
                                <DropdownMenu.Item key={el.id} asChild>
                                    <Link href="#">
                                        <span className="text-sm">{el.label}</span>
                                    </Link>
                                </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    {/* Menu avec séparateurs + destructive action */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="secondary">{"Actions"}</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="min-w-[220px]">
                            <DropdownMenu.Item>{"Edit"}</DropdownMenu.Item>
                            <DropdownMenu.Item>{"Duplicate"}</DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item variant="destructive">{"Delete"}</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    {/* Menu avec checkboxes */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button>{"Options"}</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="min-w-[220px]">
                            <DropdownMenu.CheckboxItem checked>
                                {"Show notifications"}
                            </DropdownMenu.CheckboxItem>
                            <DropdownMenu.CheckboxItem>
                                {"Enable dark mode"}
                            </DropdownMenu.CheckboxItem>
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    {/* Menu avec radio group */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button>{"Theme"}</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="min-w-[220px]">
                            <DropdownMenu.RadioGroup value="system">
                                <DropdownMenu.RadioItem value="light">
                                    {"Light"}
                                </DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="dark">
                                    {"Dark"}
                                </DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="system">
                                    {"System"}
                                </DropdownMenu.RadioItem>
                            </DropdownMenu.RadioGroup>
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    {/* Menu avec sous-menu */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="secondary">Open</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="w-56" align="start">
                            <DropdownMenu.Label>My Account</DropdownMenu.Label>
                            <DropdownMenu.Group>
                                <DropdownMenu.Item>
                                    Profile
                                    <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    Billing
                                    <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    Settings
                                    <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    Keyboard shortcuts
                                    <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Group>
                                <DropdownMenu.Item>Team</DropdownMenu.Item>
                                <DropdownMenu.Sub>
                                    <DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.SubContent>
                                            <DropdownMenu.Item>Email</DropdownMenu.Item>
                                            <DropdownMenu.Item>Message</DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item>More...</DropdownMenu.Item>
                                        </DropdownMenu.SubContent>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Sub>
                                <DropdownMenu.Item>
                                    New Team
                                    <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item>GitHub</DropdownMenu.Item>
                            <DropdownMenu.Item>Support</DropdownMenu.Item>
                            <DropdownMenu.Item disabled>API</DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item>
                                Log out
                                <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    {/* Menu icône seule (DotsButton) */}
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <DropdownMenu.DotsButton />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" className="min-w-[180px]">
                            <DropdownMenu.Item>{"View details"}</DropdownMenu.Item>
                            <DropdownMenu.Item>{"Archive"}</DropdownMenu.Item>
                            <DropdownMenu.Item variant="destructive">{"Remove"}</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu>
                </div>
            </div>
        </section>
    );
}
