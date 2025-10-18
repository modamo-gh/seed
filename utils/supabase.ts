import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_KEY;
const supabaseURL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseKey || !supabaseURL) {
    console.error("Supabase credentials missing:", { key: !!supabaseKey, url: !!supabaseURL });
}

export const supabase = createClient(
    supabaseURL || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-key",
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
