"use client";

import type { ComponentPropsWithRef } from "react";
import { createContext, useContext, useId } from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { FormFieldWrapper, type FormFieldWrapperProps } from "@/components/ui/form";
import type { FieldValues, FieldPath } from "react-hook-form";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// Context
// ============================================================================

type InputOTPContextType = {
    size: "sm" | "md" | "lg";
    disabled: boolean;
    id: string;
};

const InputOTPContext = createContext<InputOTPContextType | undefined>(undefined);

export const useInputOTPContext = () => {
    const context = useContext(InputOTPContext);

    if (!context) {
        throw new Error("useInputOTPContext must be used within InputOTP");
    }

    return context;
};

// ============================================================================
// Root Component
// ============================================================================

interface InputOTPRootProps extends ComponentPropsWithRef<"div"> {
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}

const InputOTPRoot = ({
    className,
    size = "md",
    disabled = false,
    ...props
}: InputOTPRootProps) => {
    const id = useId();

    return (
        <InputOTPContext.Provider value={{ size, disabled, id }}>
            <div role="group" className={cn("flex h-max flex-col gap-1.5", className)} {...props} />
        </InputOTPContext.Provider>
    );
};

// ============================================================================
// Group Component
// ============================================================================

type InputOTPGroupProps = ComponentPropsWithRef<typeof OTPInput> & {
    width?: number;
    inputClassName?: string;
};

const InputOTPGroup = ({
    inputClassName,
    containerClassName,
    width,
    maxLength = 4,
    ...props
}: InputOTPGroupProps) => {
    const { id, size, disabled } = useInputOTPContext();

    const heights = {
        sm: "h-16.5",
        md: "h-20.5",
        lg: "h-24.5",
    };

    return (
        <OTPInput
            {...props}
            size={width}
            maxLength={maxLength}
            disabled={disabled}
            id={"input-otp-" + id}
            aria-label="Enter your pin"
            aria-labelledby={"input-otp-label-" + id}
            aria-describedby={"input-otp-description-" + id}
            containerClassName={cn(
                "flex items-center  gap-3",
                size === "sm" && "gap-2",
                heights[size],
                containerClassName
            )}
            className={cn("w-full! disabled:cursor-not-allowed", inputClassName)}
        />
    );
};

// ============================================================================
// Slot Component
// ============================================================================

const sizes = {
    sm: "size-16 px-2 py-0.5 text-display-lg font-medium",
    md: "size-20 px-2 py-2.5 text-display-lg font-medium",
    lg: "size-24 px-2 py-3 text-display-xl font-medium",
};

const InputOTPSlot = ({
    index,
    className,
    ...props
}: ComponentPropsWithRef<"div"> & { index: number }) => {
    const { size, disabled } = useInputOTPContext();
    const { slots, isFocused } = useContext(OTPInputContext);
    const slot = slots[index];

    return (
        <div
            {...props}
            aria-label={`Enter digit ${index + 1} of ${slots.length}`}
            className={cn(
                "relative flex items-center justify-center rounded-xl bg-primary text-center text-placeholder_subtle shadow-xs ring-1 ring-primary transition-[box-shadow,background-color] duration-100 ease-linear ring-inset",
                sizes[size],
                isFocused &&
                    slot?.isActive &&
                    "ring-2 ring-brand outline-2 outline-offset-2 outline-brand",
                slot?.char && "text-brand-tertiary_alt ring-2 ring-brand",
                disabled && "bg-disabled_subtle text-fg-disabled_subtle ring-disabled",
                className
            )}
        >
            {slot?.char ? slot.char : slot?.hasFakeCaret ? <FakeCaret size={size} /> : 0}
        </div>
    );
};

// ============================================================================
// FakeCaret Component
// ============================================================================

const FakeCaret = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    return (
        <div
            className={cn(
                "pointer-events-none h-[1em] w-0.5 animate-caret-blink bg-fg-brand-primary",
                size === "lg" ? "text-display-xl font-medium" : "text-display-lg font-medium"
            )}
        />
    );
};

// ============================================================================
// Separator Component
// ============================================================================

const InputOTPSeparator = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
    return (
        <div
            role="separator"
            className={cn(
                "text-center text-display-xl font-medium text-placeholder_subtle",
                className
            )}
            {...props}
        >
            -
        </div>
    );
};

