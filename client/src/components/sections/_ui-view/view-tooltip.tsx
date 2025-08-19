import { AlertTriangle, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/starter_ui/tooltip";

export default function ViewTooltip() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Tooltip"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-wrap gap-6 ">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="text-xs font-medium">{"This is a tooltip"}</span>
                            </TooltipContent>
                        </Tooltip>
                        <div>&bull;</div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        {"Hover me for long tooltip"}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] p-4 ">
                                <span className="text-xs font-medium">{"This is a tooltip"}</span>
                                <p className="mt-1">
                                    {
                                        "ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
                                    }
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex flex-wrap gap-6 ">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <ChevronLeftIcon size={20} />
                                    <span className="text-sm font-medium">{"To left"}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <span className="text-xs font-medium">{"This is a tooltip"}</span>
                            </TooltipContent>
                        </Tooltip>
                        <div>&bull;</div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{"To right"}</span>
                                    <ChevronRightIcon size={20} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <span className="text-xs font-medium">{"This is a tooltip"}</span>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </section>
        </>
    );
}
