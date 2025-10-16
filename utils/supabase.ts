import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import Constants from "expo-constants";

export const supabase = createClient(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL,
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_KEY,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            lock: processLock,
        },
    }
);
