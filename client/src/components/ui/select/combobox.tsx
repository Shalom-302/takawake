"use client";

import {
    Children,
    type ComponentPropsWithoutRef,
    createContext,
    isValidElement,
    type PropsWithChildren,
    type ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useCombobox, type UseComboboxProps, type UseComboboxReturnValue } from "downshift";
import { SearchLg as SearchIcon } from "@untitled-ui/icons-react";
import { PopoverRoot, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";
import { useResizeObserver } from "@/hooks/use-resize-observer";

// ------------------------------------------------------------
// Combobox
// ------------------------------------------------------------
export interface ComboboxProps extends Omit<ComboboxInputProps, "size" | "className"> {
    size?: "sm" | "md";
    items?: ComboboxItemBase[];
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    disabled?: boolean;
    inputClassName?: string;
    contentClassName?: string;
    emptyMessage?: string;
    children?: React.ReactNode;
}

export const Combobox = ({
    placeholder = "Search",
    shortcut = false,
    size = "sm",
    items = [],
    value,
    onValueChange,
    disabled = false,
    inputClassName,
    shortcutClassName,
    contentClassName,
    emptyMessage = "No results found.",
    children,
    ...props
}: ComboboxProps) => {
    const isInvalid = props["aria-invalid"] === true;
    return (
        <ComboboxRoot value={value} onValueChange={onValueChange} size={size} disabled={disabled}>
            <ComboboxInput
                placeholder={placeholder}
                shortcut={shortcut}
                shortcutClassName={shortcutClassName}
                isInvalid={isInvalid}
                className={inputClassName}
            />

            <ComboboxContent className={contentClassName}>
                <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                {children
                    ? children
                    : items.map(item => (
                          <ComboboxItem
                              key={item.value}
                              label={item.label}
                              value={item.value}
                              disabled={item.disabled}
                          />
                      ))}
            </ComboboxContent>
        </ComboboxRoot>
    );
};

// ------------------------------------------------------------
// ComboboxForm
// ------------------------------------------------------------

interface ComboboxFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<ComboboxProps, "defaultValue" | "name"> {}

export function ComboboxForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    isRequired,
    control,
    name,
    label,
    labelTooltip,
    description,
    ...comboboxProps
}: ComboboxFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => (
                <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                    name={field.name}
                    {...comboboxProps}
                />
            )}
        </FormFieldWrapper>
    );
}

// ------------------------------------------------------------
// ComboboxRoot
// ------------------------------------------------------------

export type ComboboxItemBase = {
    id?: string;
    label: string;
    value: string;
    supportingText?: string;
    disabled?: boolean;
};

export type ComboboxRootContextValue = {
    filteredItems: ComboboxItemBase[];
    items: ComboboxItemBase[];
    onItemsChange: (items: ComboboxItemBase[]) => void;
    onValueChange?: (value: string | null) => void;
    openedOnce: boolean;
    size: "sm" | "md";
    disabled?: boolean;
    popoverWidth: number;
    setPopoverWidth: (popoverWidth: number) => void;
} & Partial<
    Pick<
        UseComboboxReturnValue<ComboboxItemBase>,
        | "getInputProps"
        | "getItemProps"
        | "getMenuProps"
        | "highlightedIndex"
        | "inputValue"
        | "isOpen"
        | "selectedItem"
        | "selectItem"
        | "setInputValue"
    >
>;

export const ComboboxRootContext = createContext<ComboboxRootContextValue>({
    filteredItems: [],
    items: [],
    onItemsChange: () => {},
    openedOnce: false,
    size: "sm",
    popoverWidth: 200,
    setPopoverWidth: () => {},
});

export const useComboboxContext = () => useContext(ComboboxRootContext);

const sizes = {
    sm: {
        root: "px-3 py-2 ",
        shortcut: "pr-2",
    },
    md: {
        root: "px-3.5 py-2.5",
        shortcut: "pr-3",
    },
};

const defaultFilter = (inputValue: string, items: ComboboxItemBase[]) =>
    items.filter(
        item => !inputValue || item.label.toLowerCase().includes(inputValue.toLowerCase())
    );

const { stateChangeTypes } = useCombobox;

export type ComboboxRootProps = PropsWithChildren<{
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    filterItems?: (inputValue: string, items: ComboboxItemBase[]) => ComboboxItemBase[];
    size?: "sm" | "md";
    disabled?: boolean;
}>;

