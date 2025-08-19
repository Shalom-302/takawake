"use client";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage } from "./avatar";
import Button from "./button";
import { BellOneIcon, InboxOneIcon, MenuThreeIcon, XCloseIcon } from "../icons";
import { Dropdown, DropdownItem } from "./dropdown";
import Typography from "./typography";
import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tab";
import { Timeline } from "./timeline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet } from "./sheet";
// import { useLogout } from "@/lib/hooks/use-auth";
// import Cookies from "js-cookie"; // ← ici
import { useAuth } from "@/contexts/auth-context";
import authService from "@/lib/services/auth-service";

const DATAS = [
    {
        id: 1,
        illustration: (
            <div className="h-full w-full">
                <Image
                    src={"https://images.unsplash.com/photo-1438761681033-6461ffad8d80"}
                    fill
                    alt="illustration"
                    className="object-cover rounded-lg"
                />
            </div>
        ),
        content: (
            <>
                <div className="flex items-end gap-2">
                    <span className="text-[var(--text-secondary)] text-sm font-medium block">
                        {"Drew Morison"}
                    </span>
                    <span className="text-[var(--text-tertiary)] text-xs block">
                        {"Il y a 12 heures"}
                    </span>
                </div>
                <div>
                    <p className="text-sm text-[var(--text-tertiary)]">
                        {"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet"}
                    </p>
                </div>
                <ul className="mt-3 space-y-3">
                    <li>
                        <div className="flex items-center gap-3 w-full truncate">
                            <div className="h-10 w-10 relative shrink-0">
                                <Image
                                    src={"/illustrations/pdf_default.png"}
                                    fill
                                    alt="illustration"
                                    className="object-cantain"
                                />
                            </div>
                            <div className="w-full truncate">
                                <Typography
                                    variant={"text-sm"}
                                    as={"span"}
                                    className="font-medium text-[var(--text-secondary)] block truncate"
                                >
                                    {"Attestation_de_mariage.pdf"}
                                </Typography>
                                <Typography
                                    variant={"text-sm"}
                                    as={"span"}
                                    className="font-medium text-[var(--text-tertiary)]"
                                >
                                    {"720 Ko"}
                                </Typography>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center gap-3 w-full truncate">
                            <div className="h-10 w-10 relative shrink-0">
                                <Image
                                    src={"/illustrations/pdf_default.png"}
                                    fill
                                    alt="illustration"
                                    className="object-cantain"
                                />
                            </div>
                            <div className="w-full truncate">
                                <Typography
                                    variant={"text-sm"}
                                    as={"span"}
                                    className="font-medium text-[var(--text-secondary)] block truncate"
                                >
                                    {"Attestation_de_mariage.pdf"}
                                </Typography>
                                <Typography
                                    variant={"text-sm"}
                                    as={"span"}
                                    className="font-medium text-[var(--text-tertiary)]"
                                >
                                    {"720 Ko"}
                                </Typography>
                            </div>
                        </div>
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 2,
        illustration: (
            <div className="h-full w-full">
                <Image
                    src={"https://images.unsplash.com/photo-1701615004837-40d8573b6652"}
                    fill
                    alt="illustration"
                    className="object-cover rounded-lg"
                />
            </div>
        ),
        content: (
            <>
                <div className="flex items-end gap-2">
                    <span className="text-[var(--text-secondary)] text-sm font-medium block">
                        {"Drew Morison"}
                    </span>
                    <span className="text-[var(--text-tertiary)] text-xs block">
                        {"Il y a 12 heures"}
                    </span>
                </div>
                <div>
                    <p className="text-sm text-[var(--text-tertiary)]">
                        {"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet"}
                    </p>
                </div>
            </>
        ),
    },
];

const MENUS = [
    { id: 1, label: "Accueil", redirect: "/dashboard" },
    { id: 2, label: "Mes tontines", redirect: "/dashboard/tontine/all" },
    { id: 3, label: "Messages", redirect: "/dashboard/chat" },
];

function NavBar({
    className,
}: React.ComponentProps<"section"> & {
    className?: string;
}) {
    const router = useRouter();
    const { isAuthenticated, loading, getUserInfo, userInfo, clearAuth } = useAuth();

    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const toggleSheet = () => {
        setIsSheetOpen(prev => !prev);
    };

    // const { trigger: logout, isMutating } = useLogout();
    const { trigger: logout } = authService.logout();

    // console.log(" sdfvsdfv", userInfo);

    return (
        <>
            <section className="border-b border-[var(--border-secondary)] py-3 sm:py-4">
                <div className="main-container flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <div className="h-10 shrink-0 lg:hidden">
                            <Button
                                size={"icon-md"}
                                variant={"secondary"}
                                onClick={toggleSheet}
                                className="bg-transparent shrink-0 border-none shadow-none"
                            >
                                <div className="[&_svg]:scale-[130%] ">
                                    <MenuThreeIcon />
                                </div>
                            </Button>
                        </div>
                        <Link href={"/dashboard"}>
                            <div className="w-[120px] sm:w-[150px] shrink-0 h-8 relative ">
                                <Image
                                    src="/logos/logo.svg"
                                    fill
                                    className="object-contain"
                                    alt="logo"
                                />
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-2">
                        {MENUS?.map((item: { id: number; label: string; redirect: string }) => (
                            <Link key={item?.id} href={item?.redirect}>
                                <div
                                    className={cn(
                                        "p-2 border-b border-transparent"
                                        // {"border-[var(--border-button-secondary)]"}
                                    )}
                                >
                                    <Typography
                                        variant={"text-md"}
                                        as={"span"}
                                        className="font-semibold text-[var(--text-secondary)]"
                                    >
                                        {item?.label}
                                    </Typography>
                                </div>
                            </Link>
                        ))}
                    </nav>

                    <div className="sm:w-[150px] shrink-0 flex items-center justify-end gap-3">
                        <div className="h-10 relative">
                            <Button
                                size={"icon-md"}
                                variant={"secondary"}
                                className="bg-transparent shrink-0 border-none shadow-none"
                                onClick={() => router.push("/dashboard/tontine/invitations")}
                            >
                                <div className="[&_svg]:scale-125">
                                    <InboxOneIcon />
                                </div>
                            </Button>
                        </div>
                        <div className="h-10 shrink-0 sm:block hidden">
                            <Dropdown
                                dropdownTrigger={
                                    <div className="h-10">
                                        <Button
                                            size={"icon-md"}
                                            variant={"secondary"}
                                            asChild
                                            className="bg-transparent shrink-0 border-none shadow-none"
                                        >
                                            <div className="[&_svg]:scale-125">
                                                <BellOneIcon />
                                            </div>
                                        </Button>
                                    </div>
                                }
                                triggerMode="click"
                                dropdownOrigin={"right"}
                            >
                                <div className="py-5 px-6 w-auto min-w-[420px]">
                                    <div className="flex items-start justify-between gap-2 mb-5">
                                        <Typography
                                            variant={"text-lg"}
                                            as={"span"}
                                            className="font-semibold"
                                        >
                                            {"Notifications"}
                                        </Typography>
                                    </div>
                                    <Tabs defaultValue="all" className="">
                                        <TabsList display="horizontal" className="">
                                            <TabsTrigger value="all">Toutes</TabsTrigger>
                                            <TabsTrigger value="read">Lues</TabsTrigger>
                                            <TabsTrigger value="unread">Non lues</TabsTrigger>
                                        </TabsList>
                                        <TabsContent className="w-full py-4" value="all">
                                            <Timeline
                                                datas={DATAS}
                                                direction="vertical"
                                                className=""
                                            />
                                        </TabsContent>
                                        <TabsContent className="w-full py-4" value="read">
                                            ...
                                        </TabsContent>
                                        <TabsContent className="w-full py-4" value="unread">
                                            ...
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </Dropdown>
                        </div>
                        <div className="shrink-0 sm:hidden">
                            <Button
                                size={"icon-md"}
                                variant={"secondary"}
                                className="bg-transparent shrink-0 border-none shadow-none"
                            >
                                <div className="[&_svg]:scale-[120%]">
                                    <BellOneIcon />
                                </div>
                            </Button>
                        </div>
                        <div className="h-10 shrink-0">
                            <Dropdown
                                dropdownTrigger={
                                    <div className="h-10">
                                        <Avatar size={"md"}>
                                            <AvatarImage
                                                src={
                                                    userInfo?.profile_picture
                                                        ? userInfo?.profile_picture
                                                        : "/"
                                                }
                                                alt="User Avatar"
                                                avatarFallback={"C"}
                                                showIcon={userInfo?.profile_picture ? false : true}
                                            />
                                        </Avatar>
                                    </div>
                                }
                                triggerMode="click"
                                dropdownOrigin="right"
                            >
                                <div className="p-2 w-auto min-w-[220px]">
                                    {[
                                        // {id: 1, label: "Mon compte", action:() => {}},
                                        {
                                            id: 1,
                                            label: "Paramètres de comptes",
                                            action: () => {
                                                router.push("/dashboard/settings");
                                            },
                                        },
                                        {
                                            id: 2,
                                            label: "Déconnexion",
                                            action: async () => {
                                                await logout({}).then(res => {
                                                    clearAuth();
                                                    router.push("/");
                                                });
                                            },
                                        },
                                    ]?.map((el: any) => (
                                        <DropdownItem key={el?.id} asChild>
                                            <button
                                                type={"button"}
                                                onClick={el?.action}
                                                className="w-full cursor-pointer"
                                            >
                                                <span className="text-sm">{el?.label}</span>
                                            </button>
                                        </DropdownItem>
                                    ))}
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </section>

            <Sheet side="left" isOpen={isSheetOpen} onClose={toggleSheet}>
                <div className="px-4 pt-2 pb-4">
                    <Button
                        size={"icon-md"}
                        variant={"secondary"}
                        onClick={toggleSheet}
                        className="bg-transparent shrink-0 border-none shadow-none"
                    >
                        <div className="[&_svg]:scale-[130%] ">
                            <XCloseIcon />
                        </div>
                    </Button>
                    <ul className="mt-4">
                        {MENUS?.map((item: { id: number; label: string; redirect: string }) => (
                            <li key={item?.id}>
                                <Link href={item?.redirect}>
                                    <div className={cn("p-2 border-b border-transparent")}>
                                        <Typography
                                            variant={"text-md"}
                                            as={"span"}
                                            className="font-semibold text-[var(--text-secondary)]"
                                        >
                                            {item?.label}
                                        </Typography>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </Sheet>
        </>
    );
}

export default NavBar;
