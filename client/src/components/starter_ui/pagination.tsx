import { getVisiblePages } from "@/lib/utils/getVisiblePages";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "../icons";
import Button from "./button";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    variant?: "numbers" | "minimal"; // <- switch de style
};

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    variant = "numbers", // default style
}: PaginationProps) {
    if (variant === "minimal") {
        return (
            <div className="inline-flex items-center gap-[82px] px-[8px] py-[16px] border-t border-primary/30">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    size={"icon-sm"}
                >
                    <ChevronLeftIcon size={20} />
                </Button>

                <p className="text-[14px] text-primary font-[500]">
                    Page {currentPage} sur {totalPages}
                </p>

                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    size={"icon-sm"}
                >
                    <ChevronRightIcon size={20} />
                </Button>
            </div>
        );
    }

    // Variant = numbers
    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <div className="flex items-center justify-between px-[24px] py-[20px] border-t border-primary/30">
            <Button
                size={"sm"}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ArrowLeftIcon size={16} />
                {"Précédent"}
            </Button>

            <div className="flex items-center gap-[2px]">
                {pages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span key={`ellipsis-${index}`} className="text-primary/30 text-[14px]">
                                …
                            </span>
                        );
                    }

                    return (
                        <button
                            key={`page-${page}`}
                            onClick={() => onPageChange(page)}
                            className={`h-[40px] w-[40px] flex items-center justify-center font-[500] rounded-[8px] ${
                                currentPage === page
                                    ? "bg-primary/5 text-primary"
                                    : "text-primary/60 hover:bg-primary/5"
                            }`}
                        >
                            <span className="text-[14px]">{page}</span>
                        </button>
                    );
                })}
            </div>

            <Button
                size={"sm"}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                {"Suivant"}
                <ArrowRightIcon size={16} />
            </Button>
        </div>
    );
}
