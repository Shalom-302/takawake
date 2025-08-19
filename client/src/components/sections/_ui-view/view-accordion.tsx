"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import ReorderBloc from "@/components/starter_ui/reorder";

export default function ViewAccordion() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Accordion"}</span>
                </div>
                <div className="px-4 py-6 space-y-5 mb-5">
                    <Accordion closeOthers={true} className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger value="item-1">
                                <div className="flex items-center justify-between">
                                    <span>ddv</span>
                                    dfvd
                                </div>
                            </AccordionTrigger>
                            <AccordionContent value="item-1">
                                Yes. It adheres to the WAI-ARIA design pattern.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger value="item-2">Is it styled?</AccordionTrigger>
                            <AccordionContent value="item-2">
                                Yes. It comes with default styles that match the other
                                components&apos; aesthetic.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger value="item-3">Is it animated?</AccordionTrigger>
                            <AccordionContent value="item-3">
                                Yes. It&apos;s animated by default, but you can disable it if you
                                prefer.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </>
    );
}
