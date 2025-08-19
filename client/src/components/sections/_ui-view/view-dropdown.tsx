"use client";
import { ChevronDownIcon } from "@/components/icons";
import { Dropdown, DropdownItem } from "@/components/starter_ui/dropdown";
import Link from "next/link";

export default function ViewDropdown() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Dropdown"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className=" flex flex-wrap gap-2 ">
                        <Dropdown
                            dropdownTrigger={
                                <div className="relative flex items-center gap-2 group border border-primary rounded-md h-10 px-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="block text-sm">{"Account"}</span>
                                        <ChevronDownIcon size={16} />
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
                                        <Link href={"#"}>
                                            <span className="text-sm">{el?.label}</span>
                                        </Link>
                                    </DropdownItem>
                                ))}
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </section>
        </>
    );
}
