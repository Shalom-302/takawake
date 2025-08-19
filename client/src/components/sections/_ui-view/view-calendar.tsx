"use client";
import { Calendar } from "@/components/starter_ui/calendar";
import { useState } from "react";

export default function ViewCalendar() {
    const [selected, setSelected] = useState<Date>();
    const [selectedMultiple, setSelectedMultiple] = useState<Date>();
    const [selectedRange, setSelectedRange] = useState<Date>();

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Calendar"}</span>
                </div>
                <div className="px-4 py-6 space-y-4 flex flex-wrap gap-10">
                    <div>
                        <span className="text-sm underline underline-offset-2 block mb-1">
                            {"Multiple"}
                        </span>
                        <Calendar
                            mode="multiple"
                            selectedDate={selectedMultiple}
                            setSelectedDate={setSelectedMultiple}
                        />
                    </div>

                    <div>
                        <span className="text-sm underline underline-offset-2 block mb-1">
                            {"Single"}
                        </span>
                        <Calendar
                            mode="single"
                            selectedDate={selected}
                            setSelectedDate={setSelected}
                        />
                    </div>

                    <div>
                        <span className="text-sm underline underline-offset-2 block mb-1">
                            {"Range"}
                        </span>
                        <Calendar
                            mode="range"
                            selectedDate={selectedRange}
                            setSelectedDate={setSelectedRange}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
