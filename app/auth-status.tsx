import React from "react";
import { View, Text, Button } from "react-native";
import { useUser, useSession, useAuth } from "@clerk/clerk-expo";

export default function AuthStatus() {
  const { isSignedIn, user } = useUser();
  const { session } = useSession();
  const { signOut } = useAuth();

  return (
    <View style={{ padding: 16 }}>
      <Text>signedIn: {String(isSignedIn)}</Text>
      <Text>userId: {user?.id ?? "—"}</Text>
      <Text>email: {user?.primaryEmailAddress?.emailAddress ?? "—"}</Text>
      <Text>sessionId: {session?.id ?? "—"}</Text>
      <Button title="Sign out" onPress={() => signOut()} />
    </View>
  );
}

