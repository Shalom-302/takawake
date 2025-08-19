export const getVisiblePages = (currentPage: number, totalPages: number): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
};
