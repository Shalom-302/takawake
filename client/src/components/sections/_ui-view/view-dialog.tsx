"use client";

import Button from "@/components/starter_ui/button";
import { Dialog } from "@/components/starter_ui/dialog";
import { DialogFile } from "@/components/starter_ui/dialog-file";
import { DialogFileSimple } from "@/components/starter_ui/dialog-file-simple";
import { useState } from "react";

export default function ViewDialog() {
    const [isDialogActive, setIsDialogActive] = useState(false);

    const toggleDialog = () => {
        setIsDialogActive(prev => !prev);
    };

    // ------
    const [isDialogFile, setIsDialogFile] = useState(false);

    const toggleFileSimpleDialog = () => {
        setIsDialogFile(prev => !prev);
    };

    // ------
    const [isDialogFileActive, setIsDialogFileActive] = useState(false);

    const toggleFileDialog = () => {
        setIsDialogFileActive(prev => !prev);
    };

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Dialog"}</span>
                </div>
                <div className="px-4 py-6">
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={toggleDialog}>
                            {"Show simple modal"}
                        </Button>
                        <Button onClick={toggleFileDialog}>
                            {"Show modal file with option"}
                        </Button>

                        <Button onClick={toggleFileSimpleDialog}>
                            {"Show modal file visualizer"}
                        </Button>
                    </div>

                    <Dialog
                        isDialogActive={isDialogActive}
                        toggleDialog={toggleDialog}
                        modalWidthValue={400}
                        isContentCentered={true}
                    >
                        <div className="h-[300px] overflow-auto m-1 ">
                            <div className="h-[600px] ">{"content here"}</div>
                        </div>
                    </Dialog>

                    <DialogFile
                        isDialogActive={isDialogFileActive}
                        toggleDialog={toggleFileDialog}
                        fileUrl={"/pdf/new-tontine-contract.pdf"}
                        toggleDialogCongrate={() => {}}
                    />

                    <DialogFileSimple
                        isDialogActive={isDialogFile}
                        toggleDialog={toggleFileSimpleDialog}
                        fileUrl={"/pdf/new-tontine-contract.pdf"}
                    />
                </div>
            </section>
        </>
    );
}
