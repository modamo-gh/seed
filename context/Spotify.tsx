import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { SpotifyContextType } from "~/types";
import { supabase } from "~/utils/supabase";

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
            clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
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

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const savedAccessToken = await AsyncStorage.getItem("llamify_access_token");
                const savedUser = await AsyncStorage.getItem("llamify_user");
                const expiresAt = await AsyncStorage.getItem("llamify_expires_at");

                if (savedAccessToken) {
                    if (!expiresAt || Date.now() > parseInt(expiresAt)) {
                        await refreshAccessToken();
                    } else {
                        setToken(savedAccessToken);
                    }
                }

                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch {}
        };

        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;

            exchangeCodeForToken(code);
        }
    }, [response]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const interval = setInterval(
            () => {
                refreshAccessToken();
            },
            48 * 60 * 1000
        );

        return () => clearInterval(interval);
    }, [token]);

    const exchangeCodeForToken = async (code: string) => {
        setLoading(true);

        try {
            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${makeRedirectUri({
                    scheme: "llamify",
                })}&client_id=${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID}&code_verifier=${request?.codeVerifier}`,
            });

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            const refreshToken = tokenData.refresh_token;

            if (accessToken) {
                setToken(accessToken);

                const expiresAt = Date.now() + 3600 * 1000;

                await AsyncStorage.setItem("llamify_access_token", accessToken);
                await AsyncStorage.setItem("llamify_expires_at", expiresAt.toString());
                await AsyncStorage.setItem("llamify_refresh_token", refreshToken);

                const userResponse = await fetch("https://api.spotify.com/v1/me", {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                });

                const userData = await userResponse.json();

                setUser(userData);

                await AsyncStorage.setItem("llamify_user", JSON.stringify(userData));

                await supabase.from("users").upsert({ id: userData.id });
            }
        } catch (error) {
            console.error("Token exchange failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem("llamify_refresh_token");

            if (!refreshToken) {
                setToken(null);

                return;
            }

            const response = await fetch("https://accounts.spotify.com/api/token", {
                body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID}`,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                method: "POST",
            });
            const data = await response.json();

            if (data.access_token) {
                const expiresAt = Date.now() + 3600 * 1000;

                setToken(data.access_token);

                await AsyncStorage.setItem("llamify_access_token", data.access_token);
                await AsyncStorage.setItem("llamify_expires_at", expiresAt.toString());
            } else {
                setToken(null);

                await AsyncStorage.multiRemove(["llamify_access_token", "llamify_refresh_token"]);
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
        }
    };

    const value = {
        isAuthenticated: !!token,
        loading,
        refreshAccessToken,
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