// ============================================================================
// Simplified InputOTP Component
// ============================================================================

type InputOTPProps = Omit<InputOTPGroupProps, "children" | "size"> & {
    slots?: number;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    separator?: boolean | number[];
};

export const InputOTP = ({
    slots = 6,
    size = "md",
    disabled = false,
    separator = false,
    maxLength,
    containerClassName,
    inputClassName,
}: InputOTPProps) => {
    const renderSlots = () => {
        const elements: React.ReactNode[] = [];

        for (let i = 0; i < slots; i++) {
            elements.push(<InputOTPSlot key={i} index={i} />);

            // Add separator if needed
            if (separator) {
                if (Array.isArray(separator)) {
                    // Custom positions for separators
                    if (separator.includes(i + 1)) {
                        elements.push(<InputOTPSeparator key={`sep-${i}`} />);
                    }
                } else if (separator === true) {
                    // Default: add separator in the middle
                    if (i === Math.floor(slots / 2) - 1 && slots % 2 === 0) {
                        elements.push(<InputOTPSeparator key={`sep-${i}`} />);
                    }
                }
            }
        }

        return elements;
    };

    return (
        <InputOTPRoot size={size} disabled={disabled}>
            <InputOTPGroup
                maxLength={maxLength ?? slots}
                containerClassName={containerClassName}
                inputClassName={inputClassName}
            >
                {renderSlots()}
            </InputOTPGroup>
        </InputOTPRoot>
    );
};

// ============================================================================
// Form Integration Component
// ============================================================================
type InputOTPFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> & {
    slots?: number;
    size?: "sm" | "md" | "lg";
    separator?: boolean | number[];
    maxLength?: number;
    disabled?: boolean;
    renderSlots?: (slots: number) => React.ReactNode;
    inputClassName?: string;
    containerClassName?: string;
    containerProps?: Omit<InputOTPRootProps, "size" | "disabled" | "children">;
};

export function InputOTPForm<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    rules,
    defaultValue,
    label,
    labelTooltip,
    description,
    isRequired,
    slots = 6,
    size = "md",
    separator = false,
    maxLength,
    disabled = false,
    renderSlots,
    inputClassName,
    containerClassName,
    containerProps,
}: InputOTPFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => {
                // Si renderSlots est fourni, utiliser la composition manuelle
                if (renderSlots) {
                    return (
                        <InputOTPRoot size={size} disabled={disabled} {...containerProps}>
                            <InputOTPGroup
                                maxLength={maxLength ?? slots}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputClassName={inputClassName}
                                containerClassName={containerClassName}
                            >
                                {renderSlots(slots)}
                            </InputOTPGroup>
                        </InputOTPRoot>
                    );
                }
                return (
                    <InputOTP
                        slots={slots}
                        size={size}
                        disabled={disabled}
                        separator={separator}
                        maxLength={maxLength ?? slots}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputClassName={inputClassName}
                        containerClassName={containerClassName}
                        // containerProps={containerProps}
                    />
                );
            }}
        </FormFieldWrapper>
    );
}

// ============================================================================
// Compound Component with Subcomponents
// ============================================================================

export const InputOTPCustom = {
    Root: InputOTPRoot,
    Group: InputOTPGroup,
    Slot: InputOTPSlot,
    Separator: InputOTPSeparator,
};

// ============================================================================
// Demo Component
// ============================================================================

// export default function Demo() {
//     const [value1, setValue1] = useState("");
//     const [value2, setValue2] = useState("");
//     const [value3, setValue3] = useState("");
//     const [value4, setValue4] = useState("");
//     const [value5, setValue5] = useState("");
//     const [value6, setValue6] = useState("");

//     return (
//         <div className="min-h-screen bg-gray-50 p-8">
//             <div className="mx-auto max-w-4xl space-y-12">
//                 <div>
//                     <h1 className="text-3xl font-bold mb-2">InputOTP Refactorisé</h1>
//                     <p className="text-gray-600">
//                         Composant OTP avec version simplifiée et API de composition
//                     </p>
//                 </div>

