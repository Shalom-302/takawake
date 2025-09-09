// import * as React from "react"

// interface ComboboxInputProps {
//     options: any[];
//     placeholder?: string;
//     searchPlaceholder?: string;
//     emptyText?: string;
//     size?: "sm" | "default";
//     className?: string;
//     value?: string;
//     onValueChange?: (value: string) => void;
//     disabled?: boolean;
//     required?: boolean;
//     name?: string;
//     id?: string;
// }

// const ComboboxInput = React.forwardRef<HTMLButtonElement, ComboboxInputProps>(
//     (
//         {
//             options,
//             placeholder = "Sélectionnez une option...",
//             searchPlaceholder = "Rechercher...",
//             emptyText = "Aucune option trouvée.",
//             size = "default",
//             className,
//             value,
//             onValueChange,
//             disabled,
//             required,
//             name,
//             id,
//             ...props
//         },
//         ref
//     ) => {
//         const [open, setOpen] = React.useState(false);
//         const [searchValue, setSearchValue] = React.useState("");

//         const selectedOption = options.find(option => option.value === value);

//         const filteredOptions = options.filter(option =>
//             option.label.toLowerCase().includes(searchValue.toLowerCase())
//         );

//         return (
//             <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>
//                     <button
//                         ref={ref}
//                         id={id}
//                         className={cn(
//                             "flex w-full items-center justify-between gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",
//                             "focus:outline-none focus:ring-2 focus:ring-brand",
//                             "disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled",
//                             size === "sm" ? "h-8 py-2 px-3 text-sm" : "h-9 py-2.5 px-3.5 text-sm",
//                             className
//                         )}
//                         role="combobox"
//                         aria-expanded={open}
//                         aria-haspopup="dialog"
//                         disabled={disabled}
//                         {...props}
//                     >
//                         <span className="text-primary truncate">
//                             {selectedOption ? selectedOption.label : placeholder}
//                         </span>
//                         <ChevronDown className="h-4 w-4 text-fg-quaternary" />
//                     </button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[--radix-popover-trigger-width]" align="start">
//                     <Command>
//                         <CommandInput
//                             placeholder={searchPlaceholder}
//                             value={searchValue}
//                             onValueChange={setSearchValue}
//                         />
//                         <CommandList>
//                             <CommandEmpty>{emptyText}</CommandEmpty>
//                             <CommandGroup>
//                                 {filteredOptions.map(option => (
//                                     <CommandItem
//                                         key={option.value}
//                                         value={option.value}
//                                         disabled={option.disabled}
//                                         onSelect={currentValue => {
//                                             onValueChange?.(
//                                                 currentValue === value ? "" : currentValue
//                                             );
//                                             setOpen(false);
//                                             setSearchValue("");
//                                         }}
//                                         className="flex items-center justify-between"
//                                     >
//                                         <span className="flex-1 truncate">{option.label}</span>
//                                         {value === option.value && (
//                                             <Check className="h-4 w-4 text-fg-brand-primary" />
//                                         )}
//                                     </CommandItem>
//                                 ))}
//                             </CommandGroup>
//                         </CommandList>
//                     </Command>
//                 </PopoverContent>
//             </Popover>
//         );
//     }
// );
// ComboboxInput.displayName = "ComboboxInput";

// ==================================================
// COMBOBOX INPUT FORM
// ==================================================

// interface ComboboxInputFormProps extends ComboboxInputProps {
//     label?: string;
//     hint?: string;
//     error?: string;
//     required?: boolean;
//     tooltip?: string;
//     containerClassName?: string;
// }

// const ComboboxInputForm = React.forwardRef<HTMLButtonElement, ComboboxInputFormProps>(
//     (
//         {
//             label,
//             hint,
//             error,
//             required = false,
//             tooltip,
//             containerClassName,
//             className,
//             id,
//             ...props
//         },
//         ref
//     ) => {
//         const inputId = id || React.useId();
//         const hintId = hint ? `${inputId}-hint` : undefined;
//         const errorId = error ? `${inputId}-error` : undefined;

//         return (
//             <div className={cn("flex flex-col gap-1.5", containerClassName)}>
//                 {label && (
//                     <Label htmlFor={inputId} required={required} tooltip={tooltip}>
//                         {label}
//                     </Label>
//                 )}

//                 <ComboboxInput
//                     ref={ref}
//                     id={inputId}
//                     required={required}
//                     className={cn(error && "ring-destructive focus:ring-destructive", className)}
//                     aria-describedby={cn(hintId, errorId).trim() || undefined}
//                     {...props}
//                 />

//                 {(hint || error) && (
//                     <HintText id={error ? errorId : hintId} variant={error ? "error" : "default"}>
//                         {error || hint}
//                     </HintText>
//                 )}
//             </div>
//         );
//     }
// );
// ComboboxInputForm.displayName = "ComboboxInputForm";

// export { ComboboxInput };
