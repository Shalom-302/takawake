export function formatDateToFrench(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };

    return date.toLocaleDateString("fr-FR", options);
}
