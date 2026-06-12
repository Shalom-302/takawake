import Link, { LinkProps } from "next/link";
import { Button, LinkProps as ButtonLinkProps } from "./button";

type LinkButtonProps = LinkProps & ButtonLinkProps;

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
    return (
        <Button asChild {...props}>
            <Link href={href}>{children}</Link>
        </Button>
    );
}
