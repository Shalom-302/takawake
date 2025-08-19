"use client";
import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/utils/get-cropped-image";
import { cn } from "@/lib/utils/cn";

type CropperProps = {
    imageSrc: string | null;
    setCroppedImage: React.Dispatch<React.SetStateAction<File | null>>;
    aspect?: number;
    className?: string;
} & React.ComponentPropsWithRef<"div">;

export const ImageCropper = React.forwardRef<HTMLDivElement, CropperProps>(
    ({ imageSrc, setCroppedImage, aspect = 1, className }, ref) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);

        const handleCropComplete = useCallback(
            async (_: any, croppedAreaPixels: any) => {
                if (imageSrc) {
                    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
                    setCroppedImage(croppedFile);
                }
            },
            [imageSrc]
        );

        return (
            <>
                {imageSrc && (
                    <div className={cn("relative w-full h-full", className)}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    </div>
                )}
            </>
        );
    }
);
