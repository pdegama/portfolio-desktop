import api, { API_BASE_URL } from "@/lib/api";
import { useDockStore } from "@/store/dock";
import { Button } from "@base-ui/react";
import { useEffect, useRef } from "react"
import { LuMusic2, LuX, LuPlay, LuPause } from "react-icons/lu";

const formatTime = (time?: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const MusicExtrantion = () => {
    const setDockExtrantion = useDockStore(s => s.setExtrantion)
    const setMusic = useDockStore(s => s.setMusic)
    const musicConfig = useDockStore(s => s.musicConfig)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (!musicConfig?.file) return
        api.get(`/api/music?path=${musicConfig.file}`).then(res => {
            setMusic({
                ...res.data.data,
                title: res.data.data.title || musicConfig.file.split('/').pop(),
                playing: true,
            })
        })
    }, [musicConfig?.file])

    useEffect(() => {
        if (audioRef.current && musicConfig) {
            if (musicConfig.playing) {
                audioRef.current.play().catch(e => console.error("Audio playback error:", e))
            } else {
                audioRef.current.pause()
            }
        }
    }, [musicConfig?.playing, musicConfig?.file])

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setMusic({
                currentTime: audioRef.current.currentTime,
            })
        }
    }

    const handleAudioEnded = () => {
        setMusic({ playing: false })
    }

    if (!musicConfig) return null;

    return (
        <>
            {musicConfig.file && (
                <audio
                    ref={audioRef}
                    src={`${API_BASE_URL}/api/files/serve/${musicConfig.file.replace(/^\//, '')}`}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    onPlay={() => setMusic({ playing: true })}
                    onPause={() => setMusic({ playing: false })}
                    onLoadedMetadata={(e) => setMusic({ duration: e.currentTarget.duration })}
                    autoPlay
                />
            )}
            <div
                className="z-9999 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 flex-1 max-w-[400px] shadow-lg"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div
                    className="w-9 h-9 rounded-full bg-cover bg-center bg-primary shrink-0 overflow-hidden shadow-sm animate-[spin_5s_linear_infinite]"
                    style={{ animationPlayState: musicConfig.playing ? 'running' : 'paused' }}
                >
                    {
                        musicConfig.cover ? (
                            <img src={musicConfig.cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-primary/20">
                                <LuMusic2 className="text-white text-xl" />
                            </div>
                        )
                    }
                </div>

                <div className="flex flex-col min-w-0 flex-1 justify-center gap-1">
                    <div className="flex justify-between items-end gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                                {musicConfig.title || (musicConfig.file ? musicConfig.file.split('/').pop() : 'Unknown Title')}
                            </p>
                            {/* <p className="text-xs text-muted-foreground truncate">
                                {musicConfig.artist || 'Unknown Artist'}
                            </p> */}
                        </div>
                        <div className="text-[10px] pb-0.5 text-muted-foreground whitespace-nowrap shrink-0">
                            {formatTime(musicConfig.currentTime)} / {formatTime(musicConfig.duration)}
                        </div>
                    </div>

                    {/* <input
                        type="range"
                        min={0}
                        max={musicConfig.duration || 100}
                        value={musicConfig.currentTime || 0}
                        onChange={handleSeek}
                        className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full"
                    /> */}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        onClick={() => setMusic({ playing: !musicConfig.playing })}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors"
                    >
                        {musicConfig.playing ? <LuPause size={18} /> : <LuPlay size={18} className="translate-x-0.5" />}
                    </Button>
                    <Button
                        onClick={() => setDockExtrantion("none")}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors"
                    >
                        <LuX size={18} />
                    </Button>
                </div>
            </div>
        </>
    )
}