import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Download,
} from "lucide-react";

interface AudioPlayerProps {
    url: string;
    title: string;
    onDownload: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, title, onDownload }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loop, setLoop] = useState(false);

    // Ajouter les écouteurs d'événements à l'élément audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoadedData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const onEnded = () => {
            if (!loop) {
                setIsPlaying(false);
            }
        };

        // Ajouter les écouteurs
        audio.addEventListener("loadeddata", onLoadedData);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);

        // Cleanup
        return () => {
            audio.removeEventListener("loadeddata", onLoadedData);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
        };
    }, [loop]);

    // Gérer la lecture/pause
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(error => console.error("Erreur de lecture audio:", error));
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    // Gérer le volume
    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = !audio.muted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        const audio = audioRef.current;
        if (audio) {
            audio.volume = newVolume;
            audio.muted = newVolume === 0;
            setIsMuted(newVolume === 0);
        }
    };

    // Gérer la progression
    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);

        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = newTime;
        }
    };

    // Avancer/reculer
    const handleSkip = (seconds: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        audio.currentTime = newTime;
    };

    // Gérer le mode de répétition
    const toggleLoop = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.loop = !loop;
        setLoop(!loop);
    };

    // Formater le temps (secondes -> MM:SS)
    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="rounded-lg overflow-hidden bg-white shadow border border-gray-200">
            {/* Titre et visualisation */}
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium mb-3">{title}</h3>

                {/* Visualisation audio */}
                <div className="h-16 bg-gray-100 rounded-md relative overflow-hidden flex items-center justify-center">
                    {isLoading ? (
                        <div className="animate-pulse flex space-x-1 justify-center">
                            <div className="h-8 w-1 bg-gray-300 rounded"></div>
                            <div className="h-12 w-1 bg-gray-300 rounded"></div>
                            <div className="h-10 w-1 bg-gray-300 rounded"></div>
                            <div className="h-14 w-1 bg-gray-300 rounded"></div>
                            <div className="h-6 w-1 bg-gray-300 rounded"></div>
                            <div className="h-10 w-1 bg-gray-300 rounded"></div>
                            <div className="h-8 w-1 bg-gray-300 rounded"></div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full space-x-1">
                            {[...Array(20)].map((_, i) => {
                                const height = isPlaying
                                    ? Math.floor(Math.random() * 60) + 20
                                    : Math.sin(i / 3) * 30 + 30;

                                return (
                                    <div
                                        key={i}
                                        className={`w-1 bg-blue-500 rounded transition-all duration-100 ease-in-out ${isPlaying ? "animate-pulse" : ""}`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                );
                            })}
                        </div>
                    )}

                    {/* Audio element (caché) */}
                    <audio ref={audioRef} src={url} preload="metadata" />
                </div>
            </div>

            {/* Contrôles */}
            <div className="p-4">
                {/* Barre de progression */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="flex-grow mx-3 h-1 bg-gray-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                    <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                </div>

                {/* Boutons de contrôle */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSkip(-10)}
                            className="h-8 w-8"
                        >
                            <SkipBack size={18} />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlay}
                            className="h-10 w-10 rounded-full"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSkip(10)}
                            className="h-8 w-8"
                        >
                            <SkipForward size={18} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleLoop}
                            className={`h-8 w-8 ${loop ? "text-blue-500" : ""}`}
                        >
                            <Repeat size={16} />
                        </Button>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="h-8 w-8"
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </Button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDownload}
                            className="h-8 w-8"
                        >
                            <Download size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
