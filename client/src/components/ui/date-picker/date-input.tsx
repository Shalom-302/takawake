"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/hooks/use-locale";

type Segment = "day" | "month" | "year";

// Parsers pour différents formats de date
const getDateParsers = (dateFormat: string) => {
    const formatMap = {
        "MM/dd/yyyy": {
            segments: ["month", "day", "year"] as const,
            separators: ["/", "/"],
            placeholder: ["mm", "dd", "yyyy"],
            placeholderFocus: ["MM", "DD", "YYYY"],
        },
        "dd/MM/yyyy": {
            segments: ["day", "month", "year"] as const,
            separators: ["/", "/"],
            placeholder: ["dd", "mm", "yyyy"],
            placeholderFocus: ["DD", "MM", "YYYY"],
        },
        "dd.MM.yyyy": {
            segments: ["day", "month", "year"] as const,
            separators: [".", "."],
            placeholder: ["dd", "mm", "yyyy"],
            placeholderFocus: ["DD", "MM", "YYYY"],
        },
        "yyyy/MM/dd": {
            segments: ["year", "month", "day"] as const,
            separators: ["/", "/"],
            placeholder: ["yyyy", "mm", "dd"],
            placeholderFocus: ["YYYY", "MM", "DD"],
        },
        "yyyy. MM. dd.": {
            segments: ["year", "month", "day"] as const,
            separators: [". ", ". "],
            placeholder: ["yyyy", "mm", "dd"],
            placeholderFocus: ["YYYY", "MM", "DD"],
        },
    } as const;

    return formatMap[dateFormat as keyof typeof formatMap] || formatMap["MM/dd/yyyy"];
};

// Helper function to get days in month considering leap years
const getDaysInMonth = (month: number, year: number): number => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        return isLeapYear ? 29 : 28;
    }
    return daysInMonth[month - 1] || 31;
};

