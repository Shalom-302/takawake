import TopicsSidebar from "@/components/sections/dashboard/topics/topics-sidebar";

export default function TopicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="flex flex-col md:flex-row">
            <TopicsSidebar />
            <section className="w-full md:h-screen md:overflow-scroll">{children}</section>
        </section>
    );
}
