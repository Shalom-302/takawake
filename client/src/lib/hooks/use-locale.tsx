// 1. Hook pour la détection automatique de la locale
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Locale } from "date-fns";

// Import des locales les plus communes
import { enUS, fr, es, de, it, pt, ru, ja, ko, zhCN, ar } from "date-fns/locale";
import { NativeSelect } from "@/components/ui/select";

// Map des locales disponibles
const AVAILABLE_LOCALES = {
    en: enUS, // English
    "en-US": enUS,
    "en-GB": enUS, // On peut ajouter enGB si nécessaire
    fr: fr, // Français
    "fr-FR": fr,
    es: es, // Español
    "es-ES": es,
    de: de, // Deutsch
    "de-DE": de,
    it: it, // Italiano
    "it-IT": it,
    pt: pt, // Português
    "pt-BR": pt,
    ru: ru, // Русский
    "ru-RU": ru,
    ja: ja, // 日本語
    "ja-JP": ja,
    ko: ko, // 한국어
    "ko-KR": ko,
    zh: zhCN, // 中文
    "zh-CN": zhCN,
    ar: ar, // العربية
    "ar-SA": ar,
} as const;

type LocaleCode = keyof typeof AVAILABLE_LOCALES;

interface LocaleContextType {
    locale: Locale;
    localeCode: string;
    setLocaleCode: (code: string) => void;
    dateFormat: string;
    timeFormat: string;
    isRTL: boolean;
    firstDayOfWeek: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
}

// Context pour la localisation
const LocaleContext = createContext<LocaleContextType | null>(null);

// Hook utilitaire
export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLocale must be used within LocaleProvider");
    }
    return context;
};

// Fonction pour détecter la locale de l'utilisateur
const detectUserLocale = (): string => {
    // 1. Vérifier localStorage (préférence utilisateur sauvegardée)
    const savedLocale = typeof window !== "undefined" ? localStorage.getItem("user-locale") : null;
    if (savedLocale && savedLocale in AVAILABLE_LOCALES) {
        return savedLocale;
    }

    // 2. Vérifier la langue du navigateur
    if (typeof navigator !== "undefined") {
        // Essayer d'abord la langue complète (ex: 'fr-FR')
        const fullLocale = navigator.language;
        if (fullLocale in AVAILABLE_LOCALES) {
            return fullLocale;
        }

        // Puis essayer juste le code langue (ex: 'fr')
        const langCode = fullLocale.split("-")[0];
        if (langCode in AVAILABLE_LOCALES) {
            return langCode;
        }

        // Vérifier les langues préférées
        const preferredLanguages = navigator.languages || [];
        for (const lang of preferredLanguages) {
            if (lang in AVAILABLE_LOCALES) {
                return lang;
            }
            const code = lang.split("-")[0];
            if (code in AVAILABLE_LOCALES) {
                return code;
            }
        }
    }

    // 3. Par défaut anglais US
    return "en-US";
};

