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
        <div className="min-h-screen">
            <Navbar />
            <main className="pt-[90px] ">{children}</main>
            <Footer />
            <CookieManager />
        </div>
    );
}
