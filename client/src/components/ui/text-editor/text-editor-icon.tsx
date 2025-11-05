import * as TogglePrimitive from "@radix-ui/react-toggle";
import { Tooltip } from "../tooltip";
import { AlignCenter, AlignJustify, AlignLeft01, AlignRight, Attachment01, Bold01, CodeSnippet02, Dotpoints01, Image01, Italic01, Link01, PlaySquare, Underline01 } from "@untitled-ui/icons-react";
import { cva } from "class-variance-authority";

type TextEditorIconProps = {
    type:
        | "bold"
        | "italic"
        | "underline"
        | "dot-points"
        | "left-align"
        | "center-align"
        | "right-align"
        | "justify"
        | "link"
        | "insert-image"
        | "attach-file"
        | "insert-code"
        | "text-color"
        | "generate"
        | "more"
        | "insert-video";
};

export function TextEditorIcon({ type }: TextEditorIconProps) {
    return (
        <Tooltip
            trigger={<TogglePrimitive.Root className="rounded-md">
              switch (type) {
                case "bold":
                  return <Bold01 className="size-5"/>
                  break;
                case "italic":
                  return <Italic01 className="size-5"/>
                  break;
                case "underline":
                  return <Underline01 className="size-5"/>
                  break;
                case "dot-points":
                  return <Dotpoints01 className="size-5"/>
                  break;
                case "left-align":
                  return <AlignLeft01 className="size-5"/>
                  break;
                case "center-align":
                  return <AlignCenter className="size-5"/>
                  break;
                case "right-align":
                  return <AlignRight className="size-5"/>
                  break;
                case "justify":
                  return <AlignJustify className="size-5"/>
                  break;
                case "link":
                  return <Link01 className="size-5"/>
                  break;
                case "insert-image":
                  return <Image01 className="size-5"/>
                  break;
                case "insert-video":
                  return <PlaySquare className="size-5"/>
                  break;
                case "attach-file":
                  return <Attachment01 className="size-5"/>
                  break;
                case "insert-code":
                  return <CodeSnippet02 className="size-5"/>
                  break;
                case "insert-code":
                  return <CodeSnippet02 className="size-5"/>
                  break;
                case "text-color":
                  return <ColorSelect/>
                  break;
                default:
                  break;
              }
            </TogglePrimitive.Root>}
            title={`${type.split("-").join(" ")}`}
        />
    );
}

const colorVariant= cva("",{
  variants:{
    variant:{
      color:'black'
    }
  },
  defaultVariants:{}
})

function ColorSelect(){
  return <div className="size-5 rounded-full bg-utility-gray-900 border border-black/10 data-[state=on]:outline-[1.5px] data-[state=on]:outline-utility-gray-900 data-[state=on]:outline-offset-2"/>
}