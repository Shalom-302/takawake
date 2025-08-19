"use client";

import DatePicker from "@/components/starter_ui/date-picker";
import Label from "@/components/starter_ui/label";
import { useState } from "react";

export default function ViewDatePicker() {
    const [selected, setSelected] = useState<Date>();
    const [selectedMultiple, setSelectedMultiple] = useState<Date>();
    const [selectedRange, setSelectedRange] = useState<Date>();

    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Date picker"}</span>
                </div>
                <div className="px-4 py-6 space-y-4 gap-10">
                    <div className="space-y-2">
                        <Label htmlFor="one">{"Select one date"}</Label>
                        <div className="max-w-[340px] ">
                            <DatePicker
                                id="one"
                                customSize="sm"
                                mode="single"
                                selectedDate={selected}
                                setSelectedDate={setSelected}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="two">{"Select range"}</Label>
                        <div className="max-w-[340px] ">
                            <DatePicker
                                id="range"
                                customSize="sm"
                                mode="range"
                                placeholder="Sélectionner une période"
                                selectedDate={selectedRange}
                                setSelectedDate={setSelectedRange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="three">{"Select multiple date"}</Label>
                        <div className="max-w-[340px] ">
                            <DatePicker
                                id="range"
                                customSize="sm"
                                mode="multiple"
                                placeholder="Sélectionner des dates"
                                selectedDate={selectedMultiple}
                                setSelectedDate={setSelectedMultiple}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
