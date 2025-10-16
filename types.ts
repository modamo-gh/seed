import { AuthRequestPromptOptions, AuthSessionResult } from "expo-auth-session";

export type ListContextType = {
    addToList: (item: SpotifyItem, list: "later" | "today") => Promise<void>;
    getLists: () => Promise<void>;
    listenLater: SpotifyItem[];
    listenToday: SpotifyItem[];
    removeFromList: (item: SpotifyItem, list: "later" | "today") => Promise<void>;
    setListenLater: React.Dispatch<React.SetStateAction<SpotifyItem[]>>;
    setListenToday: React.Dispatch<React.SetStateAction<SpotifyItem[]>>;
    updateItemDuration: (item: SpotifyItem, duration: number) => Promise<void>;
    updateItemList: (item: SpotifyItem, newList: List) => Promise<void>;
};

export type List = "later" | "today";

export type Mode = "" | "filter" | "sort";

export type SpotifyContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    promptAsync: (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>;
    refreshAccessToken: () => Promise<void>;
    request: any;
    token: string | null;
    user: any;
};

export type SpotifyItem = {
    createdAt: Date;
    duration?: number;
    imageURL: string;
    list: "later" | "today";
    name: string;
    type: string;
    uri: string;
};
