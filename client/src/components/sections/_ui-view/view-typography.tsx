export default function ViewTypography() {
    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Typography"}</span>
                </div>
                <div className="px-4 py-6 ">
                    <h1 className="text-display-2xl">{"Mon texte ici"}</h1>
                    <h1 className="text-display-xl">{"Mon texte ici"}</h1>
                    <h1 className="text-display-lg">{"Mon texte ici"}</h1>
                    <h1 className="text-display-md">{"Mon texte ici"}</h1>
                    <h1 className="text-display-sm">{"Mon texte ici"}</h1>
                    <h1 className="text-display-xs">{"Mon texte ici"}</h1>
                    <p className="text-xl">{"Mon texte ici"}</p>
                    <p className="text-lg">{"Mon texte ici"}</p>
                    <p className="text-md">{"Mon texte ici"}</p>
                    <p className="text-sm">{"Mon texte ici"}</p>
                    <p className="text-xs">{"Mon texte ici"}</p>
                </div>
            </section>
        </>
    );
}
