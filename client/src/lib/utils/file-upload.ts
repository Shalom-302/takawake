import { FileType, UploadedFileItemProps } from "@/components/ui/file-upload";

/**
 * Returns a human-readable file size.
 */
export const getReadableFileSize = (bytes: number, decimals: number = 1, locale: string = "en") => {
    if (bytes === 0) return "0 KB";

    const suffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);

    const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });

    return formatter.format(value) + " " + suffixes[i];
};

export const isFileTypeAccepted = (file: File, accept?: string): boolean => {
    if (!accept) return true;

    const acceptedTypes = accept.split(",").map(type => type.trim());

    return acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith(".")) {
            const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
            return extension === acceptedType.toLowerCase();
        }

        if (acceptedType.endsWith("/*")) {
            const typePrefix = acceptedType.split("/")[0];
            return file.type.startsWith(`${typePrefix}/`);
        }

        return file.type === acceptedType;
    });
};

/** Utilitaire pour créer un item de fichier avec un ID. */
export const createFileItem = (
    file: File,
    options: {
        progress?: number;
        failed?: boolean;
        type?: FileType;
    } = {}
): UploadedFileItemProps => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    progress: options.progress ?? 0,
    failed: options.failed ?? false,
    type: options.type,
    file,
});

// Fonction utilitaire pour simuler l'upload
export const simulateUploadFile = (onProgress: (progress: number) => void) => {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress === 100) {
            clearInterval(interval);
        }
    }, 100);
};

export const uploadToAPI = async (
    file: File,
    onProgress: (progress: number) => void,
    url: string
): Promise<{ url: string; id: string }> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", e => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                resolve(result);
            } else {
                reject(new Error("Upload failed"));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", url);
        xhr.send(formData);
    });
};

// Cette fonction lit un objet File et retourne son contenu en base64 ou en texte.
export const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Pour les fichiers texte, utilisez readAsText. Pour les images/binaires, readAsDataURL.
        // On utilise readAsDataURL pour l'exemple, car c'est plus universel.
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
