import CircularProgress from "@/components/starter_ui/circular-progress";
import InlineProgress from "@/components/starter_ui/inline-progress";

export default function ViewProgress() {
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Progress"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div>
                        <CircularProgress
                            progress={25}
                            size={80}
                            strokeWidth={10}
                            withPercentInside
                            percentClassNames={"text-sm font-medium"}
                        />
                    </div>

                    <InlineProgress progress={25} percentPosition={"top"} />
                    <InlineProgress progress={46} />
                    <InlineProgress progress={25} percentPosition={"right"} />
                    <InlineProgress progress={25} percentPosition={"bottom"} />
                </div>
            </section>
        </>
    );
}
