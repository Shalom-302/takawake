import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select/select";

interface DateRangeSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="yesterday">Hier</SelectItem>
                <SelectItem value="last7">7 derniers jours</SelectItem>
                <SelectItem value="last30">30 derniers jours</SelectItem>
                <SelectItem value="last90">90 derniers jours</SelectItem>
                <SelectItem value="year">Année en cours</SelectItem>
            </SelectContent>
        </Select>
    );
}
