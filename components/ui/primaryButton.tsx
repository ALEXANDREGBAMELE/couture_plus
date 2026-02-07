import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet } from "react-native";

export function PrimaryButton({ title, onPress }: any) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <ThemedText style={styles.text}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
