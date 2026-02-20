import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { db } from "@/database/database";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // ---------------- FETCH ----------------
  const fetchNotifications = () => {
    // Récupère uniquement les notifications dont la commande a une livraison dans les 5 prochains jours
    const data = db.getAllSync(`
      SELECT n.*
      FROM notifications n
      JOIN orders o ON n.orderId = o.id
      WHERE (n.read = 0 OR n.read IS NULL)
        AND o.deliveryDate IS NOT NULL
        AND datetime(o.deliveryDate) <= datetime('now', '+5 days')
      ORDER BY n.date DESC
    `) as any[];

    setNotifications(data);
    setUnreadCount(data.length);
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ---------------- HANDLE ----------------
  const handleNotificationPress = (id: string, orderId: string) => {
    // Marquer comme lu dans l'état local
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
    );

    // Marquer comme lu dans SQLite
    db.runSync(`UPDATE notifications SET read = 1 WHERE id = ?`, [id]);

    // Naviguer vers le détail de la commande
    router.push(`/orders/${orderId}`);
  };

  const timeAgo = (dateString: string): string => {
  const now = new Date().getTime();
  const created = new Date(dateString).getTime();
  const diffMs = now - created;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "il y a quelques secondes";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
};

  // ---------------- RENDER ----------------
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

      {/* HEADER : temps écoulé + badge */}
      <View style={styles.notificationHeader}>
        <ThemedText style={styles.timeAgoText}>
          {timeAgo(item.date)}
        </ThemedText>

        {!item.read && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadText}>!</ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.notificationTitle}>
        {item.title}
      </ThemedText>

      <ThemedText style={styles.notificationDesc}>
        {item.description}
      </ThemedText>

    </View>
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
 notificationHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},

timeAgoText: {
  fontSize: 12,
  color: "#9CA3AF",
  fontWeight: "500",
},
});