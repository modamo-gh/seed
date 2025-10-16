import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#22C55E",
                tabBarStyle: { backgroundColor: "#171717", borderTopWidth: 0 },
            }}
            screenListeners={{
                tabPress: (e) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                },
            }}>
            <Tabs.Screen
                name="Search"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather color={color} name="search" size={size} />
                    ),
                    title: "Search",
                }}
            />
            <Tabs.Screen
                name="ListenToday"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather color={color} name="sun" size={size} />
                    ),
                    title: "Listen Today",
                }}
            />
            <Tabs.Screen
                name="ListenLater"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather color={color} name="bookmark" size={size} />
                    ),

                    title: "Listen Later",
                }}
            />
        </Tabs>
    );
}
