const FR_RTF = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

export function formatRelative(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    const diffMs = date.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);

    const abs = Math.abs(diffSec);
    if (abs < 60) return FR_RTF.format(diffSec, "second");
    if (abs < 3600) return FR_RTF.format(Math.round(diffSec / 60), "minute");
    if (abs < 86400) return FR_RTF.format(Math.round(diffSec / 3600), "hour");
    if (abs < 86400 * 7) return FR_RTF.format(Math.round(diffSec / 86400), "day");
    if (abs < 86400 * 30) return FR_RTF.format(Math.round(diffSec / (86400 * 7)), "week");
    if (abs < 86400 * 365) return FR_RTF.format(Math.round(diffSec / (86400 * 30)), "month");
    return FR_RTF.format(Math.round(diffSec / (86400 * 365)), "year");
}

export function formatLongDate(iso: string | null | undefined): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatShortDate(iso: string | null | undefined): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
