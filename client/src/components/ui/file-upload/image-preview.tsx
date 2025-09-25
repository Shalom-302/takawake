"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ImagePreviewProps {
    file: File;
    className?: string;
}

export const ImagePreview = ({ file, className }: ImagePreviewProps) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className={cn("relative aspect-square", className)}>
            <Image
                src={previewUrl}
                alt={file.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
        </div>
    );
};
