import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { db } from "@/database/database";
import { getNotifications } from "@/database/notificationRepository";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Charger les notifications depuis SQLite
  useEffect(() => {
  const data = getNotifications();
  setNotifications(data);
}, []);


  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (id: string, orderId: string) => {
    // Marquer comme lu dans l'état local
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
    );

    // Marquer comme lu dans SQLite
    db.runSync(
  "UPDATE notifications SET read = 1 WHERE id = ?",
  [id]
);

    // Naviguer vers le détail de la commande
    router.push(`/orders/${orderId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.notificationCard,
              !item.read && {
                borderLeftColor: Colors.light.tint,
                borderLeftWidth: 4,
              },
            ]}
            onPress={() => handleNotificationPress(item.id, item.orderId)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.notificationTitle}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.notificationDesc}>
                {item.description}
              </ThemedText>
              <ThemedText style={styles.notificationDate}>{item.date}</ThemedText>
            </View>
            {!item.read && (
              <View style={styles.unreadBadge}>
                <ThemedText style={styles.unreadText}>!</ThemedText>
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <ThemedText style={{ color: "#6B7280" }}>
              Aucune notification
            </ThemedText>
          </View>
        }
      />

      {unreadCount > 0 && (
        <View style={styles.footer}>
          <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
            {unreadCount} notification(s) non lue(s)
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  notificationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    elevation: 2,
  },
  notificationTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  notificationDesc: { fontSize: 14, color: "#374151", marginTop: 2 },
  notificationDate: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: { color: "#fff", fontWeight: "700" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    alignItems: "center",
  },
});
