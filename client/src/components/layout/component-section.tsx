"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ComponentSectionProps {
  id: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ComponentSection({
  id,
  title,
  description,
  children,
  className,
}: ComponentSectionProps) {
  return (
    <section id={id} className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="space-y-6">{children}</div>}
    </section>
  );
}