// Configuration des formats selon la locale
const getLocaleConfig = (localeCode: string) => {
    const config = {
        en: {
            dateFormat: "MM/dd/yyyy",
            timeFormat: "h:mm a",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        "en-US": {
            dateFormat: "MM/dd/yyyy",
            timeFormat: "h:mm a",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        "en-GB": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        fr: {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "fr-FR": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        es: {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "es-ES": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        de: {
            dateFormat: "dd.MM.yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "de-DE": {
            dateFormat: "dd.MM.yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        it: {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "it-IT": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        pt: {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "pt-BR": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        ru: {
            dateFormat: "dd.MM.yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "ru-RU": {
            dateFormat: "dd.MM.yyyy",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        ja: {
            dateFormat: "yyyy/MM/dd",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        "ja-JP": {
            dateFormat: "yyyy/MM/dd",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        ko: {
            dateFormat: "yyyy. MM. dd.",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        "ko-KR": {
            dateFormat: "yyyy. MM. dd.",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 0 as const,
        },
        zh: {
            dateFormat: "yyyy/MM/dd",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        "zh-CN": {
            dateFormat: "yyyy/MM/dd",
            timeFormat: "HH:mm",
            isRTL: false,
            firstDayOfWeek: 1 as const,
        },
        ar: {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: true,
            firstDayOfWeek: 6 as const,
        },
        "ar-SA": {
            dateFormat: "dd/MM/yyyy",
            timeFormat: "HH:mm",
            isRTL: true,
            firstDayOfWeek: 6 as const,
        },
    } as const;

    return config[localeCode as keyof typeof config] || config["en-US"];
};

// Provider pour la localisation
export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
    const [localeCode, setLocaleCodeState] = useState<string>(() => detectUserLocale());

    const setLocaleCode = (code: string) => {
        if (code in AVAILABLE_LOCALES) {
            setLocaleCodeState(code);
            // Sauvegarder la préférence
            if (typeof window !== "undefined") {
                localStorage.setItem("user-locale", code);
            }
        }
    };

    const locale = AVAILABLE_LOCALES[localeCode as LocaleCode] || AVAILABLE_LOCALES["en-US"];
    const config = getLocaleConfig(localeCode);

    const contextValue: LocaleContextType = {
        locale,
        localeCode,
        setLocaleCode,
        ...config,
    };

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

// Hook pour détecter les changements de langue du système
export const useSystemLocaleDetection = () => {
    const { setLocaleCode } = useLocale();

    useEffect(() => {
        const handleLanguageChange = () => {
            const newLocale = detectUserLocale();
            setLocaleCode(newLocale);
        };

        // Écouter les changements de langue
        window.addEventListener("languagechange", handleLanguageChange);

        return () => {
            window.removeEventListener("languagechange", handleLanguageChange);
        };
    }, [setLocaleCode]);
};

// Composant sélecteur de langue
export const LanguageSelector = () => {
    const { localeCode, setLocaleCode } = useLocale();

    const languages = [
        { code: "en-US", name: "English (US)", flag: "🇺🇸" },
        { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
        { code: "fr-FR", name: "Français", flag: "🇫🇷" },
        { code: "es-ES", name: "Español", flag: "🇪🇸" },
        { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
        { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
        { code: "pt-BR", name: "Português (BR)", flag: "🇧🇷" },
        { code: "ru-RU", name: "Русский", flag: "🇷🇺" },
        { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
        { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
        { code: "zh-CN", name: "中文", flag: "🇨🇳" },
        { code: "ar-SA", name: "العربية", flag: "🇸🇦" },
    ];

    return (
        <NativeSelect
            value={localeCode}
            onChange={e => setLocaleCode(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
            options={languages.map(lang => ({
                label: `${lang.flag} ${lang.name}`,
                value: lang.code,
            }))}
        />
    );
};

// Labels traduits pour le calendrier
export const getLocalizedLabels = (localeCode: string) => {
    const labels = {
        en: {
            labelMonthDropdown: () => "Month",
            labelYearDropdown: () => "Year",
            labelNext: () => "Next Month",
            labelPrevious: () => "Previous Month",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Week ${weekNumber}`,
        },
        fr: {
            labelMonthDropdown: () => "Mois",
            labelYearDropdown: () => "Année",
            labelNext: () => "Mois suivant",
            labelPrevious: () => "Mois précédent",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Semaine ${weekNumber}`,
        },
        es: {
            labelMonthDropdown: () => "Mes",
            labelYearDropdown: () => "Año",
            labelNext: () => "Mes siguiente",
            labelPrevious: () => "Mes anterior",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Semana ${weekNumber}`,
        },
        de: {
            labelMonthDropdown: () => "Monat",
            labelYearDropdown: () => "Jahr",
            labelNext: () => "Nächster Monat",
            labelPrevious: () => "Vorheriger Monat",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Woche ${weekNumber}`,
        },
        it: {
            labelMonthDropdown: () => "Mese",
            labelYearDropdown: () => "Anno",
            labelNext: () => "Mese successivo",
            labelPrevious: () => "Mese precedente",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Settimana ${weekNumber}`,
        },
        pt: {
            labelMonthDropdown: () => "Mês",
            labelYearDropdown: () => "Ano",
            labelNext: () => "Próximo mês",
            labelPrevious: () => "Mês anterior",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Semana ${weekNumber}`,
        },
        ru: {
            labelMonthDropdown: () => "Месяц",
            labelYearDropdown: () => "Год",
            labelNext: () => "Следующий месяц",
            labelPrevious: () => "Предыдущий месяц",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `Неделя ${weekNumber}`,
        },
        ja: {
            labelMonthDropdown: () => "月",
            labelYearDropdown: () => "年",
            labelNext: () => "翌月",
            labelPrevious: () => "前月",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `第${weekNumber}週`,
        },
        ko: {
            labelMonthDropdown: () => "월",
            labelYearDropdown: () => "년",
            labelNext: () => "다음 달",
            labelPrevious: () => "이전 달",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `${weekNumber}주`,
        },
        zh: {
            labelMonthDropdown: () => "月",
            labelYearDropdown: () => "年",
            labelNext: () => "下个月",
            labelPrevious: () => "上个月",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `第${weekNumber}周`,
        },
        ar: {
            labelMonthDropdown: () => "الشهر",
            labelYearDropdown: () => "السنة",
            labelNext: () => "الشهر التالي",
            labelPrevious: () => "الشهر السابق",
            labelDay: (day: Date) => `${day.getDate()}`,
            labelWeekNumber: (weekNumber: number) => `الأسبوع ${weekNumber}`,
        },
    } as const;

    const langCode = localeCode.split("-")[0] as keyof typeof labels;
    return labels[langCode] || labels["en"];
};
