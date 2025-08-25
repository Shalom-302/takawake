// import ProgressBadge from "@/components/ui/progress-badge";

import { Badge } from "@/components/ui/badge";

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
                            <div className="h-4 w-4 rounded-full bg-black shrink-0"></div>
                            {"Label"}
                        </Badge>
                        <Badge color="brand" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="brand" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="brand" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="error" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="error" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="error" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="warning" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="warning" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="warning" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="success" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="success" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="success" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="gray-blue" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="gray-blue" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="gray-blue" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue-light" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue-light" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue-light" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge color="blue" size={"lg"}>
                            {"Label"}
                        </Badge>
                    </div>

                    <div className=" flex flex-wrap gap-2 ">
                        <Badge variant={"badge-color"} size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="brand" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="brand" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="brand" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="error" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="error" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="error" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="warning" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="warning" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="warning" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="success" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="success" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="success" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="gray-blue" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="gray-blue" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="gray-blue" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue-light" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue-light" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue-light" size={"lg"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue" size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue" size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-color"} color="blue" size={"lg"}>
                            {"Label"}
                        </Badge>
                    </div>
                    <div className=" flex flex-wrap gap-2 ">
                        <Badge variant={"badge-modern"} size={"sm"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-modern"} size={"md"}>
                            {"Label"}
                        </Badge>
                        <Badge variant={"badge-modern"} size={"lg"}>
                            {"Label"}
                        </Badge>
                    </div>
                </div>
            </section>
        </>
    );
}
