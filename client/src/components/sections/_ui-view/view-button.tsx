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
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button size="md" isLoading leftIcon={<Circle />} rightIcon={<Circle />}>
                        Button
                    </Button>
                    <Button size="lg" leftIcon={<Circle />} rightIcon={<Circle />}>
                        Button
                    </Button>
                    <Button
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="secondary"
                        isDisabled
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        isLoading
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="tertiary"
                        isDisabled
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="md"
                        isLoading
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="lg"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <Button
                        variant="primary-destructive"
                        isDisabled
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="md"
                        isLoading
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="lg"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                    <Button
                        variant="primary-destructive"
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Button
                    </Button>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        isDisabled
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="md"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="lg"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-gray"
                        href="#"
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                </div>
                <div className=" flex flex-wrap gap-4">
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        isDisabled
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="md"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="lg"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                    <LinkButton
                        variant="link-destructive"
                        href="#"
                        size="xl"
                        leftIcon={<Circle data-icon />}
                        rightIcon={<Circle data-icon />}
                    >
                        Lien
                    </LinkButton>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button leftIcon={<Circle data-icon />} />
                    <Button leftIcon={<Circle data-icon />} size={"md"} />
                    <Button leftIcon={<Circle data-icon />} size={"lg"} />
                    <Button leftIcon={<Circle data-icon />} size={"xl"} />
                </div>
            </div>
        </section>
    );
}
