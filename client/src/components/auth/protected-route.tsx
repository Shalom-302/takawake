"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not loading anymore and not authenticated, redirect to login
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }

        // If user has roles and allowedRoles is specified, check if user has any of the allowed roles
        if (
            !isLoading &&
            isAuthenticated &&
            allowedRoles &&
            allowedRoles.length > 0 &&
            user?.role
        ) {
            const hasAllowedRole = allowedRoles.includes(user.role.name);
            if (!hasAllowedRole) {
                // Redirect to unauthorized page or dashboard
                router.push("/unauthorized");
            }
        }
    }, [isLoading, isAuthenticated, user, router, allowedRoles]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingIndicator size="lg" />
            </div>
        );
    }

    // If not authenticated, don't render children (will redirect in useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // If roles are specified but user doesn't have required role, don't render children
    if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        user?.role &&
        !allowedRoles.includes(user.role.name)
    ) {
        return null;
    }

    // If all checks pass, render the children
    return <>{children}</>;
};
