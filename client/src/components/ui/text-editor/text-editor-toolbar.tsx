"use client";
import * as Toolbar from "@radix-ui/react-toolbar";
import { type Editor } from "@tiptap/react";
import { TextEditorIcon } from "./text-editor-icon";
import { TextColor } from "./text-color";
import { Select } from "../select";
import { useState } from "react";

type TextEditorToolbarProps = {
    editor: Editor;
    variant?: "default-sm" | "default-md" | "floatting-sm" | "floatting-md";
};

export function TextEditorToolbar({ editor, variant = "default-sm" }: TextEditorToolbarProps) {
    const [fontSize, setFontSize] = useState("16px");
    const [fontFamily, setFontFamily] = useState("Inter");
    const insertLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Entrez l'URL:", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        editor.chain().focus().setFontSize(size).run();
    };

    const handleFontFamilyChange = (font: string) => {
        setFontFamily(font);
        const fontMap: Record<string, string> = {
            Inter: "Inter, sans-serif",
            "Comic Sans": "Comic Sans MS, cursive",
            Serif: "Georgia, serif",
        };
        editor
            .chain()
            .focus()
            .setFontFamily(fontMap[font] || font)
            .run();
    };

    const Separator = () => <Toolbar.Separator className="h-6 w-px bg-gray-300 mx-1.5" />;

    const FormattingGroup = () => (
        <Toolbar.ToggleGroup type="multiple" className="flex gap-1" aria-label="Mise en forme">
            <Toolbar.ToggleItem value="bold" aria-label="Gras" asChild>
                <TextEditorIcon
                    type="bold"
                    isActive={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
            </Toolbar.ToggleItem>

            <Toolbar.ToggleItem value="italic" aria-label="Italique" asChild>
                <TextEditorIcon
                    type="italic"
                    isActive={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
            </Toolbar.ToggleItem>

            <Toolbar.ToggleItem value="underline" aria-label="Souligné" asChild>
                <TextEditorIcon
                    type="underline"
                    isActive={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                />
            </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
    );

    const ListGroup = () => (
        <Toolbar.ToggleGroup type="single" aria-label="Listes" className="flex gap-1">
            <Toolbar.ToggleItem value="bulletList" aria-label="Liste à puces" asChild>
                <TextEditorIcon
                    type="dot-points"
                    isActive={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
            </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
    );

    const AlignGroup = () => {
        const alignMap = {
            left: "left-align",
            center: "center-align",
            right: "right-align",
        } as const;

        return (
            <Toolbar.ToggleGroup
                type="single"
                aria-label="Alignement du texte"
                value={editor.getAttributes("paragraph").textAlign || "left"}
                onValueChange={value => {
                    if (value) {
                        editor.chain().focus().setTextAlign(value).run();
                    }
                }}
                className="flex gap-1"
            >
                {(["left", "center", "right"] as const).map(align => {
                    const iconType = alignMap[align];
                    return (
                        <Toolbar.ToggleItem
                            key={align}
                            value={align}
                            aria-label={`Aligner à ${align === "left" ? "gauche" : align === "center" ? "centre" : "droite"}`}
                            asChild
                        >
                            <TextEditorIcon
                                type={iconType}
                                isActive={editor.isActive({ textAlign: align })}
                            />
                        </Toolbar.ToggleItem>
                    );
                })}
            </Toolbar.ToggleGroup>
        );
    };

    const InsertGroup = () => (
        <div className="flex gap-1">
            <TextEditorIcon type="link" isActive={editor.isActive("link")} onClick={insertLink} />
        </div>
    );

    return (
        <Toolbar.Root
            className={`flex items-center gap-0.5 w-fit ${
                variant.includes("floatting")
                    ? "bg-white p-2 border border-primary rounded-xl shadow-lg"
                    : ""
            }`}
            aria-label="Barre d'outils de l'éditeur"
        >
            {variant === "default-md" && (
                <div className="flex items-center gap-2 mr-3">
                    <Select
                        items={[
                            { id: "Inter", label: "Inter" },
                            { id: "Comic Sans", label: "Comic Sans" },
                            { id: "Serif", label: "Serif" },
                        ]}
                        value={fontFamily}
                        onValueChange={handleFontFamilyChange}
                        triggerClassName="w-[152px]"
                        contentClassName="w-[152px]"
                    />
                    <Select
                        items={[
                            { id: "12px", label: "12px" },
                            { id: "14px", label: "14px" },
                            { id: "16px", label: "16px" },
                            { id: "18px", label: "18px" },
                            { id: "20px", label: "20px" },
                            { id: "22px", label: "22px" },
                        ]}
                        value={fontSize}
                        onValueChange={handleFontSizeChange}
                        triggerClassName="w-[84px]"
                        contentClassName="w-[84px]"
                    />
                </div>
            )}
            <FormattingGroup />
            <Separator />
            <Toolbar.ToggleGroup type="single" aria-label="Couleur du texte">
                <Toolbar.ToggleItem value="text-color" asChild>
                    <TextColor
                        onColorSelect={(color: string) => {
                            editor.chain().focus().setColor(color).run();
                        }}
                        currentColor={editor.getAttributes("textStyle").color}
                    />
                </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
            <Separator />
            <AlignGroup />
            <ListGroup />
            {(variant === "default-md" || variant === "floatting-md") && (
                <>
                    <Separator />
                    <InsertGroup />
                </>
            )}
        </Toolbar.Root>
    );
}
