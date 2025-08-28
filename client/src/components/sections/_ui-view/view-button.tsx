"use client";
import { Circle } from "@untitled-ui/icons-react";
import { Button } from "@/components/ui/buttons/button";
import { LinkButton } from "@/components/ui/buttons/link-button";

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
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button size="md" isLoading iconLeft={<Circle />} iconRight={<Circle />}>
                        Button
                    </Button>
                    <Button size="lg" iconLeft={<Circle />} iconRight={<Circle />}>
                        Button
                    </Button>
                    <Button
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="secondary"
                        isDisabled
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        isLoading
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="tertiary"
                        isDisabled
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="md"
                        isLoading
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="lg"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="primary-destructive"
                        isDisabled
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="md"
                        isLoading
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="lg"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        isDisabled
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="md"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="lg"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        isDisabled
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="md"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="lg"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="xl"
                        iconLeft={<Circle data-icon />}
                        iconRight={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button iconLeft={<Circle data-icon />} />
                    <Button iconLeft={<Circle data-icon />} size={"md"} />
                    <Button iconLeft={<Circle data-icon />} size={"lg"} />
                    <Button iconLeft={<Circle data-icon />} size={"xl"} />
                </div>
            </div>
        </section>
    );
}
