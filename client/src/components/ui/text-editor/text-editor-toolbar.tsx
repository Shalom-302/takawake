"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import { type Editor } from "@tiptap/react";
import { TextEditorIcon } from "./text-editor-icon";
import { cn } from "@/lib/utils/cn";
import { TextColor } from "./text-color";

type TextEditorToolbarProps = {
    editor?: Editor;
    variant?: "simple" | "advanced";
};

export function TextEditorToolbar({ editor, variant = "simple" }: TextEditorToolbarProps) {
    const insertLink = () => {
        const url = window.prompt("Enter URL:");
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    };

    const Separator = () => <Toolbar.Separator className="h-6 w-px bg-border mx-1" />;

    const FormattingGroup = () => (
        <Toolbar.ToggleGroup type="multiple" className="flex gap-1" aria-label="Formatting">
            <Toolbar.ToggleItem value="bold" aria-label="Bold" asChild>
                <TextEditorIcon
                    type="bold"
                    isActive={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                />
            </Toolbar.ToggleItem>

            <Toolbar.ToggleItem value="italic" aria-label="Italic" asChild>
                <TextEditorIcon
                    type="italic"
                    isActive={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                />
            </Toolbar.ToggleItem>

            <Toolbar.ToggleItem value="underline" aria-label="Underline" asChild>
                <TextEditorIcon
                    type="underline"
                    isActive={editor?.isActive("underline")}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                />
            </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
    );

    const ListGroup = () => (
        <Toolbar.ToggleGroup type="single" aria-label="Lists">
            <Toolbar.ToggleItem value="bulletList" aria-label="Bullet list" asChild>
                <TextEditorIcon
                    type="dot-points"
                    isActive={editor?.isActive("bulletList")}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                />
            </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
    );

    const AlignGroup = () => {
        const alignMap = {
            left: "left-align",
            center: "center-align",
        } as const;

        return (
            <Toolbar.ToggleGroup
                type="single"
                aria-label="Text alignment"
                defaultValue={editor?.getAttributes("paragraph").textAlign || "left"}
                onValueChange={value =>
                    value &&
                    editor
                        ?.chain()
                        .focus()
                        .updateAttributes("paragraph", { textAlign: value })
                        .run()
                }
                className="flex gap-1"
            >
                {(["left", "center"] as const).map(align => {
                    const iconType = alignMap[align];
                    return (
                        <Toolbar.ToggleItem
                            key={align}
                            value={align}
                            aria-label={`Align ${align}`}
                            asChild
                        >
                            <TextEditorIcon
                                type={iconType}
                                isActive={editor?.isActive({ textAlign: align })}
                            />
                        </Toolbar.ToggleItem>
                    );
                })}
            </Toolbar.ToggleGroup>
        );
    };

    const InsertGroup = () => (
        <Toolbar.ToggleGroup
            type="single"
            defaultValue=""
            aria-label="Insert elements"
            className="flex gap-1"
        >
            <TextEditorIcon type="link" isActive={editor?.isActive("link")} onClick={insertLink} />
            <TextEditorIcon
                type="insert-image"
                onClick={() => alert("Image upload not implemented")}
            />
            <TextEditorIcon
                type="insert-video"
                onClick={() => alert("Video upload not implemented")}
            />
            <TextEditorIcon
                type="attach-file"
                onClick={() => alert("File upload not implemented")}
            />
            <TextEditorIcon
                type="insert-code"
                isActive={editor?.isActive("code")}
                onClick={() => editor?.chain().focus().toggleCode().run()}
            />
        </Toolbar.ToggleGroup>
    );

    return (
        <Toolbar.Root
            className={cn(
                "flex flex-wrap items-center gap-1",
                "data-[orientation=vertical]:flex-col"
            )}
            aria-label="Text editor toolbar"
        >
            <FormattingGroup />

            <Separator />
            <Toolbar.ToolbarToggleGroup type="single" aria-label="Text Colors">
                <Toolbar.ToggleItem value="text-color" asChild>
                    <TextColor
                        onColorSelect={(color: string) => {
                            if (!editor) return;
                            const chain = editor.chain().focus();
                            chain.setMark("textStyle", { color }).run();
                        }}
                        currentColor={editor?.getAttributes("textStyle").color ?? undefined}
                    />
                </Toolbar.ToggleItem>
            </Toolbar.ToolbarToggleGroup>
            <Separator />
            <AlignGroup />
            <ListGroup />
            {variant === "advanced" && (
                <>
                    <Separator />
                    <InsertGroup />
                </>
            )}
        </Toolbar.Root>
    );
}
