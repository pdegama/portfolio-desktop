// simple dock store

import { create } from "zustand"

export type DockExtrantionType = "music" | "none"
export type MusicConfig = {
    file: string,
    loading: boolean,
    title: string,
    artist: string,
    album: string,
    cover: string,
    playing: boolean,
    duration: number,
    currentTime: number,
}

interface DockStore {
    extrantion: DockExtrantionType
    musicConfig?: MusicConfig,
    setExtrantion: (extrantion: DockExtrantionType) => void,
    setMusic: (data: Partial<MusicConfig>) => void,
}

export const useDockStore = create<DockStore>((set) => ({
    extrantion: "none",
    musicConfig: undefined,
    setExtrantion: (extrantion: DockExtrantionType) => set(s => ({
        ...s,
        extrantion: extrantion,
    })),
    setMusic: (data: Partial<MusicConfig>) => set((state) => ({
        ...state,
        musicConfig: state.musicConfig ? { ...state.musicConfig, ...data } : data as MusicConfig,
    })),
}))