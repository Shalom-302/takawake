/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { XCloseIcon } from "../icons";
import Button from "./button";
import Typography from "./typography";
import { Input } from "./input";
import Label from "./label";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "./checkbox";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { newTontineSchema } from "@/lib/types/definitions";

type ModalProps = {
    isDialogActive: boolean;
    toggleDialog: Function;
    fileUrl: string;
    toggleDialogCongrate: Function;
} & React.ComponentPropsWithRef<"div">;

export const DialogFile = React.forwardRef<HTMLDivElement, ModalProps>(
    ({ isDialogActive, toggleDialog, fileUrl, toggleDialogCongrate }) => {
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

        const [fullname, setFullname] = useLocalStorage<string>("fullname", "");
        const [isAgree, setIsAgree] = useLocalStorage<boolean>("isAgree", false);
        const schema = newTontineSchema.pick({ fullname: true, isAgree: true });
        const result = schema.safeParse({ fullname, isAgree });

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
                                    z-[200] relative bg-primary-foreground overflow-auto h-screen
                                    w-full mx-auto
                                `}
                            >
                                {/* <div className="">{children}</div> */}
                                <div className="h-[72px] border-b border-primary/20 py-4 bg-primary-foreground">
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
                                    <div className="w-full h-[calc(100vh-72px)] bg-primary-foreground">
                                        {fileUrl && (
                                            <iframe
                                                src={fileUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: "none" }}
                                            ></iframe>
                                        )}
                                    </div>
                                    <div className="w-full lg:w-[480px] h-fit gap-6 lg:h-[calc(100vh-72px)] flex flex-col shrink-0 ">
                                        <div className="p-8 h-full overflow-auto">
                                            <Typography
                                                variant={"display-xs"}
                                                className="font-[700]"
                                                as={"h2"}
                                            >
                                                {"Lisez, signez et créez la tontine"}
                                            </Typography>
                                            <Typography
                                                variant={"text-md"}
                                                className="text-primary mt-2"
                                                as={"p"}
                                            >
                                                {
                                                    "Assurez-vous de lire et de comprendre les termes du contrat. Tapez vos prénom(s) et nom complets ci-dessous pour signer."
                                                }
                                            </Typography>

                                            <div className="my-6">
                                                <Input
                                                    type="text"
                                                    placeholder="Nom Légal complet"
                                                    name="fullname"
                                                    customSize={"sm"}
                                                    value={fullname}
                                                    onChange={e => setFullname(e.target.value)}
                                                />
                                            </div>
                                            <Label
                                                htmlFor="isAgree"
                                                className={cn(
                                                    "flex items-start gap-3 cursor-pointer mt-[16px]"
                                                )}
                                            >
                                                <Checkbox
                                                    id="isAgree"
                                                    checked={isAgree}
                                                    onCheckedChange={setIsAgree}
                                                    className="bg-primary-foreground ring-transparent! size-4.5 rounded-sm [&_svg]:scale-90"
                                                />
                                                <Typography
                                                    variant={"text-sm"}
                                                    as={"p"}
                                                    className="font-[400]"
                                                >
                                                    {
                                                        "J'ai lu, compris et accepte les termes et conditions énoncés dans ce contrat et je consens à être légalement lié par ces termes et conditions en cochant cette case."
                                                    }
                                                </Typography>
                                            </Label>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        toggleDialog();
                                                    }}
                                                >
                                                    Retour
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    type="submit"
                                                    disabled={
                                                        !result.success || !result.data?.isAgree
                                                    }
                                                    onClick={() => toggleDialogCongrate()}
                                                >
                                                    Je signe
                                                </Button>
                                            </div>
                                        </div>
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
