"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Avatar } from "../avatar";

interface ImagePreviewProps extends Omit<React.ComponentProps<typeof Image>, "src" | "alt"> {
    file?: File;
    className?: string;
}

export const ImagePreview = ({ file, className, ...props }: ImagePreviewProps) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div className={cn("relative aspect-ratio overflow-hidden", className)}>
            {previewUrl && (
                <Image
                    src={previewUrl}
                    alt={file?.name || "image"}
                    fill
                    className="object-cover "
                    priority
                    {...props}
                />
            )}
        </div>
    );
};

export const ProfilImagePreview = ({ file, ...props }: ImagePreviewProps) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return <Avatar size="profile-lg" src={previewUrl} alt={file?.name || "image"} {...props} />;
};
