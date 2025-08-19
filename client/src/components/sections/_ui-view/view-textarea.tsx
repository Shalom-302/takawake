"use client";

import Label from "@/components/starter_ui/label";
import { Textarea } from "@/components/starter_ui/textarea";

export default function ViewTextarea() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Input textarea"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="space-y-4 px-2 ">
                        <div className="space-y-2">
                            <Label htmlFor="pwd">
                                {"Your message"}
                                &nbsp;
                                <span className="text-destructive/60">{"*"}</span>
                            </Label>
                            <Textarea id={"message"} placeholder="Write all here" rows={5} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pwd">
                                {"Your message"}
                                &nbsp;
                                <span className="text-destructive/60">{"*"}</span>
                            </Label>
                            <Textarea
                                id={"message"}
                                placeholder="Write all here"
                                rows={5}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pwd">
                                {"Your message"}
                                &nbsp;
                                <span className="text-destructive/60">{"*"}</span>
                            </Label>
                            <Textarea
                                id={"message"}
                                placeholder="Write all here"
                                rows={5}
                                aria-invalid={true}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
