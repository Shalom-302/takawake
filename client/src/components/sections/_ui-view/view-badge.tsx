import Badge from "@/components/starter_ui/badge";
import ProgressBadge from "@/components/starter_ui/progress-badge";

export default function ViewBadge() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Badge"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className=" flex flex-wrap gap-2 ">
                        <Badge size={"sm"}>{"Label"}</Badge>
                        <Badge size={"md"}>
                            <div className="text-lg">&bull;</div>
                            {"Label"}
                        </Badge>
                        <Badge size={"lg"} className="pl-1.5">
                            <div className="h-4 w-4 rounded-full bg-white shrink-0"></div>
                            {"Label"}
                        </Badge>
                    </div>
                </div>
            </section>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Progress badge"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <ProgressBadge progression={0} />
                        <ProgressBadge progression={20} />
                        <ProgressBadge progression={60} />
                        <ProgressBadge progression={80} />
                        <ProgressBadge progression={100} />
                    </div>
                </div>
            </section>
        </>
    );
}
