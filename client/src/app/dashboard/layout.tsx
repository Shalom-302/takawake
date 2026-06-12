import AdminLayout from "@/components/layouts/admin-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning className="scroll-smooth">
            <body>
                <ProtectedRoute>
                    <AdminLayout>{children}</AdminLayout>
                </ProtectedRoute>
            </body>
        </html>
    );
}
