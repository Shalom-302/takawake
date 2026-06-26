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
                {/* Back-office réservé aux admins : un lecteur connecté est
                    redirigé. L'inscription publique ne crée jamais d'admin. */}
                <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout>{children}</AdminLayout>
                </ProtectedRoute>
            </body>
        </html>
    );
}
