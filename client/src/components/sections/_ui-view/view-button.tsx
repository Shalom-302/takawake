import { AlertTriangle } from "@/components/icons";
import Button from "@/components/starter_ui/button";

export default function ViewButton() {
    return (
        <section className="border border-neutral-200 rounded-lg">
            <div className="px-4 py-2 border-b border-neutral-200">
                <span>{"Button"}</span>
            </div>
            <div className="px-4 py-6 space-y-4 ">
                <div className=" flex flex-wrap gap-4">
                    <Button disabled>
                        <AlertTriangle size={20} />
                        {"Button"}
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"md"} isLoading>
                        <AlertTriangle size={20} />
                        {"Button"}
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"lg"}>
                        <AlertTriangle size={20} />
                        {"Button"}
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"xl"}>
                        <AlertTriangle size={20} />
                        {"Button"}
                        <AlertTriangle size={20} />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4 size">
                    <Button size={"icon-sm"} disabled>
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"icon-md"} isLoading>
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"icon-lg"}>
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"icon-xl"}>
                        <AlertTriangle size={20} />
                    </Button>
                    <Button size={"icon-xl"}>
                        <AlertTriangle size={20} />
                    </Button>
                </div>
            </div>
        </section>
    );
}
