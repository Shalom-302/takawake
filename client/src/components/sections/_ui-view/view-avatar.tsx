"use client";

import { Avatar, AvatarImage } from "@/components/starter_ui/avatar";
import AvatarGroup from "@/components/starter_ui/avatar-group";

export default function ViewAvatar() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Avatar"}</span>
                </div>
                <div className="px-4 py-6 flex flex-wrap gap-2">
                    <Avatar size={"xs"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            avatarFallback={"C"}
                        />
                    </Avatar>
                    <Avatar size={"sm"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            avatarFallback={"C"}
                        />
                    </Avatar>
                    <Avatar size={"md"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            avatarFallback={"+8"}
                        />
                    </Avatar>
                    <Avatar size={"lg"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            showIcon={true}
                            avatarFallback={"C"}
                        />
                    </Avatar>
                    <Avatar size={"xl"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            showIcon={true}
                            avatarFallback={"C"}
                        />
                    </Avatar>
                    <Avatar size={"2xl"}>
                        <AvatarImage
                            src="https://github.com/url.pg"
                            alt="User Avatar"
                            avatarFallback={"C"}
                        />
                    </Avatar>
                </div>

                <div className="px-4 py-6 space-y-4 space-x-4">
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"xs"}
                        maxVisible={4}
                    />
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"sm"}
                        maxVisible={4}
                    />
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"md"}
                        maxVisible={4}
                    />
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"lg"}
                        maxVisible={4}
                    />
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"xl"}
                        maxVisible={4}
                    />
                    <AvatarGroup
                        data={[
                            {
                                src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1678286742832-26543bb49959",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                            {
                                src: "https://images.unsplash.com/photo-1563237023-b1e970526dcb",
                                alt: "illustration",
                                avatarFallback: "CN",
                            },
                        ]}
                        size={"2xl"}
                        maxVisible={4}
                    />
                </div>
            </section>
        </>
    );
}
