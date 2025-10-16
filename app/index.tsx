import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { useSpotify } from "../context/Spotify";

const Login = () => {
    const router = useRouter();

    const { token, promptAsync } = useSpotify();

    useEffect(() => {
        if (token) {
            router.replace("/(tabs)/Search");
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <View className="flex flex-1 items-center justify-center bg-neutral-900">
            <View className="flex flex-[4] items-center justify-center">
                <Image className="h-96 w-96" source={require("../assets/playstore.png")} />
            </View>
            <View className="flex flex-1 justify-around">
                <Pressable
                    className="flex h-12 w-64 items-center justify-center rounded-lg bg-green-500 px-2 py-1 active:bg-green-600"
                    onPress={() => {
                        promptAsync();
                    }}>
                    <Text className="text-lg font-semibold text-zinc-50">Login with Spotify</Text>
                </Pressable>
                <Pressable
                    className="flex h-12 w-64 items-center justify-center"
                    onPress={() => Linking.openURL("https://buymeacoffee.com/modamo")}>
                    <Text className="text-green-500 underline">☕️ Buy me a coffee</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Login;
