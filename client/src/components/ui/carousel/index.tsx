"use client";

import type {
    CSSProperties,
    ComponentPropsWithRef,
    HTMLAttributes,
    KeyboardEvent,
    ReactNode,
    Ref,
} from "react";
import {
    cloneElement,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "@untitled-ui/icons-react";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: "horizontal" | "vertical";
    setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = CarouselProps & {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0];
    api: ReturnType<typeof useEmblaCarousel>[1];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    selectedIndex: number;
    scrollSnaps: number[];
};

export const CarouselContext = createContext<CarouselContextProps | null>(null);

export const useCarousel = () => {
    const context = useContext(CarouselContext);
    if (!context) {
        throw new Error("The `useCarousel` hook must be used within a <Carousel />");
    }
    return context;
};

const CarouselRoot = ({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
}: ComponentPropsWithRef<"div"> & CarouselProps) => {
    const [carouselRef, api] = useEmblaCarousel(
        {
            ...opts,
            axis: orientation === "horizontal" ? "x" : "y",
        },
        plugins
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onInit = useCallback((api: CarouselApi) => {
        if (!api) return;
        setScrollSnaps(api.scrollSnapList());
    }, []);

    const onSelect = useCallback((api: CarouselApi) => {
        if (!api) return;
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    const scrollPrev = useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        api?.scrollNext();
    }, [api]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollPrev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollNext();
            }
        },
        [scrollPrev, scrollNext]
    );

    useEffect(() => {
        if (!api || !setApi) return;
        setApi(api);
    }, [api, setApi]);

    useEffect(() => {
        if (!api) return;
        onInit(api);
        onSelect(api);
        api.on("reInit", onInit);
        api.on("reInit", onSelect);
        api.on("select", onSelect);
        return () => {
            api?.off("select", onSelect);
        };
    }, [api, onInit, onSelect]);

    return (
        <CarouselContext.Provider
            value={{
                carouselRef,
                api: api,
                opts,
                orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
                selectedIndex,
                scrollSnaps,
            }}
        >
            <div
                onKeyDownCapture={handleKeyDown}
                className={cn("relative", className)}
                role="region"
                aria-roledescription="carousel"
                {...props}
            >
                {children}
            </div>
        </CarouselContext.Provider>
    );
};

interface CarouselContentProps extends ComponentPropsWithRef<"div"> {
    className?: string;
    overflowHidden?: boolean;
}

const CarouselContent = ({ className, overflowHidden = true, ...props }: CarouselContentProps) => {
    const { carouselRef, orientation } = useCarousel();
    return (
        <div ref={carouselRef} className={cn("h-full w-full", overflowHidden && "overflow-hidden")}>
            <div
                className={cn(
                    "flex max-h-full",
                    orientation === "horizontal" ? "" : "flex-col",
                    className
                )}
                {...props}
            />
        </div>
    );
};

const CarouselItem = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
    return (
        <div
            role="group"
            aria-roledescription="slide"
            className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
            {...props}
        />
    );
};

interface TriggerRenderProps {
    isDisabled: boolean;
    onClick: () => void;
}

interface TriggerProps {
    ref?: Ref<HTMLButtonElement>;
    asChild?: boolean;
    direction: "prev" | "next";
    children: ReactNode | ((props: TriggerRenderProps) => ReactNode);
    style?: CSSProperties;
    className?: string | ((args: { isDisabled: boolean }) => string);
}

const Trigger = ({ className, children, asChild, direction, style, ...props }: TriggerProps) => {
    const { scrollPrev, canScrollNext, scrollNext, canScrollPrev } = useCarousel();
    const isDisabled = direction === "prev" ? !canScrollPrev : !canScrollNext;

    const handleClick = () => {
        if (isDisabled) return;
        if (direction === "prev") {
            scrollPrev();
        } else {
            scrollNext();
        }
    };

    const computedClassName =
        typeof className === "function" ? className({ isDisabled }) : className;
    const defaultAriaLabel = direction === "prev" ? "Previous slide" : "Next slide";

    if (typeof children === "function") {
        return <>{children({ isDisabled, onClick: handleClick })}</>;
    }

    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            onClick: handleClick,
            disabled: isDisabled,
            "aria-label": defaultAriaLabel,
            style: { ...(children.props as HTMLAttributes<HTMLElement>).style, ...style },
            className:
                [computedClassName, (children.props as HTMLAttributes<HTMLElement>).className]
                    .filter(Boolean)
                    .join(" ") || undefined,
        } as HTMLAttributes<HTMLElement>);
    }

    return (
        <button
            aria-label={defaultAriaLabel}
            disabled={isDisabled}
            className={computedClassName}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};

const CarouselPrevTrigger = (props: Omit<TriggerProps, "direction">) => (
    <Trigger {...props} direction="prev" />
);
const CarouselNextTrigger = (props: Omit<TriggerProps, "direction">) => (
    <Trigger {...props} direction="next" />
);

interface CarouselIndicatorRenderProps {
    isSelected: boolean;
    onClick: () => void;
}

