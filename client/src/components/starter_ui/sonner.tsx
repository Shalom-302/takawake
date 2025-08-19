// DOCS :
// https://sonner.emilkowal.ski/

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            style={
                {
                    "--normal-bg": "var(--bg-primary_alt)",
                    "--normal-text": "var(--fg-primary)",
                    "--normal-border": "var(--border-tertiary)",
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
