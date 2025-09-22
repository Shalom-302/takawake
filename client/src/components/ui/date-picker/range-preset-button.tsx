"use client";

import { cn } from "@/lib/utils/cn";

// import { cn } from "@/lib/utils/cn";
// import { Button } from "@/components/ui/buttons";

// import * as React from "react";

// export const RangePresetButton = ({
//     value,
//     range,
//     className,
//     ...props
// }: React.ComponentProps<typeof Button> & {
//     value: DateRange | undefined;
//     range: DateRange | undefined;
// }) => {
//     const isSelected =
//         range?.from?.getTime() === value?.from?.getTime() &&
//         range?.to?.getTime() === value?.to?.getTime();

//     return (
//         <Button
//             size="md"
//             color="secondary"
//             className={cn(
//                 "justify-start",
//                 isSelected && "bg-brand-solid text-white hover:bg-brand-solid_hover",
//                 className
//             )}
//             {...props}
//         />
//     );
// };

interface RangePresetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isSelected?: boolean;
}

export function RangePresetButton({
    isSelected = false,
    className,
    children,
    ...props
}: RangePresetButtonProps) {
    return (
        <button
            {...props}
            className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                isSelected
                    ? "bg-active text-secondary_hover hover:bg-secondary_hover"
                    : "text-secondary hover:bg-primary_hover hover:text-secondary_hover",
                className
            )}
        >
            {children}
        </button>
    );
}