export const ComboboxRoot = ({
    value,
    onValueChange,
    filterItems = defaultFilter,
    size = "sm",
    disabled = false,
    children,
}: ComboboxRootProps) => {
    const [items, setItems] = useState<ComboboxItemBase[]>([]);
    const [filteredItems, setFilteredItems] = useState<ComboboxItemBase[]>(items);
    const [openedOnce, setOpenedOnce] = useState(false);
    const [popoverWidth, setPopoverWidth] = useState(200);

    const stateReducer = useCallback<
        NonNullable<UseComboboxProps<ComboboxItemBase>["stateReducer"]>
    >(
        (prev, { type, changes }) => {
            switch (type) {
                case stateChangeTypes.InputChange: {
                    const filteredEnabledItems = filterItems(changes.inputValue || "", items);
                    const highlightedIndex =
                        typeof changes.highlightedIndex === "number"
                            ? changes.highlightedIndex
                            : prev.highlightedIndex;
                    return {
                        ...changes,
                        highlightedIndex:
                            changes.inputValue &&
                            filteredEnabledItems.length > 0 &&
                            highlightedIndex < 0
                                ? 0
                                : changes.highlightedIndex,
                    };
                }
                case stateChangeTypes.InputBlur:
                case stateChangeTypes.InputClick:
                case stateChangeTypes.InputKeyDownEnter:
                case stateChangeTypes.InputKeyDownEscape: {
                    if (changes.isOpen || !prev.isOpen)
                        return {
                            ...changes,
                            inputValue: prev.inputValue,
                            selectedItem: prev.selectedItem,
                        };
                    if (!prev.inputValue && prev.highlightedIndex < 0)
                        return { ...changes, inputValue: "", selectedItem: null };
                    const inputValue =
                        changes.selectedItem?.label || prev.selectedItem?.label || "";
                    return { ...changes, inputValue };
                }
                default:
                    return changes;
            }
        },
        [filterItems, items]
    );

    const {
        getInputProps,
        getItemProps,
        getMenuProps,
        highlightedIndex,
        inputValue,
        isOpen,
        selectedItem,
        selectItem,
        setInputValue,
    } = useCombobox({
        items: filteredItems,
        itemToString: item => (item ? item.label : ""),
        isItemDisabled: item => item.disabled ?? false,
        selectedItem: items.find(item => item.value === value) || null,
        onSelectedItemChange: ({ selectedItem }) => onValueChange?.(selectedItem?.value || null),
        stateReducer,
    });

    useEffect(() => {
        if (isOpen && !openedOnce) setOpenedOnce(isOpen);
    }, [isOpen, openedOnce]);

    useEffect(() => {
        setFilteredItems(filterItems(inputValue, items));
    }, [filterItems, inputValue, items]);

    return (
        <ComboboxRootContext.Provider
            value={{
                filteredItems,
                getInputProps,
                getItemProps,
                getMenuProps,
                highlightedIndex,
                inputValue,
                isOpen,
                items,
                onItemsChange: setItems,
                onValueChange,
                openedOnce,
                selectedItem,
                selectItem,
                setInputValue,
                size,
                disabled,
                popoverWidth,
                setPopoverWidth,
            }}
        >
            <PopoverRoot open={isOpen}>{children}</PopoverRoot>
        </ComboboxRootContext.Provider>
    );
};

// ------------------------------------------------------------
// ComboboxInput
// ------------------------------------------------------------
export interface ComboboxInputProps
    extends Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
    placeholder?: string;
    shortcut?: boolean;
    isInvalid?: boolean;
    shortcutClassName?: string;
    className?: string;
}

