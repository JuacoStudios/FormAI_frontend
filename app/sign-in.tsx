import React, { useCallback } from "react";
import { View, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import { useOAuth, setActive } from "@clerk/clerk-expo";

export default function SignInScreen() {
  const router = useRouter();
  const redirectUri = makeRedirectUri({ scheme: "formai", path: "clerk-callback" });
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_email" });

  const handleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setActiveFromHook, signIn, signUp } =
        await startOAuthFlow({ redirectUrl: redirectUri });

      if (createdSessionId) {
        await (setActiveFromHook ?? setActive)({ session: createdSessionId });
        router.replace("/");
        return;
      }
      Alert.alert("Check your email", "Complete the magic link to finish sign-in.");
    } catch (e: any) {
      console.error("Sign-in failed:", e);
      Alert.alert("Sign-in failed", e?.message ?? "Unknown error");
    }
  }, [router, startOAuthFlow, redirectUri]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Button title="Sign in with email (Magic Link)" onPress={handleSignIn} />
    </View>
  );
}