interface CarouselIndicatorProps {
    index: number;
    asChild?: boolean;
    isSelected?: boolean;
    children?: ReactNode | ((props: CarouselIndicatorRenderProps) => ReactNode);
    style?: CSSProperties;
    className?: string | ((args: { isSelected: boolean }) => string);
}

const CarouselIndicator = ({
    index,
    isSelected = false,
    children,
    asChild,
    className,
    style,
}: CarouselIndicatorProps) => {
    const { api, selectedIndex } = useCarousel();
    isSelected = isSelected || selectedIndex === index;

    const handleClick = () => {
        api?.scrollTo(index);
    };
    const computedClassName =
        typeof className === "function" ? className({ isSelected }) : className;
    const defaultAriaLabel = "Go to slide" + (index + 1);

    if (typeof children === "function") {
        return <>{children({ isSelected, onClick: handleClick })}</>;
    }

    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            onClick: handleClick,
            "aria-label": defaultAriaLabel,
            "aria-current": isSelected ? "true" : undefined,
            style: { ...(children.props as HTMLAttributes<HTMLElement>).style, ...style },
            className:
                [computedClassName, (children.props as HTMLAttributes<HTMLElement>).className]
                    .filter(Boolean)
                    .join(" ") || undefined,
        } as HTMLAttributes<HTMLElement>);
    }

    return (
        <button
            aria-label={defaultAriaLabel}
            aria-current={isSelected ? "true" : undefined}
            className={computedClassName}
            onClick={handleClick}
        >
            {children}
        </button>
    );
};

interface CarouselIndicatorGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    children: ReactNode | ((props: { index: number }) => ReactNode);
    className?: string;
}

const CarouselIndicatorGroup = ({ children, ...props }: CarouselIndicatorGroupProps) => {
    const { scrollSnaps } = useCarousel();

    console.log("scrollSnaps", scrollSnaps);

    if (typeof children === "function") {
        return <nav {...props}>{scrollSnaps.map((_, index) => children({ index }))}</nav>;
    }

    return <nav {...props}>{children}</nav>;
};

// Export pour utilisations complexes
export const CarouselCustom = {
    Root: CarouselRoot,
    Content: CarouselContent,
    Item: CarouselItem,
    PrevTrigger: CarouselPrevTrigger,
    NextTrigger: CarouselNextTrigger,
    IndicatorGroup: CarouselIndicatorGroup,
    Indicator: CarouselIndicator,
};

interface SimpleCarouselProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /** Les slides du carousel */
    items: ReactNode[];
    /** Options du carousel */
    opts?: CarouselOptions;
    /** Plugins du carousel */
    plugins?: CarouselPlugin;
    /** Orientation du carousel */
    orientation?: "horizontal" | "vertical";
    /** Afficher les boutons prev/next */
    showControls?: boolean;
    /** Afficher les indicateurs */
    showIndicators?: boolean;
    /** Classe pour les contrôles */
    controlsClassName?: string;
    /** Classe pour les indicateurs */
    indicatorsClassName?: string;
    /** Classe pour chaque item */
    itemClassName?: string;
    /** Classe pour le contenu */
    contentClassName?: string;
    /** Callback quand l'API est prête */
    setApi?: (api: CarouselApi) => void;
}

export function Carousel({
    items,
    opts,
    plugins,
    orientation = "horizontal",
    showControls = true,
    showIndicators = true,
    controlsClassName,
    indicatorsClassName,
    itemClassName,
    contentClassName,
    setApi,
    className,
    ...props
}: SimpleCarouselProps) {
    return (
        <CarouselRoot
            orientation={orientation}
            opts={opts}
            plugins={plugins}
            setApi={setApi}
            className={className}
            {...props}
        >
            <CarouselContent className={contentClassName}>
                {items.map((item, i) => (
                    <CarouselItem key={i} className={itemClassName}>
                        {item}
                    </CarouselItem>
                ))}
            </CarouselContent>

            {showControls && (
                <>
                    <CarouselPrevTrigger
                        className={cn(
                            "absolute top-1/2 left-4 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-alpha-white/90 p-2 text-fg-secondary outline-focus-ring backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-fg-disabled",
                            controlsClassName
                        )}
                    >
                        <ChevronLeft className="size-5" />
                    </CarouselPrevTrigger>
                    <CarouselNextTrigger
                        className={cn(
                            "absolute top-1/2 right-4 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-alpha-white/90 p-2 text-fg-secondary outline-focus-ring backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-fg-disabled",
                            controlsClassName
                        )}
                    >
                        <ChevronRight className="size-5" />
                    </CarouselNextTrigger>
                </>
            )}

            {showIndicators && (
                <CarouselIndicatorGroup
                    className={cn(
                        "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2",
                        indicatorsClassName
                    )}
                >
                    {({ index }) => (
                        <CarouselIndicator
                            key={index}
                            index={index}
                            className={({ isSelected }) =>
                                cn(
                                    "h-2 w-2 rounded-full transition-all",
                                    isSelected ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                                )
                            }
                        />
                    )}
                </CarouselIndicatorGroup>
            )}
        </CarouselRoot>
    );
}
