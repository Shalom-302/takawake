"use client";

import {
    Children,
    type ComponentPropsWithoutRef,
    createContext,
    isValidElement,
    type KeyboardEvent,
    type PropsWithChildren,
    type ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useCombobox, useMultipleSelection } from "downshift";
import { SearchLg as SearchIcon } from "@untitled-ui/icons-react";
import { PopoverRoot, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";
import { useResizeObserver } from "@/lib/hooks/use-resize-observer";
import { Tag } from "@/components/ui/tags";

// ------------------------------------------------------------
//  MultiSelect
// ------------------------------------------------------------
export interface MultiSelectProps extends Omit<MultiSelectInputProps, "size" | "className"> {
    size?: "sm" | "md";
    items?: MultiSelectItemBase[];
    value?: string[];
    onValueChange?: (values: string[]) => void;
    disabled?: boolean;
    inputClassName?: string;
    contentClassName?: string;
    emptyMessage?: string;
    children?: React.ReactNode;
}

export const MultiSelect = ({
    placeholder = "Search",
    shortcut = false,
    size = "sm",
    items = [],
    value = [],
    onValueChange,
    disabled = false,
    inputClassName,
    shortcutClassName,
    contentClassName,
    emptyMessage = "No results found.",
    children,
    ...props
}: MultiSelectProps) => {
    const isInvalid = props["aria-invalid"] === true;
    return (
        <MultiSelectRoot
            value={value}
            onValueChange={onValueChange}
            size={size}
            disabled={disabled}
        >
            <MultiSelectInput
                placeholder={placeholder}
                shortcut={shortcut}
                isInvalid={isInvalid}
                shortcutClassName={shortcutClassName}
                className={inputClassName}
            />

            <MultiSelectContent className={contentClassName}>
                <MultiSelectEmpty>{emptyMessage}</MultiSelectEmpty>
                {children
                    ? children
                    : items.map(item => (
                          <MultiSelectItem
                              key={item.id}
                              id={item.id}
                              label={item.label}
                              value={item.value}
                              supportingText={item.supportingText}
                              avatarUrl={item.avatarUrl}
                              disabled={item.disabled}
                          />
                      ))}
            </MultiSelectContent>
        </MultiSelectRoot>
    );
};

// ------------------------------------------------------------
// MultiSelectForm
// ------------------------------------------------------------

interface MultiSelectFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<MultiSelectProps, "defaultValue" | "name"> {}

export function MultiSelectForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    isRequired,
    control,
    name,
    label,
    labelTooltip,
    description,
    ...multiSelectProps
}: MultiSelectFormProps<TFieldValues, TName>) {
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
                <MultiSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                    name={field.name}
                    {...multiSelectProps}
                />
            )}
        </FormFieldWrapper>
    );
}

// ------------------------------------------------------------
// MultiSelectRoot
// ------------------------------------------------------------

export type MultiSelectItemBase = {
    id: string;
    label: string;
    value: string;
    supportingText?: string;
    avatarUrl?: string;
    disabled?: boolean;
};

export type MultiSelectRootContextValue = {
    // Obligatoires
    filteredItems: MultiSelectItemBase[];
    items: MultiSelectItemBase[];
    selectedItems: MultiSelectItemBase[];
    onItemsChange: (items: MultiSelectItemBase[]) => void;
    onValueChange?: (values: string[]) => void;
    openedOnce: boolean;
    size: "sm" | "md";
    disabled?: boolean;
    popoverWidth: number;
    setPopoverWidth: (popoverWidth: number) => void;

    // Actions multi-selection
    removeSelectedItem: (item: MultiSelectItemBase) => void;
    addSelectedItem: (item: MultiSelectItemBase) => void;

    // Downshift combobox
    getInputProps: ReturnType<typeof useCombobox>["getInputProps"];
    getItemProps: ReturnType<typeof useCombobox>["getItemProps"];
    getMenuProps: ReturnType<typeof useCombobox>["getMenuProps"];
    getDropdownProps: ReturnType<typeof useMultipleSelection>["getDropdownProps"];

    // État
    activeIndex: number;
    isOpen: boolean;
    inputValue: string;
    highlightedIndex: number;
};

export const MultiSelectRootContext = createContext<MultiSelectRootContextValue>(
    {} as MultiSelectRootContextValue
);

export const useMultiSelectContext = () => useContext(MultiSelectRootContext);

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

const defaultFilter = (
    inputValue: string,
    items: MultiSelectItemBase[],
    selectedItems: MultiSelectItemBase[]
) =>
    items.filter(
        item =>
            !selectedItems.some(selected => selected.id === item.id) &&
            (!inputValue ||
                item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                item.supportingText?.toLowerCase().includes(inputValue.toLowerCase()))
    );

