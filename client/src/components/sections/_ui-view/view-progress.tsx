// import { ProgressBadge } from "@/components/ui/progress-badge";
import { ProgressBadge } from "@/components/ui/progress-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressBarCircle, ProgressBarHalfCircle } from "@/components/ui/progress-circle";

export default function ViewProgress() {
    const tasks = [
        { name: "Créer le design du site", value: 100 },
        { name: "Développer la page d'accueil", value: 80 },
        { name: "Rédiger le contenu", value: 20 },
        { name: "Déployer l'application", value: 0 },
    ];
    return (
        <>
            <section className="border border-primary/10 rounded-lg">
                <div className="px-4 py-2 border-b border-primary/10">
                    <span>{"Progress Indicartors"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <ProgressBarCircle value={25} size="xxs" label="Progrès" />
                        <ProgressBarCircle value={25} size="xs" label="Progrès" />
                        <ProgressBarCircle value={25} size="sm" label="Progrès" />
                        <ProgressBarCircle value={25} size="md" label="Progrès" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ProgressBarHalfCircle value={25} max={100} size="xxs" label="Objectif" />
                        <ProgressBarHalfCircle value={25} max={100} size="xs" label="Objectif" />
                        <ProgressBarHalfCircle value={25} max={100} size="sm" label="Objectif" />
                        <ProgressBarHalfCircle value={25} max={100} size="md" label="Objectif" />
                    </div>

                    <div className="space-y-8">
                        <ProgressBar value={25} />
                        <ProgressBar value={45} labelPosition="right" />
                        <ProgressBar value={75} labelPosition="top-floating" />
                        <ProgressBar value={25000} max={50000} labelPosition="bottom" />
                    </div>
                    <div className="flex flex-col gap-4">
                        {tasks.map((task, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                            >
                                <span className="font-medium text-lg">{task.name}</span>
                                <ProgressBadge value={task.value} size="md" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
