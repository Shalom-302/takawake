import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function DashboardTypeSelect({ value, onChange }: DashboardTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Type de tableau de bord" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="overview">Vue d'ensemble</SelectItem>
        <SelectItem value="visitors">Visiteurs</SelectItem>
        <SelectItem value="behavior">Comportement</SelectItem>
        <SelectItem value="acquisition">Acquisition</SelectItem>
        <SelectItem value="conversion">Conversion</SelectItem>
      </SelectContent>
    </Select>
  );
}