export type MultiSelectRootProps = PropsWithChildren<{
    value?: string[];
    onValueChange?: (values: string[]) => void;
    filterItems?: (
        inputValue: string,
        items: MultiSelectItemBase[],
        selectedItems: MultiSelectItemBase[]
    ) => MultiSelectItemBase[];
    size?: "sm" | "md";
    disabled?: boolean;
}>;

export const MultiSelectRoot = ({
    value = [],
    onValueChange,
    filterItems = defaultFilter,
    size = "sm",
    disabled = false,
    children,
}: MultiSelectRootProps) => {
    const [items, setItems] = useState<MultiSelectItemBase[]>([]);
    const [filteredItems, setFilteredItems] = useState<MultiSelectItemBase[]>([]);
    const [openedOnce, setOpenedOnce] = useState(false);
    const [popoverWidth, setPopoverWidth] = useState(200);
    const [inputValue, setInputValue] = useState("");

    // Compute selected items from value prop
    const selectedItems = useMemo(() => {
        return items.filter(item => value.includes(item.id));
    }, [items, value]);

    // // Multiple selection hook
    const { getDropdownProps, activeIndex } = useMultipleSelection({
        selectedItems,
        onSelectedItemsChange: ({ selectedItems: newSelectedItems }) => {
            onValueChange?.(newSelectedItems?.map(item => item.id) || []);
        },
    });

    const handleRemoveSelectedItem = useCallback(
        (item: MultiSelectItemBase) => {
            onValueChange?.(selectedItems.filter(i => i.id !== item.id).map(i => i.id));
        },
        [onValueChange, selectedItems]
    );

    const handleAddSelectedItem = useCallback(
        (item: MultiSelectItemBase) => {
            if (!selectedItems.some(i => i.id === item.id)) {
                onValueChange?.([...selectedItems.map(i => i.id), item.id]);
            }
        },
        [onValueChange, selectedItems]
    );

    // MultiSelect hook
    const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
        items: filteredItems,
        itemToString: item => (item ? item.label : ""),
        selectedItem: null,
        stateReducer: (state, actionAndChanges) => {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true, // keep menu open after selection
                        highlightedIndex: state.highlightedIndex,
                        inputValue: "", // clear input after selection
                    };
                default:
                    return changes;
            }
        },
        onStateChange: ({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) => {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    if (newSelectedItem) {
                        handleAddSelectedItem(newSelectedItem);
                        setInputValue("");
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange:
                    setInputValue(newInputValue || "");
                    break;
                default:
                    break;
            }
        },
    });

    useEffect(() => {
        if (isOpen && !openedOnce) setOpenedOnce(isOpen);
    }, [isOpen, openedOnce]);

    useEffect(() => {
        setFilteredItems(filterItems(inputValue, items, selectedItems));
    }, [filterItems, inputValue, items, selectedItems]);

    return (
        <MultiSelectRootContext.Provider
            value={{
                filteredItems,
                items,
                selectedItems,
                onItemsChange: setItems,
                onValueChange,
                openedOnce,
                size,
                disabled,
                popoverWidth,
                setPopoverWidth,
                getInputProps,
                getItemProps,
                getMenuProps,
                getDropdownProps,
                removeSelectedItem: handleRemoveSelectedItem,
                addSelectedItem: handleAddSelectedItem,
                activeIndex,
                isOpen,
                inputValue,
                highlightedIndex,
            }}
        >
            <PopoverRoot open={isOpen}>{children}</PopoverRoot>
        </MultiSelectRootContext.Provider>
    );
};

