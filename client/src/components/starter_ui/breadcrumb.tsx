"use client";
import Link from "next/link";
import React from "react";
import { ChevronRightIcon } from "../icons";
import { Dropdown, DropdownItem } from "./dropdown";

type ToggleProps = {
    content: { label: React.ReactNode; redirect: string }[];
};

const Breadcrumb: React.FC<ToggleProps> = ({ content }) => {
    const shouldTruncate = content.length > 4;
    let displayedContent = content;

    if (shouldTruncate) {
        displayedContent = [content[0], { label: "...", redirect: "#" }, ...content.slice(-2)];
    }

    return (
        <div>
            <div className="flex items-center">
                {displayedContent.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                        {item.redirect === "#" ? (
                            <>
                                {item.label === "..." ? (
                                    <>
                                        <Dropdown
                                            dropdownOrigin="left"
                                            classNames="w-[150px]"
                                            dropdownTrigger={
                                                <span className="opacity-60 sm:hover:opacity-100">
                                                    {"..."}
                                                </span>
                                            }
                                        >
                                            <div className="p-2 h-auto max-h-auto">
                                                <div className=" max-h-[300px] ">
                                                    <ul>
                                                        {content?.slice(1, -2)?.map(
                                                            (
                                                                el: {
                                                                    label: React.ReactNode;
                                                                    redirect: string;
                                                                },
                                                                idx: number
                                                            ) => (
                                                                <li key={idx}>
                                                                    <DropdownItem asChild>
                                                                        <Link href={"#"}>
                                                                            <span className="text-sm">
                                                                                {el?.label}
                                                                            </span>
                                                                        </Link>
                                                                    </DropdownItem>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Dropdown>
                                    </>
                                ) : (
                                    <span
                                        className={`${idx !== displayedContent.length - 1 ? "text-primary/60" : "text-primary "} font-semibold block text-sm leading-none`}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </>
                        ) : (
                            <Link href={item.redirect}>
                                <div className="cursor-pointer">
                                    <span
                                        className={`${idx !== displayedContent.length - 1 ? "text-primary/60 " : ""} transition-all block text-sm font-semibold leading-none`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        )}
                        {idx !== displayedContent.length - 1 && (
                            <div className="text-primary/60 block px-2 pt-0.5">
                                <ChevronRightIcon size={16} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Breadcrumb;
