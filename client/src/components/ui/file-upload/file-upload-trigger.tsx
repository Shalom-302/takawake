"use client";

import type { ReactNode } from "react";
import React, { useRef } from "react";
import { Slot } from "@radix-ui/react-slot";

interface FileTriggerProps {
    /**
     * Specifies what mime type of files are allowed.
     */
    acceptedFileTypes?: Array<string>;
    /**
     * Whether multiple files can be selected.
     */
    allowsMultiple?: boolean;
    /**
     * Specifies the use of a media capture mechanism to capture the media on the spot.
     */
    defaultCamera?: "user" | "environment";
    /**
     * Handler when a user selects a file.
     */
    onSelect?: (files: FileList | null) => void;
    /**
     * The children of the component.
     */
    children: ReactNode;
    /**
     * Enables the selection of directories instead of individual files.
     */
    acceptDirectory?: boolean;
    /**
     * Change the default rendered element for the one passed as a child, merging their props and behavior.
     */
    asChild?: boolean;
}

/**
 * A FileTrigger allows a user to access the file system with any clickable element.
 */
export const FileTrigger = (props: FileTriggerProps) => {
    const {
        children,
        onSelect,
        acceptedFileTypes,
        allowsMultiple,
        defaultCamera,
        acceptDirectory,
        asChild = false,
    } = props;

    const inputRef = useRef<HTMLInputElement | null>(null);

    // Handle the click to trigger file dialog
    const handleClick = () => {
        // Reset input value to allow selecting the same file again
        if (inputRef.current?.value) {
            inputRef.current.value = "";
        }

        // Trigger file dialog
        inputRef.current?.click();
    };

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSelect?.(event.target.files);
    };

    const Component = asChild ? Slot : "button";

    return (
        <>
            <Component
                onClick={handleClick}
                style={{ cursor: "pointer" }}
                type={asChild ? undefined : "button"}
            >
                {children}
            </Component>
            <input
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                accept={acceptedFileTypes?.join(",")}
                onChange={handleFileChange}
                capture={defaultCamera}
                multiple={allowsMultiple}
                {...(acceptDirectory ? { webkitdirectory: true } : {})}
                aria-hidden="true"
            />
        </>
    );
};
