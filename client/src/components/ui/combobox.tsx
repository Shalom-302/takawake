"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { SearchLg as SearchIcon } from "@untitled-ui/icons-react";
import {
    type ComponentProps,
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

type ComboboxData = {
    id: string;
    label: string;
    value: string;
    supportingText?: string;
    disabled?: boolean;
};

type ComboboxContextType = {
    data: ComboboxData[];
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    width: number;
    setWidth: (width: number) => void;
    size: "sm" | "md";
    disabled?: boolean;
};

const ComboboxContext = createContext<ComboboxContextType>({
    data: [],
    value: "",
    onValueChange: () => {},
    open: false,
    onOpenChange: () => {},
    width: 200,
    setWidth: () => {},
    size: "sm",
    disabled: false,
});

const sizes = {
    sm: {
        root: "h-9 px-3 text-sm",
        shortcut: "pr-2",
    },
    md: {
        root: "h-10 px-3 text-md",
        shortcut: "pr-3",
    },
};

export type ComboboxProps = ComponentProps<typeof PopoverRoot> & {
    data: ComboboxData[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: "sm" | "md";
    disabled?: boolean;
};

export const ComboboxRoot = ({
    data,
    defaultValue,
    value: controlledValue,
    onValueChange: controlledOnValueChange,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    size = "sm",
    disabled = false,
    ...props
}: ComboboxProps) => {
    const [value, onValueChange] = useControllableState({
        defaultProp: defaultValue ?? "",
        prop: controlledValue,
        onChange: controlledOnValueChange,
    });

    const [open, onOpenChange] = useControllableState({
        defaultProp: defaultOpen,
        prop: controlledOpen,
        onChange: controlledOnOpenChange,
    });

    const [width, setWidth] = useState(200);

    // Synchronize la valeur sélectionnée pour la popover
    useEffect(() => {
        // Optionnel : fermer le popover après une sélection
        if (value && data.some(item => item.id === value)) {
            onOpenChange(false);
        }
    }, [value, data, onOpenChange]);

    return (
        <ComboboxContext.Provider
            value={{
                value,
                onValueChange,
                open,
                onOpenChange,
                data,
                width,
                setWidth,
                size,
                disabled,
            }}
        >
            {/* Ajout de modal={true} pour une meilleure gestion du focus */}
            <PopoverRoot {...props} onOpenChange={onOpenChange} open={open} modal={true} />
        </ComboboxContext.Provider>
    );
};

export type ComboboxTriggerProps = {
    placeholder?: string;
    shortcut?: boolean;
    shortcutClassName?: string;
    className?: string;
};

export const ComboboxTrigger = ({
    placeholder = "Search",
    shortcut = true,
    shortcutClassName,
    className,
}: ComboboxTriggerProps) => {
    const { value, data, setWidth, onOpenChange, open, size, disabled } =
        useContext(ComboboxContext);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        // Définir la largeur initiale
        const newWidth = ref.current.offsetWidth;
        if (newWidth) {
            setWidth(newWidth);
        }

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newWidth = (entry.target as HTMLElement).offsetWidth;
                if (newWidth) {
                    setWidth(newWidth);
                }
            }
        });
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [setWidth]);

    const selectedItem = data.find(item => item.id === value);
    const label = selectedItem?.label || "";
    const supportingText = selectedItem?.supportingText || "";

    return (
        // `asChild` permet à PopoverTrigger de ne pas rendre un bouton supplémentaire
        <PopoverTrigger asChild>
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full items-center gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset cursor-text",
                    disabled && "cursor-not-allowed bg-disabled_subtle",
                    open && "ring-2 ring-brand",
                    sizes[size].root,
                    className
                )}
            >
                <SearchIcon className="pointer-events-none size-5 text-fg-quaternary" />
                {/* L'input visuel est maintenant un span, car le vrai input est dans le popover */}
                <div className="relative flex w-full items-center gap-2">
                    <span
                        className={cn(
                            "absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 gap-2 truncate",
                            !label && "text-placeholder",
                            disabled && "text-disabled"
                        )}
                        aria-hidden="true"
                    >
                        <p
                            className={cn(
                                "text-md font-medium text-primary",
                                disabled && "text-disabled"
                            )}
                        >
                            {label || placeholder}
                        </p>
                        {label && supportingText && (
                            <p
                                className={cn(
                                    "-ml-0.75 text-md text-tertiary",
                                    disabled && "text-disabled"
                                )}
                            >
                                {supportingText}
                            </p>
                        )}
                    </span>
                    {/* Un input invisible pour capturer le focus et ouvrir le popover */}
                    <input
                        type="text"
                        aria-label="Search"
                        readOnly={true} // Empêche la saisie directe, le popover gère la saisie
                        disabled={disabled}
                        className="z-10 w-full appearance-none bg-transparent text-md text-transparent caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled"
                        onFocus={() => !open && onOpenChange(true)}
                    />
                </div>

                {shortcut && (
                    <div
                        className={cn(
                            "absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8",
                            disabled && "to-bg-disabled_subtle",
                            sizes[size].shortcut,
                            shortcutClassName
                        )}
                    >
                        <span
                            className={cn(
                                "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
                                disabled && "bg-transparent text-disabled"
                            )}
                            aria-hidden="true"
                        >
                            ⌘K
                        </span>
                    </div>
                )}
            </div>
        </PopoverTrigger>
    );
};

