import Link, { LinkProps } from "next/link";
import { Button, ButtonProps } from "./button";

type LinkButtonProps = LinkProps & ButtonProps & { children: React.ReactNode };

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
    return (
        <Button asChild {...props}>
            <Link href={href}>{children}</Link>
        </Button>
    );
}
