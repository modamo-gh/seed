import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { createContext, ReactNode, useContext, useState } from "react";
import { SpotifyContextType } from "../types";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const SpotifyContext = createContext<null | SpotifyContextType>(null);

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
            scopes: [
                "user-read-email",
                "user-read-private",
                "user-read-playback-state",
                "user-modify-playback-state",
                "streaming",
                "playlist-read-private",
                "playlist-read-collaborative",
            ],
            usePKCE: true,
            redirectUri: makeRedirectUri({
                scheme: "llamify",
            }),
        },
        discovery
    );

    const value = {
        isAuthenticated: !!token,
        loading,
        refreshAccessToken: async () => {},
        request,
        promptAsync,
        token,
        user,
    };

    return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
    const context = useContext(SpotifyContext);

    if (!context) {
        throw new Error("useSpotify must be used within SpotifyProvider");
    }

    return context;
};