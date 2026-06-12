export * from "./featured-card-progress-bar";
export * from "./featured-card-progress-circle";
export type FeaturedCardCommonProps = {
    title: string;
    description: string;
    confirmLabel: string;
    className?: string;
    onDismiss: () => void;
    onConfirm: () => void;
};
