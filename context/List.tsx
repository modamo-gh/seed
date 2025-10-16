import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { List, ListContextType, SpotifyItem } from "~/types";
import { supabase } from "~/utils/supabase";
import { useSpotify } from "./Spotify";

const ListContext = createContext<ListContextType | null>(null);

export const ListProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useSpotify();

    const [listenLater, setListenLater] = useState<SpotifyItem[]>([]);
    const [listenToday, setListenToday] = useState<SpotifyItem[]>([]);

    useEffect(() => {
        if (user?.id) {
            getLists();
        }
    }, [user?.id]);

    const addToList = async (item: SpotifyItem, list: "later" | "today") => {
        if (list === "later") {
            setListenLater((prev) => [...prev, item]);
        } else {
            setListenToday((prev) => [...prev, item]);
        }

        try {
            await supabase.from("items").insert({
                duration: item.duration,
                image_url: item.imageURL,
                list,
                name: item.name,
                type: item.type,
                uri: item.uri,
                user_id: user.id,
            });
        } catch (error) {
            console.error("Supabase insert error:", error);
        }
    };

    const getLists = async () => {
        try {
            const { data, error } = await supabase.from("items").select("*").eq("user_id", user.id);

            if (error) {
                throw error;
            }

            const transformItem = (item) => {
                return {
                    createdAt: new Date(item.created_at),
                    duration: item.duration,
                    imageURL: item.image_url,
                    list: item.list,
                    name: item.name,
                    type: item.type,
                    uri: item.uri,
                    userID: item.user_id,
                };
            };

            const later = data.filter((item) => item.list === "later").map(transformItem);
            const today = data.filter((item) => item.list === "today").map(transformItem);

            setListenLater(later);
            setListenToday(today);
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };

    const removeFromList = async (item: SpotifyItem, list: List) => {
        try {
            if (list === "later") {
                setListenLater((prev) => prev.filter((i) => i.uri !== item.uri));
            } else {
                setListenToday((prev) => prev.filter((i) => i.uri !== item.uri));
            }

            await supabase
                .from("items")
                .delete()
                .eq("user_id", user.id)
                .eq("uri", item.uri)
                .eq("list", list);
        } catch (error) {}
    };

    const updateItemDuration = async (item: SpotifyItem, duration: number) => {
        try {
            await supabase
                .from("items")
                .update({ duration })
                .eq("user_id", user.id)
                .eq("uri", item.uri);
        } catch (error) {}
    };

    const updateItemList = async (item: SpotifyItem, newList: List) => {
        try {
            await supabase
                .from("items")
                .update({ list: newList })
                .eq("user_id", user.id)
                .eq("uri", item.uri);
        } catch (error) {}
    };

    const value = {
        addToList,
        getLists,
        listenLater,
        listenToday,
        removeFromList,
        setListenLater,
        setListenToday,
        updateItemDuration,
        updateItemList,
    };

    return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

export const useList = () => {
    const context = useContext(ListContext);

    if (!context) {
        throw new Error("useList must be used within ListProvider");
    }

    return context;
};
