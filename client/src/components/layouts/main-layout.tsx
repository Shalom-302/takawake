"use client";

import { ReactNode } from "react";
import Navbar from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import CookieManager from "@/components/cookie/cookie-manager";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
            <CookieManager />
        </div>
    );
}
