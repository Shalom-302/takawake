"use client";

import { UploadCloudTwoIcon } from "@/components/icons";
import { FileUpload } from "@/components/starter_ui/file-upload";
import { ImageUploader } from "@/components/starter_ui/upload-image";
import { useState } from "react";

export default function ViewFileUpload() {
    const [uploadFiles, setUploadFiles] = useState<Record<string, File | File[] | null>>({});

    // console.log('uploadFiles', uploadFiles)
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"File upload"}</span>
                </div>
                <div className="px-4 py-6 space-y-6">
                    <FileUpload
                        file={uploadFiles}
                        setFile={setUploadFiles}
                        multiple={true}
                        id="illustration"
                        maxFileSize={5120}
                        acceptedFileTypes={["image/jpeg", "image/png"]}
                        title={"Cliquer ou glisser-déposer pour ajouter l'image du produit "}
                        desc={"fichier PNG, JPG accepté"}
                        illustration={
                            <>
                                <div className="h-10 w-10 border border-primary/30 shadow-xs flex items-center justify-center rounded-lg relative text-primary">
                                    <div className="transition-all">
                                        <UploadCloudTwoIcon size={20} />
                                    </div>
                                </div>
                            </>
                        }
                    />

                    <div className="space-y-4">
                        <span className="text-sm block underline">{"Select one image"}</span>
                        <ImageUploader
                            name="imagePh"
                            uploadImage={uploadFiles}
                            setUploadImage={setUploadFiles}
                        />
                    </div>

                    <div className="space-y-4">
                        <span className="text-sm block underline">{"Select many images"}</span>
                        <ImageUploader
                            name="many_1"
                            uploadImage={uploadFiles}
                            setUploadImage={setUploadFiles}
                            multiple={true}
                            title="Ajouter des illustrations"
                        />
                    </div>

                    <div className="space-y-4">
                        <span className="text-sm block underline">{"Disabled field"}</span>
                        <ImageUploader
                            name="many_2"
                            uploadImage={uploadFiles}
                            setUploadImage={setUploadFiles}
                            multiple={true}
                            title="Ajouter des illustrations"
                            disabled
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
