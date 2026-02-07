import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export function Card({ children }: { children: React.ReactNode }) {
  return <ThemedView style={styles.card}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});
