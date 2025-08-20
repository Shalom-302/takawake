"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ds/components/avatar";
import { UserPlus } from "lucide-react";
import { Badge } from "@/ds/components/badge";
import { Button } from "@/ds/components/button";

// Define variants for the member list
const memberListVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        default: "bg-background",
        card: "bg-card rounded-lg border border-border p-4",
        outline: "border border-border rounded-lg p-4",
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
export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
  role?: string;
  status?: "active" | "pending" | "inactive";
  email?: string;
  phone?: string;
  joinDate?: Date;
  actions?: {
    label: string;
    onClick: (memberId: string) => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }[];
}

// Types for the member list
export interface MemberListProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof memberListVariants> {
  title?: string;
  members: Member[];
  showAddMember?: boolean;
  onAddMember?: () => void;
  emptyState?: React.ReactNode;
  maxVisible?: number;
  showMoreText?: string;
  onShowMore?: () => void;
}

export function MemberList({
  className,
  variant,
  size,
  title,
  members,
  showAddMember = false,
  onAddMember,
  emptyState,
  maxVisible,
  showMoreText = "Show More",
  onShowMore,
  ...props
}: MemberListProps) {
  const visibleMembers = maxVisible ? members.slice(0, maxVisible) : members;
  const hasMoreMembers = maxVisible ? members.length > maxVisible : false;

  // Render status badge
  const renderStatusBadge = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-500">Pending</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={cn(memberListVariants({ variant, size }), className)} {...props}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">{title}</h3>
          {showAddMember && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddMember}
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Member</span>
            </Button>
          )}
        </div>
      )}

      {members.length === 0 && emptyState ? (
        <div className="py-8">{emptyState}</div>
      ) : (
        <div className="space-y-3">
          {visibleMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                  <AvatarFallback>{member.initials || member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  {member.role && <div className="text-sm text-muted-foreground">{member.role}</div>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.status && renderStatusBadge(member.status)}
                
                {member.actions && member.actions.length > 0 && (
                  <div className="flex gap-2">
                    {member.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || "ghost"}
                        size="sm"
                        onClick={() => action.onClick(member.id)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasMoreMembers && onShowMore && (
            <Button 
              variant="ghost" 
              className="w-full mt-2" 
              onClick={onShowMore}
            >
              {showMoreText} ({members.length - maxVisible!} more)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
