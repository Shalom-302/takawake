import { Circle } from "@untitledui/icons";
import { Button } from "@/components/ui/buton";
import Link from "next/link";

export default function ViewButton() {
    return (
        <section className="border border-neutral-200 rounded-lg">
            <div className="px-4 py-2 border-b border-neutral-200">
                <span>{"Button"}</span>
            </div>
            <div className="px-4 py-6 space-y-4 ">
                <div className=" flex flex-wrap gap-4">
                    <Button
                        isDisabled
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        size="md"
                        isLoading
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        size="lg"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        size="xl"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="secondary"
                        isDisabled
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        isLoading
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="xl"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="tertiary"
                        isDisabled
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="md"
                        isLoading
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="lg"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="primary-destructive"
                        isDisabled
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="md"
                        isLoading
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="lg"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="xl"
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="link-gray"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-gray"
                        size="md"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-gray"
                        size="lg"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-gray"
                        size="xl"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="link-color"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-color"
                        size="md"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-color"
                        size="lg"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                    <Button
                        variant="link-color"
                        size="xl"
                        asChild
                        iconLeft={<Circle className="size-5" />}
                        iconRight={<Circle className="size-5" />}
                    >
                        <Link href="#">Button</Link>
                    </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button iconLeft={<Circle className="size-5" />} />
                    <Button iconLeft={<Circle className="size-5" />} size={"md"} />
                    <Button iconLeft={<Circle className="size-5" />} size={"lg"} />
                    <Button iconLeft={<Circle className="size-5" />} size={"xl"} />
                </div>
            </div>
        </section>
    );
}
