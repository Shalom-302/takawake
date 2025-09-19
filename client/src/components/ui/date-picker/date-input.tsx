"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils/cn";

export const DateInput = ({
    value,
    onChange,
    className,
}: {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    className?: string;
}) => {
    const [segments, setSegments] = useState({
        month: value ? format(value, "MM") : "",
        day: value ? format(value, "dd") : "",
        year: value ? format(value, "yyyy") : "",
    });

    const [focusedSegment, setFocusedSegment] = useState<"month" | "day" | "year" | null>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const dayRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            setSegments({
                month: format(value, "MM"),
                day: format(value, "dd"),
                year: format(value, "yyyy"),
            });
        } else {
            setSegments({ month: "", day: "", year: "" });
        }
    }, [value]);

    const handleSegmentChange = (segment: "month" | "day" | "year", val: string) => {
        const newSegments = {
            ...segments,
            [segment]: val.replace(/\D/g, "").slice(0, segment === "year" ? 4 : 2),
        };
        setSegments(newSegments);

        if (
            newSegments.month.length === 2 &&
            newSegments.day.length === 2 &&
            newSegments.year.length === 4
        ) {
            const dateString = `${newSegments.month}/${newSegments.day}/${newSegments.year}`;
            const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());
            if (isValid(parsedDate)) {
                onChange?.(parsedDate);
            } else {
                onChange?.(null);
            }
        } else {
            onChange?.(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, segment: "month" | "day" | "year") => {
        if (e.key === "Tab" || e.key === "Enter") return;
        if (
            e.key === "ArrowRight" ||
            (e.key === "/" && segments[segment].length >= (segment === "year" ? 4 : 2))
        ) {
            e.preventDefault();
            if (segment === "month") dayRef.current?.focus();
            else if (segment === "day") yearRef.current?.focus();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (segment === "year") dayRef.current?.focus();
            else if (segment === "day") monthRef.current?.focus();
        }
    };

    return (
        <div
            className={cn(
                "flex items-center rounded-lg bg-primary px-2.5 py-2 text-md shadow-xs ring-1 ring-primary ring-inset focus-within:ring-2 focus-within:ring-brand",
                className
            )}
        >
            <input
                ref={monthRef}
                type="text"
                value={segments.month}
                onChange={e => handleSegmentChange("month", e.target.value)}
                onKeyDown={e => handleKeyDown(e, "month")}
                onFocus={() => setFocusedSegment("month")}
                onBlur={() => setFocusedSegment(null)}
                placeholder={segments.month || (focusedSegment === "month" ? "MM" : "mm")}
                className={cn(
                    "w-8 bg-transparent outline-none tabular-nums text-center",
                    "text-primary caret-transparent",
                    !segments.month && focusedSegment !== "month" && "text-placeholder",
                    focusedSegment === "month" &&
                        "bg-brand-solid text-white rounded px-1 font-medium"
                )}
                maxLength={2}
            />
            <span className="text-fg-quaternary mx-1">/</span>
            <input
                ref={dayRef}
                type="text"
                value={segments.day}
                onChange={e => handleSegmentChange("day", e.target.value)}
                onKeyDown={e => handleKeyDown(e, "day")}
                onFocus={() => setFocusedSegment("day")}
                onBlur={() => setFocusedSegment(null)}
                placeholder={segments.day || (focusedSegment === "day" ? "DD" : "dd")}
                className={cn(
                    "w-8 bg-transparent outline-none tabular-nums text-center",
                    "text-primary caret-transparent",
                    !segments.day && focusedSegment !== "day" && "text-placeholder",
                    focusedSegment === "day" && "bg-brand-solid text-white rounded px-1 font-medium"
                )}
                maxLength={2}
            />
            <span className="text-fg-quaternary mx-1">/</span>
            <input
                ref={yearRef}
                type="text"
                value={segments.year}
                onChange={e => handleSegmentChange("year", e.target.value)}
                onKeyDown={e => handleKeyDown(e, "year")}
                onFocus={() => setFocusedSegment("year")}
                onBlur={() => setFocusedSegment(null)}
                placeholder={segments.year || (focusedSegment === "year" ? "YYYY" : "yyyy")}
                className={cn(
                    "w-12 bg-transparent outline-none tabular-nums text-center",
                    "text-primary caret-transparent",
                    !segments.year && focusedSegment !== "year" && "text-placeholder",
                    focusedSegment === "year" &&
                        "bg-brand-solid text-white rounded px-1 font-medium"
                )}
                maxLength={4}
            />
        </div>
    );
};
