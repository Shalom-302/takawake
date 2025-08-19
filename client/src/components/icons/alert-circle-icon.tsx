import { IconProps } from "@/lib/types/definitions";

export const AlertCircleIcon = ({ size = 20 }: IconProps) => {
    return (
        <>
            <svg
                width={size}
                height={size}
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M9.99984 14.0026V10.6693M9.99984 7.33594H10.0082M18.3332 10.6693C18.3332 15.2716 14.6022 19.0026 9.99984 19.0026C5.39746 19.0026 1.6665 15.2716 1.6665 10.6693C1.6665 6.0669 5.39746 2.33594 9.99984 2.33594C14.6022 2.33594 18.3332 6.0669 18.3332 10.6693Z"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
};
