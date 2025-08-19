"use client";
import React, { JSX, Dispatch, SetStateAction } from "react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { MenuOneIcon } from "../icons/menu-one-icon";

type DropDownProps = {
    items: {
        id: string;
        position: number;
        content: JSX.Element;
    }[];
    setItems: Dispatch<
        SetStateAction<
            {
                id: string;
                position: number;
                content: JSX.Element;
            }[]
        >
    >;
    itemClassName?: string;
    groupClassName?: string;
} & React.ComponentPropsWithRef<"div">;

const ReorderBloc = React.forwardRef<HTMLDivElement, DropDownProps>(
    ({ items, setItems, itemClassName, groupClassName }, ref) => {
        const handleReorder = (newItems: any) => {
            const updatedItems = newItems.map((item: any, index: number) => ({
                ...item,
                position: index + 1,
            }));
            setItems(updatedItems);
        };

        return (
            <>
                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={handleReorder}
                    className={cn("", groupClassName)}
                >
                    {items.map((item, index) => (
                        <Reorder.Item
                            key={item.id}
                            value={item}
                            style={{ pointerEvents: "auto", cursor: "grab" }}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-between gap-2",
                                    itemClassName
                                )}
                            >
                                <div>
                                    {React.isValidElement(item.content)
                                        ? React.cloneElement(
                                              item.content as React.ReactElement<any>,
                                              {
                                                  number: index + 1,
                                              }
                                          )
                                        : null}
                                </div>
                                <>
                                    <div className="h-10 w-10 text-primary flex items-center justify-center">
                                        <MenuOneIcon size={24} />
                                    </div>
                                </>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </>
        );
    }
);

ReorderBloc.displayName = "ReorderBloc";

export default ReorderBloc;
