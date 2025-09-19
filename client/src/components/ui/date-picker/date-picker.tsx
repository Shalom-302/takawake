"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/buttons";
import { Calendar } from "@/components/ui/calendar";
import { Popover } from "@/components/ui/popover";

export function DatePicker({ ...props }) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState(props.date);

    const handleApply = () => {
        props.onDateChange(date);
        setOpen(false);
    };

    const handleCancel = () => {
        setDate(props.date);
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button
                    size="md"
                    color="secondary"
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !props.date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {props.date ? (
                        format(props.date, "PPP", { locale: fr })
                    ) : (
                        <span>Select date</span>
                    )}
                </Button>
            }
            content={
                <>
                    <div className="px-6 py-5">
                        <Calendar mode="single" selected={date} onSelect={setDate} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-secondary p-4">
                        <Button size="md" color="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button size="md" color="primary" onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                </>
            }
            contentClassName="w-auto p-0 rounded-2xl bg-primary shadow-xl ring ring-secondary_alt"
        />
    );
}
