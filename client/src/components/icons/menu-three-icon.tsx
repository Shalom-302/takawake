import { IconProps } from "@/lib/types/definitions";

export const MenuThreeIcon = ({ size = 20 }: IconProps) => {
    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M3 12H21M3 6H21M3 18H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
};
