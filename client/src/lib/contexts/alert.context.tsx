// "use client";

// import { Alert } from "@/components/ui/alert";
// import { createContext, useContext } from "react";
// import { toast, Toaster } from "sonner";

// type AlertType = "success" | "error" | "warning";

// type ShowAlertOptions = {
//   type?: AlertType;
//   title: string;
//   desc: string;
//   position?: any;
// };

// type AlertContextType = {
//   showAlert: (options: ShowAlertOptions) => void;
// };

// const AlertContext = createContext<AlertContextType | null>(null);

// export function AlertProvider({ children }: { children: React.ReactNode }) {
//   const showAlert = ({
//     type = "success",
//     title,
//     desc,
//     position = "top-right",
//   }: ShowAlertOptions) => {
//     toast.custom(
//       t => (
//         <Alert
//           type={type}
//           title={title}
//           desc={desc}
//           action={() => toast.dismiss(t)}
//         />
//       ),
//       { position }
//     );
//   };

//   return (
//     <AlertContext.Provider value={{ showAlert }}>
//       {children}
//       <Toaster />
//     </AlertContext.Provider>
//   );
// }

// export function useAlert(): AlertContextType {
//   const context = useContext(AlertContext);
//   if (!context) {
//     throw new Error("useAlert must be used within an AlertProvider");
//   }
//   return context;
// }

"use client";

import { createContext, useContext } from "react";
import { toast, Toaster } from "sonner";
import { Alert } from "@/components/ui/alert";
import type { ReactNode, ReactElement } from "react";

type AlertType = "success" | "error" | "warning";

type ShowAlertOptions = {
    type?: AlertType;
    title?: string;
    desc?: string;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    customComponent?: (t: string | number) => ReactElement;
};

type AlertContextType = {
    showAlert: (options: ShowAlertOptions) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
    const showAlert = ({
        type = "success",
        title = "",
        desc = "",
        position = "top-right",
        customComponent,
    }: ShowAlertOptions) => {
        toast.custom(
            t =>
                customComponent ? (
                    customComponent(t)
                ) : (
                    <Alert
                        variant={type}
                        title={title}
                        description={desc}
                        dismissible
                        onClick={() => toast.dismiss(t)}
                    />
                ),
            {
                position,
            }
        );
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Toaster />
        </AlertContext.Provider>
    );
}

export function useAlert(): AlertContextType {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
}
