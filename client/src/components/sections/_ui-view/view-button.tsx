import { Circle } from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ViewButton() {
    return (
        <section className="border border-neutral-200 rounded-lg">
            <div className="px-4 py-2 border-b border-neutral-200">
                <span>{"Button"}</span>
            </div>
            <div className="px-4 py-6 space-y-4 ">
                <div className=" flex flex-wrap gap-4">
                    <Button disabled>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                    <Button size={"md"} isLoading>
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button size={"lg"}>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button size={"xl"}>
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button variant={"secondary"} disabled>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                    <Button variant={"secondary"} size={"md"} isLoading>
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"secondary"} size={"lg"}>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"secondary"} size={"xl"}>
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button variant={"tertiary"} disabled>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                    <Button variant={"tertiary"} size={"md"} isLoading>
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"tertiary"} size={"lg"}>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"tertiary"} size={"xl"}>
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button variant={"primary-destructive"} disabled>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                    <Button variant={"primary-destructive"} size={"md"} isLoading>
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"primary-destructive"} size={"lg"}>
                        <Circle className="size-5" />
                        <span className="px-0.5">{"Button"}</span>
                    </Button>
                    <Button variant={"primary-destructive"} size={"xl"}>
                        <span className="px-0.5">{"Button"}</span>
                        <Circle className="size-5" />
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button variant={"link-gray"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-gray"} size={"md"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-gray"} size={"lg"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-gray"} size={"xl"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                            <Circle className="size-5" />
                        </Link>
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button variant={"link-color"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-color"} size={"md"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-color"} size={"lg"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                        </Link>
                    </Button>
                    <Button variant={"link-color"} size={"xl"} asChild>
                        <Link href="#">
                            <span className="px-0.5">{"Link"}</span>
                            <Circle className="size-5" />
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4 size">
                    <Button size={"icon-sm"} disabled>
                        <Circle className="size-5" />
                    </Button>
                    <Button size={"icon-md"} isLoading>
                        <Circle className="size-5" />
                    </Button>
                    <Button size={"icon-lg"}>
                        <Circle className="size-5" />
                    </Button>
                    <Button size={"icon-xl"}>
                        <Circle className="size-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