export const DateInput = ({
    value,
    onChange,
    className,
}: {
    value?: Date | undefined;
    onChange?: (date: Date | undefined) => void;
    className?: string;
}) => {
    const { dateFormat, isRTL } = useLocale();
    const parser = getDateParsers(dateFormat);

    const [segments, setSegments] = useState<Record<Segment, string>>(() => {
        if (value) {
            return {
                month: format(value, "MM"),
                day: format(value, "dd"),
                year: format(value, "yyyy"),
            };
        }
        return { month: "", day: "", year: "" };
    });

    const [focusedSegment, setFocusedSegment] = useState<Segment | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const refs = {
        month: useRef<HTMLInputElement>(null),
        day: useRef<HTMLInputElement>(null),
        year: useRef<HTMLInputElement>(null),
    };

    // Synchronisation avec la valeur externe
    useEffect(() => {
        if (!isEditing) {
            if (value) {
                setSegments({
                    month: format(value, "MM"),
                    day: format(value, "dd"),
                    year: format(value, "yyyy"),
                });
            } else {
                setSegments({ month: "", day: "", year: "" });
            }
        }
    }, [value, isEditing, dateFormat]);

    // Fonction de validation ajoutée
    const validateSegment = (segment: Segment, val: string): string => {
        const num = parseInt(val);
        if (isNaN(num)) return val;

        if (segment === "month" && val.length === 2 && (num < 1 || num > 12)) {
            return segments.month;
        }

        if (segment === "day" && val.length === 2) {
            if (num < 1) return segments.day;
            const currentMonth = parseInt(segments.month) || 1;
            const currentYear = parseInt(segments.year) || new Date().getFullYear();
            const maxDays = getDaysInMonth(currentMonth, currentYear);
            if (num > maxDays) {
                return segments.day;
            }
        }

        if (segment === "year" && val.length === 4 && num < 1000) {
            return segments.year;
        }

        return val;
    };

    const revalidateDay = (newSegments: typeof segments) => {
        if (newSegments.day && newSegments.month) {
            const day = parseInt(newSegments.day);
            const month = parseInt(newSegments.month);
            const year = parseInt(newSegments.year) || new Date().getFullYear();
            const maxDays = getDaysInMonth(month, year);
            if (day > maxDays) {
                return {
                    ...newSegments,
                    day: maxDays.toString().padStart(2, "0"),
                };
            }
        }
        return newSegments;
    };

    const handleSegmentChange = (segment: Segment, inputVal: string) => {
        setIsEditing(true);

        const cleanVal = inputVal.replace(/\D/g, "").slice(0, segment === "year" ? 4 : 2);
        const validatedVal = validateSegment(segment, cleanVal); // Utilisation de la validation ici

        let newSegments = {
            ...segments,
            [segment]: validatedVal,
        };

        if (segment === "month" || segment === "year") {
            newSegments = revalidateDay(newSegments);
        }

        setSegments(newSegments);

        if (
            validatedVal.length === (segment === "year" ? 4 : 2) &&
            validatedVal !== segments[segment]
        ) {
            setTimeout(() => {
                const segmentIndex = parser.segments.indexOf(segment);
                const nextSegment = parser.segments[segmentIndex + 1];
                if (nextSegment) {
                    refs[nextSegment]?.current?.focus();
                }
            }, 0);
        }

        if (
            newSegments.month.length === 2 &&
            newSegments.day.length === 2 &&
            newSegments.year.length === 4
        ) {
            const dateString = `${newSegments.month}/${newSegments.day}/${newSegments.year}`;
            const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());

            if (isValid(parsedDate)) {
                const reformatted = format(parsedDate, "MM/dd/yyyy");
                if (reformatted === dateString) {
                    onChange?.(parsedDate);
                    return;
                }
            }
            onChange?.(undefined);
        } else {
            onChange?.(undefined);
        }
    };

    const handleFocus = (segment: Segment) => {
        setFocusedSegment(segment);
        setIsEditing(true);
        const ref = refs[segment];
        setTimeout(() => {
            if (ref.current) {
                ref.current.select();
            }
        }, 0);
    };

    const handleBlur = () => {
        setTimeout(() => {
            const activeElement = document.activeElement;
            const isAnySegmentFocused =
                activeElement === refs.month.current ||
                activeElement === refs.day.current ||
                activeElement === refs.year.current;

            if (!isAnySegmentFocused) {
                setFocusedSegment(null);
                setIsEditing(false);
                const hasAnyValue = segments.month || segments.day || segments.year;
                const isComplete =
                    segments.month.length === 2 &&
                    segments.day.length === 2 &&
                    segments.year.length === 4;
                if (hasAnyValue && !isComplete) {
                    onChange?.(undefined);
                }
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent, segment: Segment) => {
        if (e.key === "Tab" || e.key === "Enter") return;

        const segmentIndex = parser.segments.indexOf(segment);
        const prevSegment = parser.segments[segmentIndex - 1];
        const nextSegment = parser.segments[segmentIndex + 1];

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (nextSegment) {
                refs[nextSegment]?.current?.focus();
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (prevSegment) {
                return refs[prevSegment]?.current?.focus();
            }
        } else if (e.key === "Backspace" && !segments[segment]) {
            e.preventDefault();
            if (prevSegment) {
                return refs[prevSegment]?.current?.focus();
            }
        } else if (e.key === "Delete") {
            e.preventDefault();
            handleSegmentChange(segment, "");
        }
    };

    return (
        <div
            className={cn(
                "flex items-center rounded-lg bg-primary px-2.5 py-2 text-md shadow-xs ring-1 ring-primary ring-inset focus-within:ring-2 focus-within:ring-brand",
                className
            )}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
            role="group"
            aria-label={`Date input (${dateFormat} format)`}
        >
            {parser.segments.map((segment, index) => (
                <React.Fragment key={segment}>
                    <input
                        ref={refs[segment]}
                        type="text"
                        value={segments[segment]}
                        onChange={e => handleSegmentChange(segment, e.target.value)}
                        onKeyDown={e => handleKeyDown(e, segment)}
                        onFocus={() => handleFocus(segment)}
                        onBlur={handleBlur}
                        placeholder={
                            focusedSegment === segment
                                ? parser.placeholderFocus[index]
                                : parser.placeholder[index]
                        }
                        className={cn(
                            "rounded px-0.5 text-primary tabular-nums caret-transparent focus:outline-none",
                            `w-${segment === "year" ? "12" : "8"} bg-transparent text-center selection:bg-transparent`,
                            !segments[segment] &&
                                focusedSegment !== segment &&
                                "text-placeholder uppercase",
                            focusedSegment === segment && "bg-brand-solid text-white font-medium"
                        )}
                        maxLength={segment === "year" ? 4 : 2}
                        aria-label={segment.charAt(0).toUpperCase() + segment.slice(1)}
                        inputMode="numeric"
                    />
                    {index < parser.segments.length - 1 && (
                        <span className="text-fg-quaternary mx-1" aria-hidden="true">
                            {parser.separators[index]}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
