import { cn } from "@/lib/utils/cn";
import { ProgressBarCircle } from "@/components/ui/progress-indicators";
import { Button, CloseButton } from "@/components/ui/button";
import { FeaturedCardCommonProps } from ".";

export const FeaturedCardProgressCircle = ({
    title,
    description,
    confirmLabel,
    progress,
    className,
    onDismiss,
    onConfirm,
}: FeaturedCardCommonProps & {
    progress: number;
}) => {
    return (
        <div className={cn("relative flex flex-col rounded-xl bg-secondary p-4", className)}>
            <div className="w-16">
                <ProgressBarCircle value={progress} size="xxs" />
            </div>

            <div className="absolute top-2 right-2">
                <CloseButton onClick={onDismiss} size="sm" />
            </div>
            <div className="mt-3">
                <p className="text-sm font-semibold text-primary">{title}</p>
                <p className="mt-1 text-sm text-tertiary">{description}</p>
            </div>
            <div className="mt-4 flex gap-3">
                <Button onClick={onDismiss} color="link-gray" size="sm">
                    Dismiss
                </Button>
                <Button onClick={onConfirm} color="link-color" size="sm">
                    {confirmLabel}
                </Button>
            </div>
        </div>
    );
};
