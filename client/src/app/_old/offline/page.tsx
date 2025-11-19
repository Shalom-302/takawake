import React from "react";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-700 text-white p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-white/20">
                <div className="mb-8 text-center">
                    <div className="text-6xl mb-2">📶</div>
                    <h1 className="text-2xl font-bold mb-2">Vous êtes hors ligne</h1>
                    <div className="h-1 w-20 bg-indigo-400 mx-auto rounded-full mb-4"></div>
                    <p className="opacity-80">
                        Impossible de se connecter au serveur. Vérifiez votre connexion internet et
                        réessayez.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <h2 className="font-medium mb-2">Que pouvez-vous faire?</h2>
                        <ul className="list-disc pl-5 space-y-1 opacity-80 text-sm">
                            <li>Vérifier votre connexion WiFi ou données mobiles</li>
                            <li>Activer le mode avion puis le désactiver</li>
                            <li>
                                Vérifier si d&apos;autres applications peuvent accéder à internet
                            </li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={() => window.location.reload()}
                            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
                        >
                            Actualiser
                        </button>

                        <Link
                            href="/"
                            className="py-2 px-4 bg-white/20 hover:bg-white/30 text-center rounded-lg transition-colors duration-200"
                        >
                            Accueil
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm opacity-60">
                    <p>Certaines fonctionnalités restent disponibles hors ligne</p>
                </div>
            </div>
        </div>
    );
}
