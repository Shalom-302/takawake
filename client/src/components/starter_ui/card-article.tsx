import * as React from "react";
import Link from "next/link";
import Typography from "./typography";
import Image from "next/image";

type CardProps = {
    title: string;
    label: string;
    redirection: string;
    illustration: string;
} & React.ComponentPropsWithRef<"div">;

const CardArticle = React.forwardRef<HTMLDivElement, CardProps>(
    ({ title, label, redirection, illustration }) => {
        return (
            <>
                <Link href={redirection}>
                    <div className="cursor-pointer">
                        <div className="h-[200px] sm:h-[240px] lg:h-[250px] w-full rounded-lg relative overflow-hidden ">
                            {illustration && (
                                <Image
                                    src={illustration}
                                    fill
                                    alt="illustration"
                                    className="object-cover"
                                />
                            )}
                            {/* illustration */}
                        </div>
                        <div className="pt-3 sm:pt-2">
                            <Typography
                                variant={"text-sm"}
                                as={"span"}
                                className="text-primary/70"
                            >
                                {label}
                            </Typography>
                            <Typography
                                variant={"text-md"}
                                as={"span"}
                                className="text-primary font-medium block line-clamp-2 "
                            >
                                {title}
                            </Typography>
                        </div>
                    </div>
                </Link>
            </>
        );
    }
);
CardArticle.displayName = "CardArticle";

export { CardArticle };
