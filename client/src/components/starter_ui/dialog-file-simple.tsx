/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { XCloseIcon } from "../icons";
import Button from "./button";


type ModalProps = {
    isDialogActive: boolean;
    toggleDialog: Function;
    fileUrl: string;
} & React.ComponentPropsWithRef<"div">;

export const DialogFileSimple = React.forwardRef<HTMLDivElement, ModalProps>(
    ({ isDialogActive, toggleDialog, fileUrl }) => {
        useEffect(() => {
            if (isDialogActive) {
                document.body.classList.add("no-scroll");
            } else {
                document.body.classList.remove("no-scroll");
            }

            return () => {
                document.body.classList.remove("no-scroll");
            };
        }, [isDialogActive]);


        return (
            <>
                <AnimatePresence>
                    {isDialogActive && (
                        <motion.div
                            className={`
                          fixed flex items-center justify-center z-[1000] scrollbar-hide overflow-y-auto top-0 left-0 right-0 bottom-0 w-full h-full
                        `}
                        >
                            <motion.div
                                onClick={() => toggleDialog()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={` 
                                    fixed z-[100] top-0 left-0 right-0 bottom-0
                                    bg-gradient-to-b from-primary/70 to-primary backdrop-blur-xs
                                `}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className={` 
                                    z-[200] relative bg-bg-primary-foreground overflow-auto h-screen
                                    w-full mx-auto
                                `}
                            >
                                {/* <div className="">{children}</div> */}
                                <div className="h-[72px] py-4 bg-primary-foreground">
                                    <div className="w-full px-4 flex items-center justify-between">
                                        <Link href={"/"} className="relative w-[154.64px] h-8">
                                            <Image
                                                src="https://kaanari.com/logo.png"
                                                alt="Tonti Capital Logo"
                                                fill
                                                className="object-cover"
                                            />
                                        </Link>
                                        <Button
                                            size={"icon-md"}
                                            className="shrink-0 border-none shadow-none"
                                            onClick={() => toggleDialog()}
                                        >
                                            <div className="[&_svg]:scale-125">
                                                <XCloseIcon />
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row">
                                    <div className="w-full h-[calc(100vh-72px)] bg-bg-primary-foreground">
                                        {fileUrl && (
                                            <iframe
                                                src={fileUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: "none" }}
                                            ></iframe>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }
);
