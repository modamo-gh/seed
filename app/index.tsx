import { useRouter } from 'expo-router';
import { Image, Linking, Pressable, Text, View } from 'react-native';

const Login = () => {
  const router = useRouter();

  return (
    <View className="flex flex-1 items-center justify-center bg-neutral-900">
      <View className="flex flex-[4] items-center justify-center">
        <Image className="h-96 w-96" source={require('../assets/playstore.png')} />
      </View>
      <View className="flex flex-1 justify-around">
        <Pressable className="flex h-12 w-64 items-center justify-center rounded-lg bg-green-500 px-2 py-1 active:bg-green-600">
          <Text className="text-lg font-semibold text-zinc-50">Login with Spotify</Text>
        </Pressable>
        <Pressable
          className="flex h-12 w-64 items-center justify-center"
          onPress={() => Linking.openURL('https://buymeacoffee.com/modamo')}>
          <Text className="text-green-500 underline">☕️ Buy me a coffee</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;