//                 {/* Simplified Usage */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">✨ Version Simplifiée</h2>
//                     <div className="space-y-6">
//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">4 chiffres</p>
//                             <InputOTP
//                                 slots={4}
//                                 value={value4}
//                                 onChange={setValue4}
//                             />
//                             <p className="mt-2 text-xs text-gray-500">Valeur: {value4}</p>
//                             <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
// {`<InputOTP slots={4} value={value} onChange={setValue} />`}
//                             </pre>
//                         </div>

//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">6 chiffres avec séparateur auto</p>
//                             <InputOTP
//                                 slots={6}
//                                 separator={true}
//                                 value={value5}
//                                 onChange={setValue5}
//                             />
//                             <p className="mt-2 text-xs text-gray-500">Valeur: {value5}</p>
//                             <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
// {`<InputOTP slots={6} separator={true} />`}
//                             </pre>
//                         </div>

//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Séparateurs personnalisés (après positions 2 et 4)</p>
//                             <InputOTP
//                                 slots={6}
//                                 separator={[2, 4]}
//                                 value={value6}
//                                 onChange={setValue6}
//                             />
//                             <p className="mt-2 text-xs text-gray-500">Valeur: {value6}</p>
//                             <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
// {`<InputOTP slots={6} separator={[2, 4]} />
// // Résultat: XX-XX-XX`}
//                             </pre>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Example 1: Basic 4-digit PIN */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">🔧 Composition Manuelle : PIN 4 chiffres</h2>
//                     <InputOTP.Root>
//                         <InputOTP.Group maxLength={4} value={value1} onChange={setValue1}>
//                             <InputOTP.Slot index={0} />
//                             <InputOTP.Slot index={1} />
//                             <InputOTP.Slot index={2} />
//                             <InputOTP.Slot index={3} />
//                         </InputOTP.Group>
//                     </InputOTP.Root>
//                     <p className="mt-4 text-sm text-gray-600">Valeur: {value1}</p>
//                     <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
// {`<InputOTP.Root>
//   <InputOTP.Group maxLength={4}>
//     <InputOTP.Slot index={0} />
//     <InputOTP.Slot index={1} />
//     <InputOTP.Slot index={2} />
//     <InputOTP.Slot index={3} />
//   </InputOTP.Group>
// </InputOTP.Root>`}
//                     </pre>
//                 </section>

//                 {/* Example 2: 6-digit with separator */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">🔧 Composition Manuelle : Code avec séparateur (XXX-XXX)</h2>
//                     <InputOTP.Root size="md">
//                         <InputOTP.Group maxLength={6} value={value2} onChange={setValue2}>
//                             <InputOTP.Slot index={0} />
//                             <InputOTP.Slot index={1} />
//                             <InputOTP.Slot index={2} />
//                             <InputOTP.Separator />
//                             <InputOTP.Slot index={3} />
//                             <InputOTP.Slot index={4} />
//                             <InputOTP.Slot index={5} />
//                         </InputOTP.Group>
//                     </InputOTP.Root>
//                     <p className="mt-4 text-sm text-gray-600">Valeur: {value2}</p>
//                     <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
// {`<InputOTP.Root size="md">
//   <InputOTP.Group maxLength={6}>
//     <InputOTP.Slot index={0} />
//     <InputOTP.Slot index={1} />
//     <InputOTP.Slot index={2} />
//     <InputOTP.Separator />
//     <InputOTP.Slot index={3} />
//     <InputOTP.Slot index={4} />
//     <InputOTP.Slot index={5} />
//   </InputOTP.Group>
// </InputOTP.Root>`}
//                     </pre>
//                 </section>

//                 {/* Different Sizes */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-6">Différentes Tailles</h2>
//                     <div className="space-y-6">
//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Small</p>
//                             <InputOTP size="sm" slots={4} />
//                         </div>
//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Medium (default)</p>
//                             <InputOTP size="md" slots={4} />
//                         </div>
//                         <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Large</p>
//                             <InputOTP size="lg" slots={4} />
//                         </div>
//                     </div>
//                 </section>

