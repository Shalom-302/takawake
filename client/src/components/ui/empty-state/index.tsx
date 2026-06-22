"use client";

import type { ComponentProps, ComponentPropsWithRef, FC, ReactNode } from "react";
import { Children, createContext, isValidElement, useContext } from "react";
import { FileIcon } from "@untitledui/file-icons";
import { SearchLg } from "@untitled-ui/icons-react";
import { FeaturedIcon as FeaturedIconBase } from "@/components/icons/_old/featured-icons";
import { BackgroundPattern, type BackgroundPatternProps } from "@/components/background-patterns";
import { Illustration as Illustrations } from "@/components/illustrations";
import { cn } from "@/lib/utils/cn";

interface RootContextProps {
    size?: "sm" | "md" | "lg";
}

const RootContext = createContext<RootContextProps>({ size: "lg" });

const Root = ({ size = "lg", ...props }: ComponentPropsWithRef<"div"> & RootContextProps) => {
    return (
        <RootContext.Provider value={{ size }}>
            <div
                {...props}
                className={cn(
                    "mx-auto flex w-full max-w-lg flex-col items-center justify-center",
                    props.className
                )}
            />
        </RootContext.Provider>
    );
};

const FeaturedIcon = ({
    color = "gray",
    variant = "modern",
    icon = SearchLg,
    size = "lg",
    ...props
}: ComponentPropsWithRef<typeof FeaturedIconBase>) => {
    const { size: rootSize } = useContext(RootContext);

    return (
        <FeaturedIconBase
            {...props}
            {...{ color, variant, icon }}
            size={rootSize === "lg" ? "xl" : size}
        />
    );
};

const Illustration = ({
    type = "cloud",
    color = "gray",
    size = "lg",
    ...props
}: ComponentPropsWithRef<typeof Illustrations>) => {
    const { size: rootSize } = useContext(RootContext);

    return (
        <Illustrations
            role="img"
            {...props}
            {...{ type, color }}
            size={rootSize === "sm" ? "sm" : rootSize === "md" ? "md" : size}
            className={cn("z-10", props.className)}
        />
    );
};

interface FileTypeIconProps extends ComponentPropsWithRef<"div"> {
    type?: ComponentProps<typeof FileIcon>["type"];
    variant?: ComponentProps<typeof FileIcon>["variant"];
}

const FileTypeIcon = ({ type = "folder", variant = "solid", ...props }: FileTypeIconProps) => {
    return (
        <div
            {...props}
            className={cn(
                "relative z-10 flex rounded-full bg-linear-to-b from-gray-50 to-gray-200 p-8",
                props.className
            )}
        >
            <FileIcon type={type} variant={variant} className="size-10 drop-shadow-sm" />
        </div>
    );
};

interface HeaderProps extends ComponentPropsWithRef<"div"> {
    pattern?: "none" | BackgroundPatternProps["pattern"];
    patternSize?: "sm" | "md" | "lg";
}

const Header = ({ pattern = "circle", patternSize = "md", ...props }: HeaderProps) => {
    const { size } = useContext(RootContext);
    // Whether we are passing `Illustration` component as children.
    const hasIllustration = Children.toArray(props.children).some(
        headerChild => isValidElement(headerChild) && (headerChild.type as FC) === Illustration
    );

    return (
        <header
            {...props}
            className={cn(
                "relative mb-4",
                (size === "md" || size === "lg") && "mb-5",
                hasIllustration && size === "lg" && "mb-6!",
                props.className
            )}
        >
            {pattern !== "none" && (
                <BackgroundPattern
                    size={patternSize}
                    pattern={pattern}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            )}
            {props.children}
        </header>
    );
};

const Content = (props: ComponentPropsWithRef<"div">) => {
    const { size } = useContext(RootContext);

    return (
        <main
            {...props}
            className={cn(
                "z-10 mb-6 flex w-full max-w-88 flex-col items-center justify-center gap-1",
                (size === "md" || size === "lg") && "mb-8 gap-2",
                props.className
            )}
        />
    );
};

const Footer = (props: ComponentPropsWithRef<"div">) => {
    return <footer {...props} className={cn("z-10 flex gap-3", props.className)} />;
};

const Title = (props: ComponentPropsWithRef<"h1">) => {
    const { size } = useContext(RootContext);

    return (
        <h1
            {...props}
            className={cn(
                "text-md font-semibold text-primary",
                size === "md" && "text-lg font-semibold",
                size === "lg" && "text-xl font-semibold",
                props.className
            )}
        />
    );
};

const Description = (props: ComponentPropsWithRef<"p">) => {
    const { size } = useContext(RootContext);

    return (
        <p
            {...props}
            className={cn(
                "text-center text-sm text-tertiary",
                size === "lg" && "text-md",
                props.className
            )}
        />
    );
};

interface EmptyStateProps extends RootContextProps {
    headerIcon?: ReactNode;
    headerPattern?: "none" | BackgroundPatternProps["pattern"];
    title?: string;
    description?: string;
    footer?: ReactNode;
    children?: ReactNode;
}

const EmptyStateComponent = ({
    size,
    headerIcon,
    headerPattern,
    title,
    description,
    footer,
    children,
}: EmptyStateProps) => {
    const isSimpleMode =
        title !== undefined ||
        description !== undefined ||
        headerIcon !== undefined ||
        footer !== undefined;

    if (isSimpleMode) {
        return (
            <Root size={size}>
                {(headerIcon || headerPattern) && (
                    <Header pattern={headerPattern}>{headerIcon}</Header>
                )}
                {(title || description) && (
                    <Content>
                        {title && <Title>{title}</Title>}
                        {description && <Description>{description}</Description>}
                    </Content>
                )}
                {footer && <Footer>{footer}</Footer>}
            </Root>
        );
    }

    return <Root size={size}>{children}</Root>;
};

const EmptyState = EmptyStateComponent as typeof EmptyStateComponent & {
    Title: typeof Title;
    Header: typeof Header;
    Footer: typeof Footer;
    Content: typeof Content;
    Description: typeof Description;
    Illustration: typeof Illustration;
    FeaturedIcon: typeof FeaturedIcon;
    FileTypeIcon: typeof FileTypeIcon;
};

EmptyState.Title = Title;
EmptyState.Header = Header;
EmptyState.Footer = Footer;
EmptyState.Content = Content;
EmptyState.Description = Description;
EmptyState.Illustration = Illustration;
EmptyState.FeaturedIcon = FeaturedIcon;
EmptyState.FileTypeIcon = FileTypeIcon;

export { EmptyState };
