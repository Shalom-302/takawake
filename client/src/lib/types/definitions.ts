import * as z from "zod/v4";

export type IconProps = {
    size?: number;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const selectPropsSchema = z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
});

export type SelectProps = z.infer<typeof selectPropsSchema>;

export type OneCardType = {
    id: number;
    title: string;
    label: string;
    illustration: string;
    redirection: string;
};

// ----- loginSchema
export const loginSchema = z.object({
    identifier: z.string().min(1, "Ce champs est requis"),
    password: z.string().min(1, "Veuillez renseigner votre mot de passe"),
});

export type Login = z.infer<typeof loginSchema>;

// ------ startSignupSchema
export const startSignupSchema = z.object({
    identifier: z.string().min(1, "Ce champs est requis"),
    singleCheckbox: z.boolean(),
});
export type startSignup = z.infer<typeof startSignupSchema>;

// ----- forgotPasswordSchema
export const forgotPasswordSchema = z.object({
    identifier: z.string().min(1, "Ce champs est requis"),
});
export type ForgotPwd = z.infer<typeof forgotPasswordSchema>;

// ------ accountSignupSchema
export const accountSignupSchema = z
    .object({
        pseudo: z.string(),
        last_name: z.string(),
        first_name: z.string(),
        profile_picture: z.string(),
        password: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial"),
        confirm: z.string(),
    })
    .refine(data => data.password === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"], // ⬅️ très important
    });
export type accountSignup = z.infer<typeof accountSignupSchema>;

// ------ signup step one
export const signupStepOneSchema = z.object({
    firstname: z.string().min(1, "Cette valeur est requise"),
    lastname: z.string().min(1, "Le nom est requis"),
    birth: z.date({
        error: "La date de naissance est requise",
    }),
    job: z.string().min(1, "Profession requise"),
    city: z.string().min(1, "Ville requise"),
});
export type signupStepOne = z.infer<typeof signupStepOneSchema>;

// ------ signup step three
export const signupStepThreeSchema = z.object({
    number: z.string().min(1, "Le nom est requis"),
    expiry: z.string().min(1, "Le nom est requis"),
    cvv: z.string().min(1, "Le nom est requis"),
    phone: z.string(),
});
export type signupStepThree = z.infer<typeof signupStepThreeSchema>;

// ------ otpSchema
export const otpSchema = z.object({
    otp: z.string().min(4, {
        message: "Votre mot de passe à usage unique doit comporter 4 caractères.",
    }),
});
export type OTP = z.infer<typeof otpSchema>;

// ------ setPasswordSchema
export const setPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial"),
        confirm: z.string(),
    })
    .refine(data => data.password === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"], // ⬅️ très important
    });
export type setPwd = z.infer<typeof setPasswordSchema>;

// ------ profile
export const profileUserSchema = z.object({
    firstname: z.string().min(1, "Le nom est requis"),
    lastname: z.string().min(1, "Cette valeur est requise"),
    username: z.string().min(1, "Ce champs est requis"),
    city: z.string().min(1, "Ce champs est requis"),
    job: z.string().min(1, "Ce champs est requis"),
    date_of_birth: z.date({
        error: "La date de naissance est requise",
    }),
});
export type profileUser = z.infer<typeof profileUserSchema>;

// ------ securityPwd
export const securityPwdSchema = z
    .object({
        password: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial"),
        new: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial"),
        confirm: z.string(),
        // email: z.email({ message: "L'email est requis" }),
        // phone: z.string(),
    })
    .refine(data => data.new === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"], // ⬅️ très important
    });
export type securityPwd = z.infer<typeof securityPwdSchema>;

// ------ securityPwd
export const securityEmailPhoneSchema = z.object({
    email: z.email({ message: "L'email est requis" }),
    phone: z.string(),
});
export type securityEmailPhone = z.infer<typeof securityEmailPhoneSchema>;

// ----- viewFormSchema
export const viewFormSchema = z.object({
    // image: z.file().mime(["image/png", "image/jpeg", "image/webp"]).nullable(),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.email({ message: "email is required" }),
    password: z.string().refine(val => val.length > 8, {
        error: "Too short!",
    }),
    value: z.number(),
    otp: z.string().min(4, {
        message: "Your one-time password must be 4 characters.",
    }),
    phone: z.string(),
    // url: z.url({
    //   protocol: /^https?$/,
    //   hostname: z.regexes.domain,
    // }),
    tags: z.array(z.string()),
    // card: z.object({
    //   number: z.string().regex(/^\d{13,19}$/, { message: "Numéro invalide" }),
    //   expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    //     message: "Date invalide (MM/YY)",
    //   }),
    //   cvc: z.string().regex(/^\d{3,4}$/, { message: "CVC invalide" }),
    // }),
    // card_number: z.string().regex(/^\d{13,19}$/, { message: "Numéro invalide" }),
    bio: z
        .string()
        .min(10, {
            message: "Bio must be at least 10 characters.",
        })
        .max(160, {
            message: "Bio must not be longer than 30 characters.",
        }),
    // selectedItem: z.string({
    //   error: "Please select an item to display.",
    // }),
    singleCheckbox: z.boolean(),
    multiCheckboxItems: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one item.",
    }),
    radio: z.enum(["all", "mentions", "none"], {
        error: "You need to select a notification type.",
    }),
    birth: z.date({
        error: "A date of birth is required.",
    }),
});
export type ViewForm = z.infer<typeof viewFormSchema>;

export const newTontineSchema = z
    .object({
        fullname: z.string().min(10).optional(),
        isAgree: z.boolean().default(false),
        type: z.string(),
        image: z.record(z.string(), z.union([z.file(), z.array(z.file()), z.null()])).optional(),
        name: z.string(),
        description: z.string().optional(),
        amount: z.string().optional(),
        totalHands: z.number().optional(),
        totalMembers: z.number(),
        frequency: z.array(selectPropsSchema),
        method: z.array(selectPropsSchema).optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        eligibleEvents: z.array(selectPropsSchema).optional(),
        totalSupportDays: z.number().optional(),
        contribution: z.string().optional(),
    })
    .refine(({ type, totalHands }) => (type === "classic" ? !!totalHands : true), {
        path: ["totalHands"],
        message: "totalHands is required",
    })
    .refine(({ type, method }) => (type === "classic" ? !!method : true), {
        path: ["method"],
        message: "method is required",
    })
    .refine(({ type, endDate }) => (type === "classic" ? !!endDate : true), {
        path: ["endDate"],
        message: "endDate is required",
    })
    .refine(({ type, eligibleEvents }) => (type === "event" ? !!eligibleEvents : true), {
        path: ["eligibleEvents"],
        message: "eligibleEvents is required",
    })
    .refine(({ type, totalSupportDays }) => (type === "event" ? !!totalSupportDays : true), {
        path: ["totalSupportDays"],
        message: "totalSupportDays is required",
    })
    .refine(({ type, contribution }) => (type === "event" ? !!contribution : true), {
        path: ["contribution"],
        message: "contribution is required",
    })
    .refine(({ fullname, isAgree }) => (isAgree === true ? !!fullname : true), {
        path: ["fullname"],
        message: "fullname is required",
    });

export type NewTontine = z.infer<typeof newTontineSchema>;