export type ComboboxContentProps = ComponentProps<typeof Command> & {
    popoverOptions?: ComponentProps<typeof PopoverContent>;
};

export const ComboboxContent = ({ className, popoverOptions, ...props }: ComboboxContentProps) => {
    const { width } = useContext(ComboboxContext);
    return (
        <PopoverContent
            className={cn("p-0", className)}
            style={{ width }}
            align="start"
            {...popoverOptions}
        >
            <Command {...props} />
        </PopoverContent>
    );
};

export type ComboboxInputProps = ComponentProps<typeof CommandInput>;

export const ComboboxInput = (props: ComboboxInputProps) => {
    // Le vrai input pour la recherche
    return (
        <CommandInput
            className="h-9 px-3 text-sm ring-inset placeholder:text-placeholder focus:outline-none"
            {...props}
        />
    );
};

export type ComboboxListProps = ComponentProps<typeof CommandList>;
export const ComboboxList = (props: ComboboxListProps) => <CommandList {...props} />;

export type ComboboxEmptyProps = ComponentProps<typeof CommandEmpty>;
export const ComboboxEmpty = ({ children, ...props }: ComboboxEmptyProps) => (
    <CommandEmpty {...props}>{children ?? "No results found."}</CommandEmpty>
);

export type ComboboxGroupProps = ComponentProps<typeof CommandGroup>;
export const ComboboxGroup = (props: ComboboxGroupProps) => <CommandGroup {...props} />;

export type ComboboxItemProps = ComponentProps<typeof CommandItem>;
export const ComboboxItem = (props: ComboboxItemProps) => {
    const { onValueChange, onOpenChange, value } = useContext(ComboboxContext);
    const isSelected = value === props.value;
    return (
        <CommandItem
            onSelect={currentValue => {
                onValueChange(currentValue);
                onOpenChange(false);
            }}
            {...props}
        >
            {props.children}
            {/* Visuel pour l'élément sélectionné */}
            {isSelected && <span className="ml-auto">✓</span>}
        </CommandItem>
    );
};

export type ComboboxSeparatorProps = ComponentProps<typeof CommandSeparator>;
export const ComboboxSeparator = (props: ComboboxSeparatorProps) => <CommandSeparator {...props} />;

export interface SimpleComboBoxProps {
    placeholder?: string;
    shortcut?: boolean;
    size?: "sm" | "md";
    items?: ComboboxData[];
    value?: string;
    onValueChange?: (value: string) => void;
    label?: string;
    hint?: string;
    tooltip?: string;
    isRequired?: boolean;
    isInvalid?: boolean;
    disabled?: boolean;
    popoverClassName?: string;
    shortcutClassName?: string;
    emptyMessage?: string;
    children?: ReactNode;
}

export const ComboBox = ({
    placeholder = "Search",
    shortcut = true,
    size = "sm",
    items = [],
    value,
    onValueChange,
    disabled = false,
    popoverClassName,
    shortcutClassName,
    emptyMessage = "No results found.",
    children,
}: SimpleComboBoxProps) => {
    return (
        <div className="flex flex-col gap-1.5">
            <ComboboxRoot
                data={items}
                value={value}
                onValueChange={onValueChange}
                size={size}
                disabled={disabled}
            >
                <ComboboxTrigger
                    placeholder={placeholder}
                    shortcut={shortcut}
                    shortcutClassName={shortcutClassName}
                />

                <ComboboxContent popoverOptions={{ className: popoverClassName }}>
                    <Command className="h-full max-h-[300px] w-full rounded-md">
                        {/* C'est ici que l'input de recherche doit être ! */}
                        <ComboboxInput placeholder={placeholder} />
                        <ComboboxList>
                            <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                            <ComboboxGroup>
                                {children
                                    ? children
                                    : items.map(item => (
                                          <ComboboxItem
                                              key={item.id}
                                              value={item.id}
                                              disabled={item.disabled}
                                          >
                                              <span className="flex-1">{item.label}</span>
                                              {item.supportingText && (
                                                  <span className="text-tertiary text-sm">
                                                      {item.supportingText}
                                                  </span>
                                              )}
                                          </ComboboxItem>
                                      ))}
                            </ComboboxGroup>
                        </ComboboxList>
                    </Command>
                </ComboboxContent>
            </ComboboxRoot>
        </div>
    );
};
