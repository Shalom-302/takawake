import AdminLayout from "@/components/layouts/admin-layout";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning className="scroll-smooth">
            <body>
                <AdminLayout>{children}</AdminLayout>
            </body>
        </html>
    );
}