// ------------------------------------------------------------
// MultiSelectInput
// ------------------------------------------------------------
export type MultiSelectInputProps = {
    placeholder?: string;
    shortcut?: boolean;
    isInvalid?: boolean;
    shortcutClassName?: string;
    className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange">;

export const MultiSelectInput = ({
    placeholder = "Search",
    shortcut = true,
    isInvalid,
    shortcutClassName,
    className,
    ...props
}: MultiSelectInputProps) => {
    const {
        getInputProps,
        getDropdownProps,
        selectedItems,
        removeSelectedItem,
        activeIndex,
        isOpen,
        size = "sm",
        disabled,
        setPopoverWidth,
    } = useMultiSelectContext();

    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleTagKeyDown = useCallback(
        (event: KeyboardEvent, item: MultiSelectItemBase, index: number) => {
            if (event.key === "Tab") {
                return;
            }

            event.preventDefault();

            switch (event.key) {
                case " ":
                case "Enter":
                case "Backspace":
                    removeSelectedItem(item);
                    // Focus input after removing item
                    setTimeout(() => inputRef.current?.focus(), 0);
                    break;
                case "ArrowLeft":
                    // Focus previous tag or input if first tag
                    if (index === 0) {
                        inputRef.current?.focus();
                    }
                    break;
                case "ArrowRight":
                    // Focus next tag or input if last tag
                    if (index === selectedItems.length - 1) {
                        inputRef.current?.focus();
                    }
                    break;
            }
        },
        [removeSelectedItem, selectedItems.length]
    );

    const handleInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            const isCaretAtStart =
                event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0;

            if (!isCaretAtStart && event.currentTarget.value !== "") {
                return;
            }

            if (event.key === "Backspace" && selectedItems.length > 0) {
                removeSelectedItem(selectedItems[selectedItems.length - 1]);
            }
        },
        [removeSelectedItem, selectedItems]
    );

    return (
        <div className="relative w-full" ref={ref}>
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
                    {...getDropdownProps()}
                >
                    <SearchIcon className="pointer-events-none size-5 text-fg-quaternary flex-shrink-0" />

                    <div className="relative flex w-full flex-wrap items-center gap-1.5">
                        {/* Selected items using Tag component */}
                        {selectedItems.map((item, index) => (
                            <Tag
                                key={item.id}
                                id={item.id}
                                avatarSrc={item.avatarUrl}
                                isDisabled={disabled}
                                onClose={() => removeSelectedItem(item)}
                                className={cn(
                                    "max-w-[180px]",
                                    activeIndex === index && "ring-2 ring-brand"
                                )}
                                tabIndex={-1}
                                onKeyDown={e => handleTagKeyDown(e, item, index)}
                            >
                                <span className="truncate">{item.label}</span>
                            </Tag>
                        ))}

                        {/* Input */}
                        <div className="relative flex min-w-[120px] flex-1 items-center">
                            <input
                                ref={inputRef}
                                {...props}
                                {...getInputProps({
                                    placeholder: selectedItems.length === 0 ? placeholder : "",
                                    disabled,
                                    onKeyDown: handleInputKeyDown,
                                    className:
                                        "w-full appearance-none bg-transparent text-md text-primary caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled",
                                })}
                            />

                            {shortcut && selectedItems.length === 0 && (
                                <div
                                    className={cn(
                                        "absolute right-0 flex items-center",
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
                    </div>
                </div>
            </PopoverAnchor>
        </div>
    );
};

// ------------------------------------------------------------
// MultiSelectContent
// ------------------------------------------------------------
export const MultiSelectContent = ({
    onOpenAutoFocus,
    children,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof PopoverContent>) => {
    const { getMenuProps, isOpen, openedOnce, onItemsChange, popoverWidth } =
        useMultiSelectContext();

    const childItems = useMemo(
        () =>
            Children.toArray(children).filter(
                (child): child is ReactElement<MultiSelectItemProps> =>
                    isValidElement(child) && child.type === MultiSelectItem
            ),
        [children]
    );

    useEffect(() => {
        onItemsChange?.(
            childItems.map(child => ({
                id: child.props.id,
                disabled: child.props.disabled,
                label: child.props.label,
                value: child.props.value,
                supportingText: child.props.supportingText,
                avatarUrl: child.props.avatarUrl,
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
                "p-1 max-h-80 overflow-y-auto flex flex-col gap-0.5",
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
// MultiSelect Item
// ------------------------------------------------------------
export type MultiSelectItemProps = MultiSelectItemBase & ComponentPropsWithoutRef<"div">;

export const MultiSelectItem = ({
    id,
    label,
    value,
    supportingText,
    avatarUrl,
    disabled,
    className,
    children,
    ...props
}: MultiSelectItemProps) => {
    const { filteredItems, getItemProps, highlightedIndex } = useMultiSelectContext();

    const item = useMemo(
        () => ({ id, disabled, label, value, supportingText, avatarUrl }),
        [id, disabled, label, value, supportingText, avatarUrl]
    );

    const index = (filteredItems || []).findIndex(filteredItem => filteredItem.id === id);

    const isHighlighted = highlightedIndex === index;

    if (index < 0) return null;

    return (
        <div
            {...props}
            data-index={index}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-primary gap-2",
                isHighlighted && "bg-primary_hover text-primary",
                disabled && "pointer-events-none text-disabled",
                "[&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-fg-quaternary",
                className
            )}
            {...getItemProps?.({ item, index })}
        >
            {children || (
                <>
                    {avatarUrl && <Avatar size="xs" alt={label} src={avatarUrl} />}
                    <div className="flex-1">
                        <span className="block">{label}</span>
                        {supportingText && (
                            <span className="text-xs text-tertiary">{supportingText}</span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ------------------------------------------------------------
// MultiSelect Empty
// ------------------------------------------------------------
export const MultiSelectEmpty = ({
    className,
    children,
    ...props
}: ComponentPropsWithoutRef<"div">) => {
    const { filteredItems } = useMultiSelectContext();

    if (filteredItems && filteredItems.length > 0) return null;

    return (
        <div {...props} className={cn("py-6 text-center text-sm text-tertiary", className)}>
            {children ?? "No results found."}
        </div>
    );
};
