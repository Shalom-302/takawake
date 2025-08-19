import { HomeThreeIcon } from "@/components/icons";
import Breadcrumb from "@/components/starter_ui/breadcrumb";

export default function ViewBreadcrumb() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Breadcrumb"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <Breadcrumb
                        content={[
                            { label: "Home", redirect: "/" },
                            { label: "Group", redirect: "/" },
                            { label: "Bloc", redirect: "/" },
                            { label: "Section", redirect: "/" },
                            { label: "Components", redirect: "#" },
                        ]}
                    />

                    <Breadcrumb
                        content={[
                            { label: "Home", redirect: "/" },
                            { label: "Bloc", redirect: "/" },
                            { label: "Section", redirect: "/" },
                            { label: "Components", redirect: "#" },
                        ]}
                    />

                    <Breadcrumb
                        content={[
                            {
                                label: (
                                    <>
                                        <HomeThreeIcon size={18} />
                                    </>
                                ),
                                redirect: "/",
                            },
                            { label: "Articles", redirect: "/" },
                            { label: "Frontend and Backend devs", redirect: "#" },
                        ]}
                    />
                </div>
            </section>
        </>
    );
}