//                 {/* Complex Custom Layout */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">Layout Complexe : XX-XX-XX</h2>
//                     <InputOTP.Root size="md">
//                         <InputOTP.Group maxLength={6} value={value3} onChange={setValue3}>
//                             <InputOTP.Slot index={0} />
//                             <InputOTP.Slot index={1} />
//                             <InputOTP.Separator />
//                             <InputOTP.Slot index={2} />
//                             <InputOTP.Slot index={3} />
//                             <InputOTP.Separator />
//                             <InputOTP.Slot index={4} />
//                             <InputOTP.Slot index={5} />
//                         </InputOTP.Group>
//                     </InputOTP.Root>
//                     <p className="mt-4 text-sm text-gray-600">Valeur: {value3}</p>
//                 </section>

//                 {/* Disabled State */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">État Désactivé</h2>
//                     <InputOTP disabled slots={6} value="123456" />
//                 </section>

//                 {/* Form Integration Example */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">Intégration avec React Hook Form</h2>
//                     <p className="text-sm text-gray-600 mb-4">
//                         Utilisez <code className="bg-gray-100 px-1 py-0.5 rounded">InputOTPForm</code> pour l'intégration avec les formulaires
//                     </p>
//                     <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
// {`<InputOTPForm
//   name="verification_code"
//   control={control}
//   label="Code de vérification"
//   description="Entrez le code à 6 chiffres"
//   isRequired
//   slots={6}
// />

// // Ou avec un layout personnalisé :
// <InputOTPForm
//   name="pin"
//   control={control}
//   label="Code PIN"
//   slots={6}
//   renderSlots={(slots) => (
//     <>
//       <InputOTP.Slot index={0} />
//       <InputOTP.Slot index={1} />
//       <InputOTP.Slot index={2} />
//       <InputOTP.Separator />
//       <InputOTP.Slot index={3} />
//       <InputOTP.Slot index={4} />
//       <InputOTP.Slot index={5} />
//     </>
//   )}
// />`}
//                     </pre>
//                 </section>

//                 {/* API Summary */}
//                 <section className="bg-white rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold mb-4">📚 Résumé de l'API</h2>
//                     <div className="space-y-4 text-sm">
//                         <div className="border-l-4 border-blue-500 pl-4">
//                             <h3 className="font-semibold mb-2 text-blue-700">✨ Version Simplifiée</h3>
//                             <pre className="bg-gray-100 p-2 rounded text-xs mb-2">
// {`<InputOTP
//   slots={6}              // Nombre de slots
//   separator={true}       // true | false | [2, 4]
//   size="md"              // "sm" | "md" | "lg"
//   disabled={false}
//   value={value}
//   onChange={setValue}
// />`}
//                             </pre>
//                             <p className="text-gray-600 text-xs">
//                                 Génère automatiquement les slots avec séparateurs optionnels
//                             </p>
//                         </div>

//                         <div className="border-l-4 border-green-500 pl-4">
//                             <h3 className="font-semibold mb-2 text-green-700">🔧 Composition Manuelle</h3>
//                             <pre className="bg-gray-100 p-2 rounded text-xs mb-2">
// {`<InputOTP.Root size="md" disabled={false}>
//   <InputOTP.Group maxLength={6} value={v} onChange={setV}>
//     <InputOTP.Slot index={0} />
//     <InputOTP.Slot index={1} />
//     <InputOTP.Separator />
//     <InputOTP.Slot index={2} />
//   </InputOTP.Group>
// </InputOTP.Root>`}
//                             </pre>
//                             <p className="text-gray-600 text-xs">
//                                 Contrôle total sur le layout et la position des séparateurs
//                             </p>
//                         </div>

//                         <div className="border-l-4 border-purple-500 pl-4">
//                             <h3 className="font-semibold mb-2 text-purple-700">📋 Formulaires (React Hook Form)</h3>
//                             <pre className="bg-gray-100 p-2 rounded text-xs mb-2">
// {`<InputOTPForm
//   name="code"
//   control={control}
//   label="Code de vérification"
//   description="Entrez le code"
//   isRequired
//   slots={6}
//   separator={true}
//   // ou avec renderSlots pour layout custom
//   renderSlots={(slots) => (
//     <>
//       <InputOTP.Slot index={0} />
//       <InputOTP.Separator />
//       <InputOTP.Slot index={1} />
//     </>
//   )}
// />`}
//                             </pre>
//                             <p className="text-gray-600 text-xs">
//                                 Intégration complète avec validation et gestion d'erreurs
//                             </p>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </div>
//     );
// }
