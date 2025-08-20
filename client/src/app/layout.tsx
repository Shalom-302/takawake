import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { MessagingProvider } from "@/lib/contexts/messaging-context";
import { CookieProvider } from "@/lib/contexts/cookie-context";
import { PWAProvider } from "@/lib/contexts/pwa-context";
import CookieManager from "@/components/cookie/cookie-manager";
import { PWAWrapper } from "@/components/layouts/pwa-wrapper";
import Script from "next/script";
import "./globals.css";
import DocumentProvider from "@/lib/contexts/document-context";
import { AuditProvider } from "@/lib/contexts/audit-context";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Kaapi - Application de messagerie",
    description: "Une application de messagerie moderne avec support PWA",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Kaapi App",
    },
    themeColor: "#4F46E5",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning className="scroll-smooth">
            <head>
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="theme-color" content="#4F46E5" />
                <Script src="/pwa-register.js" strategy="afterInteractive" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AuthProvider>
                        <Toaster position="top-right" richColors />
                        <PWAProvider>
                            <MessagingProvider>
                                <CookieProvider>
                                    <CookieManager />
                                    {/* <PWAWrapper> */}
                                    {/* <DocumentProvider> */}
                                    <AuditProvider>{children}</AuditProvider>
                                    {/* </DocumentProvider> */}
                                    {/* </PWAWrapper> */}
                                </CookieProvider>
                            </MessagingProvider>
                        </PWAProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
