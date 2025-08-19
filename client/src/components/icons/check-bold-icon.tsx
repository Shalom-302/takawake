import { IconProps } from "@/lib/types/definitions";

export const CheckBoldIcon = ({ size = 20 }: IconProps) => {
    return (
        <>
            <svg
                width={size}
                height={size}
                viewBox="0 0 11 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.24709 1.15838L3.28042 6.91672L1.69709 5.22505C1.40542 4.95005 0.947086 4.93338 0.613753 5.16672C0.288753 5.40839 0.197086 5.83338 0.397086 6.17505L2.27209 9.22505C2.45542 9.50838 2.77209 9.68339 3.13042 9.68339C3.47209 9.68339 3.79709 9.50838 3.98042 9.22505C4.28042 8.83338 10.0054 2.00838 10.0054 2.00838C10.7554 1.24172 9.84708 0.566718 9.24709 1.15005V1.15838Z"
                    fill="currentColor"
                />
            </svg>
        </>
    );
};
