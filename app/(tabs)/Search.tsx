import { useMemo, useState } from "react";
import {
    Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const getDuration = async (
    item: any,
    type: string,
    token: null | string
): Promise<null | number> => {
    let data;
    let duration = 0;
    let id = item.id || item.uri.split(":")[2];
    let response;
    let url;

    if (type === "albums") {
        url = `https://api.spotify.com/v1/albums/${id}/tracks?limit=50`;

        do {
            response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await response.json();

            data.items.forEach((track) => (duration += track?.duration_ms));

            url = data.next;
        } while (url);

        return duration;
    }

    if (type === "audiobooks") {
        url = `https://api.spotify.com/v1/audiobooks/${id}/chapters?limit=50`;

        do {
            response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await response.json();

            data.items.forEach((chapter) => (duration += chapter?.duration_ms));

            url = data.next;
        } while (url);

        return duration;
    }

    if (type === "episodes") {
        if (item?.duration_ms) {
            return item?.duration_ms;
        }

        url = `https://api.spotify.com/v1/episodes/${id}`;
        response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        data = await response.json();

        return data.duration_ms;
    }

    if (type === "playlists") {
        url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50`;

        do {
            response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await response.json();

            data.items.forEach((i) => (duration += i?.track?.duration_ms || 0));

            url = data.next;
        } while (url);

        return duration;
    }

    return null;
};

const Search = () => {
    // const { addToList, listenLater, listenToday } = useList();

    const snapPoints = useMemo(() => ["25%"], []);

    // const ref = useRef<BottomSheet>(null);

    // const { token, user } = useSpotify();

    const [inListenLater, setInListenLater] = useState(false);
    const [inListenToday, setInListenToday] = useState(false);
    const [isRetrievingResults, setIsRetrievingResults] = useState(false);
    // const [searchResults, setSearchResults] = useState<SpotifyItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    // const [selectedItem, setSelectedItem] = useState<null | SpotifyItem>(null);
    const [showBottomSheet, setShowBottomSheet] = useState(false);

    // const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    //     let timeOutID: NodeJS.Timeout;

    //     return (...args: Parameters<T>) => {
    //         if (timeOutID) {
    //             clearTimeout(timeOutID);
    //         }

    //         timeOutID = setTimeout(() => {
    //             func(...args);
    //         }, delay);
    //     };
    // };

    // const getDebouncedResults = useCallback(
    //     debounce(async (term: string) => {
    //         if (!term) {
    //             return;
    //         }

    //         try {
    //             setIsRetrievingResults(true);

    //             const results = await fetch(
    //                 `https://api.spotify.com/v1/search?q=${encodeURIComponent(term.trim())}&type=album,artist,audiobook,episode,playlist,show,track&limit=5`,
    //                 {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 }
    //             );
    //             const data = await results.json();
    //             const r: SpotifyItem[] = [];

    //             for (const type in data) {
    //                 if (type === "tracks") {
    //                     r.push(
    //                         ...data[type]?.items?.map(
    //                             (item) =>
    //                                 ({
    //                                     imageURL:
    //                                         item?.album?.images?.[0]?.url ||
    //                                         "https://placehold.co/400x400/1DB954/FFFFFF/png?text=No+Image",
    //                                     duration: item?.duration_ms,
    //                                     name: item.name || "",
    //                                     type,
    //                                     uri: item.uri,
    //                                 }) as SpotifyItem
    //                         )
    //                     );
    //                 } else {
    //                     const promises = data[type]?.items?.filter(Boolean).map(async (item) => {
    //                         return {
    //                             imageURL:
    //                                 item?.images?.[0]?.url ||
    //                                 "https://placehold.co/400x400/22C55E/FAFAFA/png?text=No+Image",
    //                             duration: await getDuration(item, type, token),
    //                             name: item?.name || "",
    //                             type,
    //                             uri: item.uri,
    //                         } as unknown as SpotifyItem;
    //                     });

    //                     const resolvedItems = await Promise.all(promises);

    //                     r.push(...resolvedItems);
    //                 }
    //             }

    //             for (let i = r.length - 1; i >= 0; i--) {
    //                 const j = Math.floor(Math.random() * (i + 1));

    //                 [r[i], r[j]] = [r[j], r[i]];
    //             }

    //             setSearchResults(r);
    //         } catch (error) {
    //         } finally {
    //             setIsRetrievingResults(false);
    //         }
    //     }, 400),
    //     [token]
    // );

    const screenWidth = Dimensions.get("screen").width;
    const imageDimension = (screenWidth - 40) / 2;

    const bottomSheetOptionHeight = Dimensions.get("window").height / 15;

    return (
        <SafeAreaView className="flex flex-1 bg-neutral-900" edges={["top"]}>
            {/* <View className="flex w-full flex-1 flex-row gap-4 px-4">
                <View className="flex flex-1 flex-row items-center rounded-lg border border-green-500 px-2">
                    <TextInput
                        className="flex-1 text-zinc-50"
                        onChangeText={(term) => {
                            setSearchTerm(term);

                            if (term.length) {
                                getDebouncedResults(term);
                            } else {
                                setSearchResults([]);
                            }
                        }}
                        onEndEditing={() => Keyboard.dismiss()}
                        onPress={() => {
                            ref.current?.close();
                            setShowBottomSheet(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        placeholder="Enter a search term or Spotify URL"
                        placeholderTextColor="#7D7D7D"
                        value={searchTerm}
                    />
                    {searchTerm.length ? (
                        <Pressable
                            className="flex h-12 w-12 items-center justify-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                setSearchTerm("");
                                setSearchResults([]);
                            }}>
                            <Feather color="#FAFAFA" name="x" size={20} />
                        </Pressable>
                    ) : null}
                </View>
                <Image
                    className="aspect-square max-h-full max-w-full rounded-lg"
                    source={{ uri: user?.images?.[0]?.url }}
                />
            </View>
            <Pressable
                className={`${!searchResults.length && "items-center justify-center"} flex w-full flex-[9] p-4`}
                onPress={() => Keyboard.dismiss()}>
                {searchResults.length ? (
                    <FlatList
                        className="w-full flex-1"
                        columnWrapperClassName="gap-4"
                        contentContainerClassName="gap-4"
                        data={isRetrievingResults ? Array.from({ length: 8 }) : searchResults}
                        keyExtractor={(item, index) => `${index}`}
                        numColumns={2}
                        renderItem={({ item }) =>
                            isRetrievingResults ? (
                                <View
                                    className="animate-pulse rounded-lg bg-neutral-800 p-2"
                                    style={{ height: imageDimension, width: imageDimension }}
                                />
                            ) : (
                                <Pressable
                                    className="active:opacity-80"
                                    onPress={() => {
                                        setSelectedItem(item);

                                        const ilt = listenToday.some((i) => i.uri === item.uri);
                                        const ill = listenLater.some((i) => i.uri === item.uri);

                                        if (!ill || !ilt) {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        } else {
                                            Haptics.notificationAsync(
                                                Haptics.NotificationFeedbackType.Error
                                            );

                                            Toast.show({
                                                backgroundColor: "#262626",
                                                position: "bottom",
                                                progressBarColor: "#EF4444",
                                                textColor: "#FAFAFA",
                                                text1: "Item exists in both lists already",
                                                type: "error",
                                            });
                                        }

                                        setShowBottomSheet(!ill || !ilt);
                                        setInListenToday(ilt);
                                        setInListenLater(ill);
                                    }}>
                                    <View
                                        className="flex gap-2 rounded-lg bg-neutral-800 p-2 shadow-lg"
                                        style={{ width: imageDimension }}>
                                        <Image
                                            className="aspect-square w-full rounded-lg"
                                            source={{ uri: item.imageURL }}
                                        />
                                        <Text className="text-zinc-50" numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text className="text-zinc-50/80">
                                            {item.type[0].toUpperCase()}
                                            {item.type.slice(1, item.type.length - 1)}
                                        </Text>
                                    </View>
                                </Pressable>
                            )
                        }
                    />
                ) : (
                    <Text className="text-xl text-zinc-50">Search for Items above</Text>
                )}
            </Pressable>
            {showBottomSheet && (
                <BottomSheet
                    backgroundStyle={{ backgroundColor: "#22C55E" }}
                    enablePanDownToClose
                    index={showBottomSheet ? 1 : -1}
                    onClose={() => setShowBottomSheet(false)}
                    ref={ref}
                    snapPoints={snapPoints}>
                    <BottomSheetView className="bg-green-500">
                        <Pressable
                            className="flex w-full items-center justify-center disabled:opacity-80"
                            disabled={inListenToday}
                            style={{ height: bottomSheetOptionHeight }}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                addToList({ ...selectedItem!, createdAt: new Date() }, "today");

                                ref.current?.close();

                                Toast.show({
                                    backgroundColor: "#262626",
                                    position: "bottom",
                                    progressBarColor: "#22C55E",
                                    textColor: "#FAFAFA",
                                    text1: "Item successfully added to Listen Today!",
                                    type: "success",
                                });
                            }}>
                            <Text className="text-xl font-bold text-zinc-50">
                                {inListenToday ? "Already in " : "Add to "}Listen Today
                            </Text>
                        </Pressable>
                        <Pressable
                            className="flex w-full items-center justify-center disabled:opacity-80"
                            disabled={inListenLater}
                            style={{ height: bottomSheetOptionHeight }}
                            onPress={async () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                await addToList(
                                    { ...selectedItem!, createdAt: new Date() },
                                    "later"
                                );

                                ref.current?.close();

                                Toast.show({
                                    backgroundColor: "#262626",
                                    position: "bottom",
                                    progressBarColor: "#22C55E",
                                    textColor: "#FAFAFA",
                                    text1: "Item successfully added to Listen Later!",
                                    type: "success",
                                });
                            }}>
                            <Text className="text-xl font-bold text-zinc-50">
                                {inListenLater ? "Already in " : "Add to "}Listen Later
                            </Text>
                        </Pressable>
                        <Pressable
                            className="flex w-full items-center justify-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                ref.current?.close();
                            }}
                            style={{ height: bottomSheetOptionHeight }}>
                            <Text className="text-xl font-bold text-red-500">Cancel</Text>
                        </Pressable>
                    </BottomSheetView>
                </BottomSheet>
            )}
            <ToastManager useModal={false} /> */}
        </SafeAreaView>
    );
};

export default Search;
