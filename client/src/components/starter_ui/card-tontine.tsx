import { cn } from "@/lib/utils/cn";
import * as React from "react";
import { Card } from "./card";
import { Avatar, AvatarImage } from "./avatar";
import Typography from "./typography";
import ProgressBadge from "./progress-badge";
import AvatarGroup from "./avatar-group";
import { CalendarDateIcon, InfoCircleIcon, RefreshCwOneIcon } from "../icons";
import Button from "./button";


type CardProps = {
    className?: string;
    tontine_name: string;
    tontine_illustration: string;
    progression: number;
    manager:
        | {
              id: string;
              fullname: string;
              photo: string;
          }
        | {
              abreviation: string;
              photo: string;
              id: string;
              fullname: string;
          }[];
    members: {
        name: string;
        id: string;
        photo: string;
        abreviation: string;
    }[];
    areAllMembersIdentified: boolean;
    actionForDetails: () => void;
    actionToContribute: () => void;
    date: string;
    metric: null | string;
} & React.ComponentPropsWithRef<"div">;

const CardTontine = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            tontine_name,
            tontine_illustration,
            progression,
            manager,
            members,
            areAllMembersIdentified,
            metric,
            actionForDetails,
            actionToContribute,
            date,
        }
    ) => {
        const allMembers = members.map(item => ({
            src: item.photo,
            avatarFallback: item.abreviation,
            alt: "member",
            name: item?.name,
        }));

        const allManagers = Array.isArray(manager)
            ? manager.map(item => ({
                  src: item.photo,
                  avatarFallback: item.abreviation,
                  alt: "member",
              }))
            : [];

        return (
            <>
                <Card className={cn("flex flex-col justify-between gap-3", className)}>
                    <div>
                        <div className="flex items-start gap-2">
                            <div className="relative w-full flex items-center gap-2 group truncate">
                                <Avatar size={"md"}>
                                    <AvatarImage
                                        src={tontine_illustration}
                                        alt="Illustration"
                                        avatarFallback={""}
                                        showIcon={false}
                                    />
                                </Avatar>
                                <div className="text-left w-full truncate">
                                    <Typography
                                        variant={"text-sm"}
                                        as={"span"}
                                        className="font-semibold block truncate"
                                    >
                                        {tontine_name}
                                    </Typography>
                                </div>
                            </div>
                            <ProgressBadge progression={progression} />
                        </div>
                        <div className="mt-3">
                            <Typography
                                variant={"text-xs"}
                                as={"span"}
                                className="text-primary"
                            >{`Gérant de la tontine`}</Typography>
                            {Array.isArray(manager) ? (
                                manager.length < 2 ? (
                                    <div className="relative w-full flex items-center gap-2 group truncate mt-1.5">
                                        <Avatar size={"sm"}>
                                            <AvatarImage
                                                src={manager[0].photo}
                                                alt="user"
                                                avatarFallback={""}
                                                showIcon={true}
                                            />
                                        </Avatar>
                                        <div className="text-left w-full truncate">
                                            <Typography
                                                variant={"text-sm"}
                                                as={"span"}
                                                className="font-semibold block truncate"
                                            >
                                                {manager[0].fullname}
                                            </Typography>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full flex items-center gap-2 group truncate mt-1.5">
                                        <AvatarGroup
                                            data={allManagers}
                                            size={"sm"}
                                            maxVisible={4}
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="relative w-full flex items-center gap-2 group truncate mt-1.5">
                                    <Avatar size={"sm"}>
                                        <AvatarImage
                                            src={manager.photo}
                                            alt="user"
                                            avatarFallback={""}
                                            showIcon={false}
                                        />
                                    </Avatar>
                                    <div className="text-left w-full truncate">
                                        <Typography
                                            variant={"text-sm"}
                                            as={"span"}
                                            className="font-semibold block truncate"
                                        >
                                            {manager.fullname}
                                        </Typography>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <Typography
                                variant={"text-xs"}
                                as={"span"}
                                className="text-primary"
                            >{`Membres`}</Typography>
                            <div className="mt-1.5">
                                <AvatarGroup data={allMembers} size={"sm"} maxVisible={4} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-start gap-3">
                            <div className="flex-1">
                                <Typography
                                    variant={"text-xs"}
                                    as={"span"}
                                    className="text-primary"
                                >
                                    {progression === 0
                                        ? `Date de début prévue`
                                        : progression === 100
                                          ? "Date de fin"
                                          : "Prochaine cotisation"}
                                </Typography>
                                <div className="relative w-full flex items-center gap-2 group mt-1.5">
                                    <CalendarDateIcon size={20} />
                                    <div className="text-left w-full ">
                                        <Typography
                                            variant={"text-sm"}
                                            as={"span"}
                                            className="font-medium"
                                        >
                                            {date}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {progression === 100 ? (
                                <div className="flex-1">
                                    <Typography
                                        variant={"text-xs"}
                                        as={"span"}
                                        className="text-primary"
                                    >{`Nombre de cycles terminés`}</Typography>
                                    <div className="relative w-full flex items-center gap-2 group mt-1.5">
                                        <RefreshCwOneIcon size={20} />
                                        <div className="text-left w-full ">
                                            <Typography
                                                variant={"text-sm"}
                                                as={"span"}
                                                className="font-medium"
                                            >
                                                {metric}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ) : progression === 0 ? null : (
                                <div className="flex-1">
                                    <Typography
                                        variant={"text-xs"}
                                        as={"span"}
                                        className="text-primary"
                                    >{`Tour en cours`}</Typography>
                                    <div className="relative w-full flex items-center gap-2 group mt-1.5">
                                        <RefreshCwOneIcon size={20} />
                                        <div className="text-left w-full ">
                                            <Typography
                                                variant={"text-sm"}
                                                as={"span"}
                                                className="font-medium"
                                            >
                                                {metric}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!areAllMembersIdentified && (
                            <div className="mt-3">
                                <div className="flex p-2 items-center gap-1 rounded-lg border border-primary/10 bg-primary/5 text-[var(--fg-secondary)]  ">
                                    <InfoCircleIcon size={20} />
                                    <Typography
                                        variant={"text-sm"}
                                        as={"span"}
                                        className="font-medium"
                                    >{`Tous les membres n'ont pas encore été identifiés.`}</Typography>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className=" flex gap-3">
                        <Button
                            size={"sm"}
                            className="flex-1"
                            onClick={actionForDetails}
                        >
                            {"Voir les détails"}
                        </Button>
                        <Button size={"sm"} className="flex-1" onClick={actionToContribute}>
                            {progression === 100 ? "Relancer le cycle" : "Cotiser"}
                        </Button>
                    </div>
                </Card>
            </>
        );
    }
);
CardTontine.displayName = "CardTontine";

export { CardTontine };
