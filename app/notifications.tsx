import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

/* ================= DATA ================= */
const initialNotifications = [
  {
    id: "1",
    orderId: "1",
    title: "Nouvelle commande reçue",
    description: "Marie Kouassi a passé une nouvelle commande.",
    date: "2026-02-10",
    read: false,
  },
  {
    id: "2",
    orderId: "2",
    title: "Commande en cours",
    description: "La commande #2 est maintenant en cours de réalisation.",
    date: "2026-02-09",
    read: false,
  },
  {
    id: "3",
    orderId: "4",
    title: "Commande livrée",
    description: "La commande #4 a été livrée à Francis Wodié.",
    date: "2026-02-08",
    read: true,
  },
];

/* ================= SCREEN ================= */
export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (id: string, orderId: string) => {
    // Marquer comme lu
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Naviguer vers la page détail de la commande
    router.push(`/orders`);
  };

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* LISTE DES NOTIFICATIONS */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
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
              <ThemedText style={styles.notificationDate}>
                {item.date}
              </ThemedText>
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

      {/* FOOTER KPI */}
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

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

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
