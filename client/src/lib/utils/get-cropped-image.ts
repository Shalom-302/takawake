"use client";
// ---- Fonction pour extraire l'image croppée ----
export async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise(resolve => {
        canvas.toBlob(blob => {
            if (blob) resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
    });
}

// ---- Fonction pour charger l'image ----
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = document.createElement("img") as HTMLImageElement; // ✅ Typage explicite
        image.crossOrigin = "anonymous";
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = error => reject(error);
    });
}
