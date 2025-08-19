/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DotsHorizontalIcon } from "@/components/icons";
import { Avatar, AvatarImage } from "@/components/starter_ui/avatar";
import { Dropdown, DropdownItem } from "@/components/starter_ui/dropdown";
import { Table } from "@/components/starter_ui/table";
import { useState } from "react";

export default function ViewTable() {
    const headers = [
        { label: "Utilisateur", id: "user" },
        { label: "Email", id: "email" },
        { label: "Rôle", id: "role" },
        { label: "", id: "action" },
    ];

    const datas = [
        {
            user: (
                <>
                    <div className="relative flex items-center gap-3 group">
                        <Avatar size={"md"}>
                            <AvatarImage
                                src="https://github.com/url.pg"
                                alt="User Avatar"
                                avatarFallback={"CN"}
                                showIcon={true}
                            />
                        </Avatar>
                        <div className="text-left">
                            <span className="block text-sm">{"Doe John"}</span>
                            <span className=" opacity-60 block text-xs text-primary/70">
                                {"username"}
                            </span>
                        </div>
                    </div>
                </>
            ),
            email: "john@example.com",
            role: "Admin",
            action: (
                <div className="flex items-center justify-end w-full">
                    <Dropdown
                        dropdownTrigger={
                            <div>
                                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                                    <DotsHorizontalIcon size={20} />
                                </div>
                            </div>
                        }
                        triggerMode="click"
                    >
                        <div className="p-2 w-auto min-w-[220px]">
                            {[
                                { id: 1, label: "My account" },
                                { id: 2, label: "Profile" },
                                { id: 3, label: "Settings" },
                                { id: 4, label: "Keyboard shortcuts" },
                            ]?.map((el: any) => (
                                <DropdownItem key={el?.id} asChild>
                                    <div>
                                        <span className="text-sm">{el?.label}</span>
                                    </div>
                                </DropdownItem>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
        {
            user: (
                <>
                    <div className="relative flex items-center gap-3 group">
                        <Avatar size={"md"}>
                            <AvatarImage
                                src="https://github.com/url.pg"
                                alt="User Avatar"
                                avatarFallback={"CN"}
                                showIcon={true}
                            />
                        </Avatar>
                        <div className="text-left">
                            <span className="block text-sm">{"Lasme Paul"}</span>
                            <span className=" opacity-60 block text-xs">{"username"}</span>
                        </div>
                    </div>
                </>
            ),
            email: "paul@example.com",
            role: "Utilisateur",
            action: (
                <div className="flex items-center justify-end w-full">
                    <Dropdown
                        dropdownTrigger={
                            <div>
                                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                                    <DotsHorizontalIcon size={20} />
                                </div>
                            </div>
                        }
                        triggerMode="click"
                    >
                        <div className="p-2 w-auto min-w-[220px]">
                            {[
                                { id: 1, label: "My account" },
                                { id: 2, label: "Profile" },
                                { id: 3, label: "Settings" },
                                { id: 4, label: "Keyboard shortcuts" },
                            ]?.map((el: any) => (
                                <DropdownItem key={el?.id} asChild>
                                    <div>
                                        <span className="text-sm">{el?.label}</span>
                                    </div>
                                </DropdownItem>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
        {
            user: (
                <>
                    <div className="relative flex items-center gap-3 group">
                        <Avatar size={"md"}>
                            <AvatarImage
                                src="https://github.com/url.pg"
                                alt="User Avatar"
                                avatarFallback={"CN"}
                                showIcon={true}
                            />
                        </Avatar>
                        <div className="text-left">
                            <span className="block text-sm">{"Kay Donald"}</span>
                            <span className=" opacity-60 block text-xs">{"username"}</span>
                        </div>
                    </div>
                </>
            ),
            email: "donald@example.com",
            role: "Modérateur",
            action: (
                <div className="flex items-center justify-end w-full">
                    <Dropdown
                        dropdownTrigger={
                            <div>
                                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                                    <DotsHorizontalIcon size={20} />
                                </div>
                            </div>
                        }
                        triggerMode="click"
                    >
                        <div className="p-2 w-auto min-w-[220px]">
                            {[
                                { id: 1, label: "My account" },
                                { id: 2, label: "Profile" },
                                { id: 3, label: "Settings" },
                                { id: 4, label: "Keyboard shortcuts" },
                            ]?.map((el: any) => (
                                <DropdownItem key={el?.id} asChild>
                                    <div>
                                        <span className="text-sm">{el?.label}</span>
                                    </div>
                                </DropdownItem>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
    ];

    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    console.log('selectedUsers ===>', selectedUsers)

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Table"}</span>
                </div>
                <div className="px-4 py-6 space-y-6">
                    {/* table 1 */}
                    <Table
                        headers={headers}
                        datas={datas}
                        selectable={true}
                        onSelectionChange={setSelectedUsers}
                        noDataMessage="Aucune donnée disponible"
                    />

                    {/* table 2 */}
                    <Table
                        headers={headers}
                        datas={datas}
                        selectable={false}
                        onSelectionChange={setSelectedUsers}
                        noDataMessage="Aucune donnée disponible"
                    />
                </div>
            </section>
        </>
    );
}
