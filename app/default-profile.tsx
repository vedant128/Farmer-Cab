// components/default_profile.tsx
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  name?: string;
  imageUrl?: string | null;
  size?: number;
};

export default function DefaultProfile({
  name = "User",
  imageUrl,
  size = 80,
}: Props) {
  const [error, setError] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  if (!imageUrl || error) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.initial, { fontSize: size / 2 }]}>
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#fff",
    fontWeight: "bold",
  },
});
