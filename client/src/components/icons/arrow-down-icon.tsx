import { IconProps } from "@/lib/types/definitions";

export const ArrowDownIcon = ({ size = 20 }: IconProps) => {
    return (
        <>
            <svg
                width={size}
                height={size}
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6.75 3.16797V10.168M6.75 10.168L10.25 6.66797M6.75 10.168L3.25 6.66797"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
};
