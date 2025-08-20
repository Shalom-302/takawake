"use client";

import React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card } from "@/ds/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ds/components/avatar";
import { Button } from "@/ds/components/button";
import { Badge } from "@/ds/components/badge";
import { CalendarIcon, AlertCircle, RefreshCw } from "lucide-react";

// Define variants for the savings group card
const savingsGroupCardVariants = cva(
  "w-full overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card",
        active: "bg-card border-primary",
        inactive: "bg-card opacity-80",
      },
      size: {
        default: "",
        sm: "max-w-sm",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Types for the member
export interface SavingsGroupMember {
  id: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
}

// Types for the savings group
export interface SavingsGroupCardProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof savingsGroupCardVariants> {
  title: string;
  iconUrl?: string;
  iconBgColor?: string;
  manager: {
    name: string;
    avatarUrl?: string;
    initials?: string;
  };
  members: SavingsGroupMember[];
  status?: "not-started" | "in-progress" | "completed";
  startDate?: Date;
  nextPaymentDate?: Date;
  currentRound?: number;
  totalRounds?: number;
  onDetailsClick?: () => void;
  onContributeClick?: () => void;
}

export function SavingsGroupCard({
  className,
  variant,
  size,
  title = "Savings Group",
  iconUrl,
  iconBgColor = "#6E56CF",
  manager = {
    name: "Group Manager",
    initials: "GM"
  },
  members = [],
  status = "not-started",
  startDate,
  nextPaymentDate,
  currentRound,
  totalRounds,
  onDetailsClick = () => {},
  onContributeClick = () => {},
  ...props
}: SavingsGroupCardProps) {
  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Status badge
  const renderStatusBadge = () => {
    switch (status) {
      case "not-started":
        return <Badge variant="outline">Not Started</Badge>;
      case "in-progress":
        return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    }
  };

  return (
    <Card className={cn(savingsGroupCardVariants({ variant, size }), className)} {...props}>
      <div className="p-6">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-4">
          {iconUrl ? (
            <div 
              className="w-12 h-12 rounded-md flex items-center justify-center" 
              style={{ backgroundColor: iconBgColor }}
            >
              <Image 
                src={iconUrl} 
                alt={title} 
                width={32} 
                height={32} 
              />
            </div>
          ) : (
            <div 
              className="w-12 h-12 rounded-md flex items-center justify-center" 
              style={{ backgroundColor: iconBgColor }}
            >
              <span className="text-white font-bold">{title && title.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-lg">{title}</h3>
            {renderStatusBadge()}
          </div>
        </div>

        {/* Manager section */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Group Manager</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {manager.avatarUrl && <AvatarImage src={manager.avatarUrl} alt={manager.name} />}
              <AvatarFallback>{manager.initials || manager.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{manager.name}</span>
          </div>
        </div>

        {/* Members section */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Members</p>
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                <AvatarFallback>{member.initials || member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{members.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Dates and status information */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {status === "not-started" && startDate && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(startDate)}</p>
              </div>
            </div>
          )}

          {status === "in-progress" && nextPaymentDate && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="font-medium">{formatDate(nextPaymentDate)}</p>
              </div>
            </div>
          )}

          {status === "in-progress" && currentRound !== undefined && totalRounds !== undefined && (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Current Round</p>
                <p className="font-medium">{currentRound}/{totalRounds}</p>
              </div>
            </div>
          )}

          {status === "not-started" && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">All members have not been identified yet.</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onDetailsClick}
          >
            View Details
          </Button>
          {status !== "completed" && (
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={onContributeClick}
            >
              {status === "not-started" ? "Start" : "Contribute"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
