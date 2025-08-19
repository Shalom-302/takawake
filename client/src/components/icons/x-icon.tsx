import { IconProps } from "@/lib/types/definitions";

export const XIcon = ({ size = 24 }: IconProps) => {
    return (
        <>
            <svg
                width={size}
                height={size}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.1385 18.75L8.72419 12.458L3.19803 18.75H0.860107L7.68695 10.9793L0.860107 1.25H6.86257L11.023 7.18013L16.2358 1.25H18.5738L12.0637 8.66084L19.141 18.75H13.1385ZM15.742 16.9762H14.1681L4.20766 3.02386H5.78185L9.77107 8.61047L10.4609 9.57989L15.742 16.9762Z"
                    fill="#8A8877"
                />
            </svg>
        </>
    );
};
