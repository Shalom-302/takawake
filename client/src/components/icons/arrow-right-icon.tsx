import { IconProps } from "@/lib/types/definitions";

export const ArrowRightIcon = ({ size = 20 }: IconProps) => {
    return (
        <>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
};
