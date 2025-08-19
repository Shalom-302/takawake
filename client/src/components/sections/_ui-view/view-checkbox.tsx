import { Checkbox } from "@/components/ui/checkbox";
import Label from "@/components/starter_ui/label";
import { cn } from "@/lib/utils/cn";

export default function ViewCheckbox() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Checkbox"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-wrap gap-2 ">
                        <Checkbox id="one" />
                        <Checkbox id="two" disabled={true} />
                        <Checkbox id="three" checked disabled={true} />
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                        <Label
                            htmlFor="toggle"
                            className={cn(
                                "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary",
                                "has-[:disabled]:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:text-gray-400 ",
                                "has-[[aria-checked=true][disabled]]:ring-muted"
                            )}
                        >
                            <Checkbox
                                id="toggle"
                                defaultChecked
                                className=" ring-transparent! size-4.5 rounded-sm [&_svg]:scale-90"
                            />
                            <div className="grid gap-1.5 font-normal">
                                <p className="text-sm leading-none font-medium">
                                    {"Enable sdf notifications"}
                                </p>
                                <p className="text-sm">
                                    {
                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                    }
                                </p>
                            </div>
                        </Label>
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                        <Label
                            htmlFor="aaa"
                            className={cn(
                                "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary/50",
                                "has-[:disabled]:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:text-gray-400 ",
                                "has-[[aria-checked=true][disabled]]:ring-muted"
                            )}
                        >
                            <Checkbox
                                id="aaa"
                                disabled={true}
                                checked={true}
                                className="bg-[var(--bg-primary)] ring-transparent! size-4.5 rounded-sm [&_svg]:scale-90"
                            />
                            <div className="grid gap-1.5 font-normal">
                                <p className="text-sm leading-none font-medium">
                                    {"Enable notifications"}
                                </p>
                                <p className="text-sm">
                                    {
                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                    }
                                </p>
                            </div>
                        </Label>
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                        <Label
                            htmlFor="bbb"
                            className={cn(
                                "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary",
                                "has-[:disabled]:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:text-gray-400 ",
                                "has-[[aria-checked=true][disabled]]:ring-muted"
                            )}
                        >
                            <Checkbox
                                id="bbb"
                                disabled={true}
                                checked={false}
                                className="bg-[var(--bg-primary)] ring-transparent! size-4.5 rounded-sm [&_svg]:scale-90"
                            />
                            <div className="grid gap-1.5 font-normal">
                                <p className="text-sm leading-none font-medium">
                                    {"Enable notifications"}
                                </p>
                                <p className="text-sm">
                                    {
                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                    }
                                </p>
                            </div>
                        </Label>
                    </div>
                </div>
            </section>
        </>
    );
}
