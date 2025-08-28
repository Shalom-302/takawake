"use client";

import React, { useRef, useEffect, useState } from "react";
import { XCloseIcon, ImagePlusIcon } from "../icons";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

type ImageUploaderProps = {
    tite?: string;
    subtitle?: string;
    name: string;
    uploadImage: Record<string, File | File[] | null>;
    setUploadImage: React.Dispatch<React.SetStateAction<Record<string, File | File[] | null>>>;
    // label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    name,
    uploadImage,
    setUploadImage,
    // label,
    multiple,
    title = "Ajouter une image",
    subtitle = "Cliquez ici pour procéder au choix",
    ...inputProps
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const files = uploadImage[name];
        if (!files) {
            setPreviews([]);
            return;
        }

        const fileArray = Array.isArray(files) ? files : [files];
        const readers = fileArray.map(
            file =>
                new Promise<string>(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(readers).then(setPreviews);
    }, [uploadImage, name]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        setUploadImage(prev => {
            const current = prev[name];
            if (multiple) {
                const existingFiles = Array.isArray(current) ? current : current ? [current] : [];
                const newFiles = [...existingFiles, ...fileArray];
                return { ...prev, [name]: newFiles };
            } else {
                return { ...prev, [name]: fileArray[0] };
            }
        });
    };

    const handleRemove = (index: number | null = null) => {
        setUploadImage(prev => {
            const current = prev[name];
            if (!current) return { ...prev, [name]: null };

            if (Array.isArray(current)) {
                if (index === null) return { ...prev, [name]: null }; // remove all
                const updated = current.filter((_, i) => i !== index);
                return { ...prev, [name]: updated.length ? updated : null };
            }

            return { ...prev, [name]: null };
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col items-start gap-3">
            {/* <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id={`upload-${name}`}
        className="hidden"
        multiple={multiple}
        onChange={handleFileChange}
        {...inputProps}
      /> */}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                id={`upload-${name}`}
                className="hidden peer"
                multiple={multiple}
                onChange={handleFileChange}
                disabled={inputProps.disabled}
                {...inputProps}
            />

            {previews.length === 0 ? (
                <>
                    <label
                        htmlFor={`upload-${name}`}
                        className="flex items-center gap-3 cursor-pointer peer-disabled:cursor-not-allowed"
                    >
                        <div
                            className={cn(
                                "cursor-pointer shrink-0 relative h-16 w-16 flex items-center justify-center",
                                "bg-primary text-white rounded-lg",
                                {
                                    "bg-primary/10 text-primary/60": inputProps.disabled,
                                }
                            )}
                        >
                            <ImagePlusIcon />
                        </div>
                        <div>
                            <span className="text-sm text-primary font-medium ">{title}</span>
                            <p className="text-sm text-primary/60 ">{subtitle}</p>
                        </div>
                    </label>
                </>
            ) : (
                <div
                    className={cn("flex items-center gap-3", {
                        "flex-col items-start": multiple === true,
                    })}
                >
                    <div className="flex flex-wrap gap-3">
                        {previews.map((src, i) => (
                            <div key={i} className="relative h-16 w-16 shrink-0">
                                <Image
                                    src={src}
                                    alt={`Aperçu ${i}`}
                                    fill
                                    className="absolute w-full h-full rounded-lg object-cover"
                                />
                                <button
                                    onClick={() => handleRemove(i)}
                                    type="button"
                                    className="cursor-pointer absolute -top-1.5 -right-1.5 h-5 w-5 ring-2 ring-white bg-primary text-white rounded-full flex items-center justify-center"
                                >
                                    <XCloseIcon size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <label
                        htmlFor={`upload-${name}`}
                        className={cn("text-sm text-primary cursor-pointer font-medium", {
                            "flex items-center gap-2 bg-primary text-white p-2 rounded-lg ":
                                multiple === true,
                        })}
                    >
                        {multiple && <ImagePlusIcon size={18} />}
                        {multiple ? "Ajouter des images" : "Changer l'image"}
                    </label>
                </div>
            )}
        </div>
    );
};