export const ComboboxInput = ({
    placeholder = "Search",
    shortcut = true,
    isInvalid,
    shortcutClassName,
    className,
    ...props
}: ComboboxInputProps) => {
    const {
        getInputProps,
        inputValue,
        selectedItem,
        isOpen,
        size = "sm",
        disabled,
        setPopoverWidth,
    } = useComboboxContext();

    const first = inputValue || "";
    const last = selectedItem?.supportingText ? `${selectedItem.supportingText}` : "";

    const ref = useRef<HTMLDivElement>(null);
    const onResize = useCallback(() => {
        if (!ref.current) return;
        const divRect = ref.current?.getBoundingClientRect();
        setPopoverWidth(divRect.width);
    }, [ref, setPopoverWidth]);

    useResizeObserver({
        ref: ref,
        onResize: onResize,
        box: "border-box",
    });

    return (
        <div className="relative w-full">
            <PopoverAnchor asChild>
                <div
                    className={cn(
                        "relative h-max text-md text-primary flex w-full items-center gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset cursor-text focus-within:ring-2 focus-within:ring-brand",
                        disabled && "cursor-not-allowed bg-disabled_subtle",
                        isInvalid &&
                            "ring-error_subtle focus-within:ring-2 focus-within:ring-error",
                        isOpen && "ring-2 ring-brand",
                        sizes[size].root,
                        className
                    )}
                    ref={ref}
                >
                    <SearchIcon className="pointer-events-none size-5 text-fg-quaternary" />

                    <div className="relative flex w-full items-center gap-2">
                        {inputValue && (
                            <span
                                className="absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 gap-2 truncate"
                                aria-hidden="true"
                            >
                                <p className={cn(disabled && "text-disabled")}>{first}</p>
                                {last && (
                                    <p
                                        className={cn(
                                            "-ml-0.75 text-tertiary",
                                            disabled && "text-disabled"
                                        )}
                                    >
                                        {last}
                                    </p>
                                )}
                            </span>
                        )}

                        <input
                            {...props}
                            {...getInputProps?.({
                                placeholder,
                                disabled,
                                className:
                                    "z-10 w-full appearance-none bg-transparent text-md text-transparent caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled",
                            })}
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
            </PopoverAnchor>
        </div>
    );
};

// ------------------------------------------------------------
// ComboboxContent
// ------------------------------------------------------------
export const ComboboxContent = ({
    onOpenAutoFocus,
    children,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof PopoverContent>) => {
    const { getMenuProps, isOpen, openedOnce, onItemsChange, popoverWidth } = useComboboxContext();

    const childItems = useMemo(
        () =>
            Children.toArray(children).filter(
                (child): child is ReactElement<ComboboxItemProps> =>
                    isValidElement(child) && child.type === ComboboxItem
            ),
        [children]
    );

    useEffect(() => {
        onItemsChange?.(
            childItems.map(child => ({
                disabled: child.props.disabled,
                label: child.props.label,
                value: child.props.value,
                supportingText: child.props.supportingText,
            }))
        );
    }, [childItems, onItemsChange]);

    return (
        <PopoverContent
            {...props}
            forceMount
            asChild
            onOpenAutoFocus={e => {
                e.preventDefault();
                onOpenAutoFocus?.(e);
            }}
            className={cn(
                "p-1 max-h-80 overflow-y-auto flex flex-col gap-0.5 ",
                !isOpen && "pointer-events-none",
                !openedOnce && "hidden",
                className
            )}
            style={{ width: popoverWidth }}
            {...getMenuProps?.({}, { suppressRefError: true })}
        >
            <div>{children}</div>
        </PopoverContent>
    );
};

// ------------------------------------------------------------
// ComboboxItem
// ------------------------------------------------------------
export type ComboboxItemProps = ComboboxItemBase & ComponentPropsWithoutRef<"div">;

export const ComboboxItem = ({
    label,
    value,
    disabled,
    className,
    children,
    ...props
}: ComboboxItemProps) => {
    const { filteredItems, getItemProps, selectedItem, highlightedIndex } = useComboboxContext();

    const isSelected = selectedItem?.value === value;

    const item = useMemo(() => ({ disabled, label, value }), [disabled, label, value]);

    const index = (filteredItems || []).findIndex(
        item => item.value.toLowerCase() === value.toLowerCase()
    );

    const isHighlighted = highlightedIndex === index;

    if (index < 0) return null;

    return (
        <div
            {...props}
            data-index={index}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-primary",
                isHighlighted && "bg-primary_hover text-primary",
                isSelected && "bg-active text-primary",
                disabled && "pointer-events-none text-disabled",
                "[&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-fg-quaternary",
                className
            )}
            {...getItemProps?.({ item, index })}
        >
            {children || <span>{label}</span>}
        </div>
    );
};

// ------------------------------------------------------------
// ComboboxEmpty
// ------------------------------------------------------------
export const ComboboxEmpty = ({
    className,
    children,
    ...props
}: ComponentPropsWithoutRef<"div">) => {
    const { filteredItems } = useComboboxContext();

    if (filteredItems && filteredItems.length > 0) return null;

    return (
        <div {...props} className={cn("py-6 text-center text-sm text-tertiary", className)}>
            {children ?? "No results found."}
        </div>
    );
};
