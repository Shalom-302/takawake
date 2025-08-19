/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";

import "react-day-picker/style.css";

type CalendarProps = {
    selectedDate: any;
    setSelectedDate: any;
    mode?: "single" | "multiple" | "range";
};

export const Calendar: React.FC<CalendarProps> = ({
    selectedDate,
    setSelectedDate,
    mode = "single",
}) => {
    return (
        <>
            <DayPicker
                animate
                mode={mode}
                selected={selectedDate}
                onSelect={setSelectedDate}
                required={mode === "range" ? false : undefined}
                locale={fr}
                components={{
                    Chevron: props => {
                        if (props.orientation === "left") {
                            return <DefaultChevronLeftIcon />;
                        }
                        return <DefaultChevronRightIcon />;
                    },
                }}
            />
        </>
    );
};

const DefaultChevronLeftIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const DefaultChevronRightIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
