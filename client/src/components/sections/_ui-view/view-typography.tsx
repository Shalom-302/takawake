"use client";

import Typography from "@/components/starter_ui/typography";

// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import AvatarGroup from "@/components/ui/avatar-group";
// import Typography from "@/components/ui/typography";

export default function ViewTypography() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Typography"}</span>
                </div>
                <div className="px-4 py-6 ">
                    <Typography variant={"display-2xl"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"display-xl"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"display-lg"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"display-md"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"display-sm"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"display-xs"} as={"h1"} className="">
                        {"Mon texte ici"}
                    </Typography>

                    <Typography variant={"text-xl"} as={"p"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"text-lg"} as={"p"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"text-md"} as={"p"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"text-sm"} as={"p"} className="">
                        {"Mon texte ici"}
                    </Typography>
                    <Typography variant={"text-xs"} as={"p"} className="">
                        {"Mon texte ici"}
                    </Typography>
                </div>
            </section>
        </>
    );
}
