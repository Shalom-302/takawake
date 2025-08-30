import React from "react";
import Link from "next/link";
// import { Alert, AlertTitle, AlertDescription } from "@/ds/components/alert";
import { Alert } from "@/components/ui/alert";
import {
    InfoIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    BellIcon,
    PopcornIcon,
} from "lucide-react";
import { CodeBlock } from "@/ds/components/code-block";
import { InfoCircle } from "@untitled-ui/icons-react";

export default function AlertPage() {
    // Définir le type pour les variants avec les variantes supportées par le composant Alert
    // type SupportedVariant = "default" | "destructive" | "success" | "warning" | "info" | "neutral";

    // const variants: Array<{
    //     name: SupportedVariant;
    //     description: string;
    //     icon: React.ReactNode;
    //     title: string;
    //     content: string;
    // }> = [
    //     {
    //         name: "default",
    //         description: "Default style",
    //         icon: <BellIcon className="h-4 w-4" />,
    //         title: "Information",
    //         content: "This is a default alert.",
    //     },
    //     {
    //         name: "destructive",
    //         description: "For error or destructive actions",
    //         icon: <XCircleIcon className="h-4 w-4" />,
    //         title: "Error",
    //         content: "An error occurred while processing your request.",
    //     },
    //     {
    //         name: "success",
    //         description: "For success or validations",
    //         icon: <CheckCircleIcon className="h-4 w-4" />,
    //         title: "Success",
    //         content: "Your action was successfully completed.",
    //     },
    //     {
    //         name: "warning",
    //         description: "For warnings",
    //         icon: <AlertTriangleIcon className="h-4 w-4" />,
    //         title: "Warning",
    //         content: "Please verify the information before continuing.",
    //     },
    //     {
    //         name: "info",
    //         description: "For important information",
    //         icon: <InfoIcon className="h-4 w-4" />,
    //         title: "Information",
    //         content: "Here is important information to know.",
    //     },
    //     {
    //         name: "neutral",
    //         description: "Neutral style",
    //         icon: <BellIcon className="h-4 w-4" />,
    //         title: "Notification",
    //         content: "A general notification without particular connotation.",
    //     },
    // ];

    // const sizes = ["sm", "default", "lg"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Alert</h1>
                <p className="text-muted-foreground mt-2">
                    Alerts to display important messages to the user.
                </p>
            </div>

            <Alert
                icon={<InfoCircle />}
                title="Success! Your changes have been saved"
                description=" This is an alert with icon, title and description."
                firstActionLabel="Undo"
                secondActionLabel="Dismiss"
                dismissible
            />

            {/* Variants */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border rounded-lg">
                            <Alert
                                // @ts-expect-error - Notre composant Alert personnalisé supporte ces variantes
                                variant={variant.name}
                                className="mb-4"
                            >
                                {variant.icon}
                                <AlertTitle>{variant.title}</AlertTitle>
                                <AlertDescription>{variant.content}</AlertDescription>
                            </Alert>
                            <p className="text-sm text-muted-foreground mb-2">
                                {variant.description}
                            </p>
                            <CodeBlock
                                className="mt-2"
                                code={`<Alert variant="${variant.name}">
  <IconComponent />
  <AlertTitle>Titre</AlertTitle>
  <AlertDescription>Description of the alert</AlertDescription>
</Alert>`}
                            />
                        </div>
                    ))}
                </div>
            </div> */}

            {/* Sizes */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="grid grid-cols-1 gap-6">
                    {sizes.map(size => (
                        <div key={size} className="p-4 border rounded-lg">
                            <Alert variant={"info" as any} size={size as any} className="mb-2">
                                <InfoIcon className="h-4 w-4" />
                                <AlertTitle>Alert {size}</AlertTitle>
                                <AlertDescription>
                                    This is an alert of size {size}.
                                </AlertDescription>
                            </Alert>
                            <CodeBlock
                                className="mt-2"
                                code={`<Alert size="${size}" variant={"info" as any}>...</Alert>`}
                            />
                        </div>
                    ))}
                </div>
            </div> */}

            {/* Sans titre */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Without title</h2>
                <div className="p-4 border rounded-lg">
                    <Alert variant="success" className="mb-4">
                        <CheckCircleIcon className="h-4 w-4" />
                        <AlertDescription>
                            This alert has no title, only a description.
                        </AlertDescription>
                    </Alert>
                    <CodeBlock
                        className="mt-2"
                        code={`<Alert variant="success">
  <CheckCircleIcon className="h-4 w-4" />
  <AlertDescription>This alert has no title, only a description.</AlertDescription>
</Alert>`}
                    />
                </div>
            </div> */}

            {/* Sans icône */}
            {/* <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Without icon</h2>
                <div className="p-4 border rounded-lg">
                    <Alert variant="warning" className="mb-4">
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>
                            This alert has no icon, only a title and a description.
                        </AlertDescription>
                    </Alert>
                    <CodeBlock
                        className="mt-2"
                        code={`<Alert variant="warning">
  <AlertTitle>Attention</AlertTitle>
  <AlertDescription>This alert has no icon, only a title and a description.</AlertDescription>
</Alert>`}
                    />
                </div>
            </div> */}
        </div>
    );
}
