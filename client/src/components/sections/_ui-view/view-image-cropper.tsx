"use client";

import { ImageCropper } from "@/components/starter_ui/image-cropper";
import Label from "@/components/starter_ui/label";
import { handleFileChange } from "@/lib/utils/handleFileChange";

import { useState } from "react";

export default function ViewImageCropper() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<File | null>(null);

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Image cropper"}</span>
                </div>
                <div className="px-4 py-6 space-y-4 mb-5">
                    <input
                        type="file"
                        accept="image/*"
                        id="field_img"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleFileChange(e, setImageSrc);
                        }}
                    />

                    <div className="h-[300px] w-full relative bg-[var(--bg-secondary)]">
                        <ImageCropper imageSrc={imageSrc} setCroppedImage={setCroppedImage} />
                    </div>
                </div>

                <div className="px-4 py-6 space-y-2">
                    <Label>{"Avec un lien https"}</Label>
                    <div className="h-[300px] w-full relative bg-[var(--bg-secondary)]">
                        <ImageCropper
                            imageSrc={
                                "https://images.unsplash.com/photo-1608476037397-7b53ace4c871"
                            }
                            setCroppedImage={setCroppedImage}
                            aspect={16 / 9}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
