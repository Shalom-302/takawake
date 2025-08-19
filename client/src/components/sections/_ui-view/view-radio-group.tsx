import Label from "@/components/starter_ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/starter_ui/radio-group";
import { cn } from "@/lib/utils/cn";

export default function ViewRadioGroup() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Radio group"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-wrap gap-2 ">
                        <RadioGroup defaultValue="alpha">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="beta" id="r1" />
                                <Label htmlFor="r1">Default</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="alpha" id="r2" />
                                <Label htmlFor="r2">alpha</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="gamma" id="r3" />
                                <Label htmlFor="r3">Compact</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                        <RadioGroup>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem checked disabled value="lambda" id="r4" />
                                <Label htmlFor="r4">{"Tomate"}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem disabled value="teta" id="r5" />
                                <Label htmlFor="r5">{"Oignon"}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem disabled value="upsilon" id="r6" />
                                <Label htmlFor="r6">{"Piment"}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                        <RadioGroup>
                            <Label
                                htmlFor="radio-1"
                                className={cn(
                                    "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                    "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary",
                                    "has-[:disabled]:bg-[var(--bg-disabled_subtle)] has-[:disabled]:cursor-not-allowed",
                                    "has-[:disabled]:text-gray-400 "
                                )}
                            >
                                <RadioGroupItem
                                    id="radio-1"
                                    value="aaa"
                                    className="bg-[var(--bg-primary)] ring-transparent! size-4.5"
                                />
                                <div className="grid gap-1.5 font-normal">
                                    <p className="text-sm leading-none font-medium">
                                        {"Proposition 1"}
                                    </p>
                                    <p className="text-sm">
                                        {
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                        }
                                    </p>
                                </div>
                            </Label>

                            <Label
                                htmlFor="radio-2"
                                className={cn(
                                    "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                    "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary",
                                    "has-[:disabled]:bg-[var(--bg-disabled_subtle)] has-[:disabled]:cursor-not-allowed",
                                    "has-[:disabled]:text-gray-400 "
                                )}
                            >
                                <RadioGroupItem
                                    id="radio-2"
                                    value="bbb"
                                    disabled={true}
                                    className="bg-[var(--bg-primary)] ring-transparent! size-4.5"
                                />
                                <div className="grid gap-1.5 font-normal">
                                    <p className="text-sm leading-none font-medium">
                                        {"Proposition two "}
                                    </p>
                                    <p className="text-sm">
                                        {
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                        }
                                    </p>
                                </div>
                            </Label>

                            <Label
                                htmlFor="radio-3"
                                className={cn(
                                    "flex items-start gap-2 bg-white rounded-xl p-4 cursor-pointer transition-all",
                                    "has-[[aria-checked=true]]:ring-2 has-[[aria-checked=true]]:ring-primary",
                                    "has-[:disabled]:bg-[var(--bg-disabled_subtle)] has-[:disabled]:cursor-not-allowed",
                                    "has-[:disabled]:text-gray-400 "
                                )}
                            >
                                <RadioGroupItem
                                    id="radio-3"
                                    value="ccc"
                                    className=" ring-transparent! size-4.5"
                                />
                                <div className="grid gap-1.5 font-normal">
                                    <p className="text-sm leading-none font-medium">
                                        {"Proposition 3"}
                                    </p>
                                    <p className="text-sm">
                                        {
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                        }
                                    </p>
                                </div>
                            </Label>
                        </RadioGroup>
                    </div>
                </div>
            </section>
        </>
    );
}
