import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { db } from "@/database/database";
import { checkDeliveryReminders } from "@/database/notificationRepository";
import { getOrders } from "@/database/orderRepository";

/* ================= HELPERS ================= */

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "new":
      return "Nouvelle";
    case "in_progress":
      return "En cours";
    case "delivered":
      return "Livrée";
    default:
      return "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "#2563EB"; // bleu
    case "in_progress":
      return "#F97316"; // orange
    case "delivered":
      return "#16A34A"; // vert
    default:
      return "#6B7280";
  }
};

/* ================= SCREEN ================= */

export default function HomeScreen() {
  const router = useRouter();

  // ---------------- STATES ----------------
  const [search, setSearch] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false); // overlay recherche
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);

  // ---------------- FETCH ----------------
  const fetchUnreadNotifications = () => {
  const row = db.getFirstSync(`
    SELECT COUNT(*) as count
    FROM notifications n
    JOIN orders o ON n.orderId = o.id
    WHERE (n.read = 0 OR n.read IS NULL)
      AND o.deliveryDate IS NOT NULL
      AND datetime(o.deliveryDate) <= datetime('now', '+5 days')
  `) as { count: number };

  setNotificationCount(row?.count ?? 0);
};

 useFocusEffect(
  useCallback(() => {
    fetchUnreadNotifications();
    setOrders(getOrders());
  }, [])
);

useEffect(() => {
  checkDeliveryReminders();
}, []);
  // ---------------- KPI ----------------
  const kpi = useMemo(() => ({
    total: orders.length,
    new: orders.filter(o => o.status === "new").length,
    progress: orders.filter(o => o.status === "in_progress").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }), [orders]);

  // ---------------- SEARCH FILTER ----------------
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;

    const lowerSearch = search.toLowerCase();

    return orders.filter(o => {

      const orderDateStr = o.orderDate
        ? new Date(o.orderDate).toLocaleDateString()
        : "";

      const clothTypes = (o.orderItems ?? [])
        .map((i: any) => i.clothType)
        .join(", ")
        .toLowerCase();

      return (
        clothTypes.includes(lowerSearch) ||
        o.clientName?.toLowerCase().includes(lowerSearch) ||
        o.clientPhone?.toLowerCase().includes(lowerSearch) ||
        orderDateStr.includes(lowerSearch)
      );
    });

  }, [search, orders]);


  // ---------------- RENDER ----------------
  return (
    <ThemedView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.appName}>Atelier+</ThemedText>
          <ThemedText style={styles.subtitle}>La couture sans oubli</ThemedText>
        </View>

        <View style={styles.icons}>
          {/* Notifications avec bulle */}
          <Pressable
            style={{ marginRight: 16 }}
            onPress={() => {
              router.push("/notifications");
              fetchUnreadNotifications();
            }}
          >
            <Ionicons name="notifications-outline" size={28} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.notificationBubble}>
                <Text style={styles.bubbleText}>{notificationCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Paramètres */}
          <Pressable onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ================= CONTENT ================= */}
      <View style={styles.content}>
        {/* IMAGE */}
        <Image
          source={require("@/assets/images/sewing.jpg")}
          style={styles.banner}
        />

        {/* KPI */}
        <View style={styles.kpiRow}>
          <KpiCard label="Nouvelles" value={kpi.new} color="#2563EB" icon="sparkles" />
          <KpiCard label="En cours" value={kpi.progress} color="#F97316" icon="reload" />
          <KpiCard label="Livrées" value={kpi.delivered} color="#16A34A" icon="checkmark-circle" />
          <KpiCard label="Total" value={kpi.total} color="#374151" icon="cube" />
        </View>

        {/* SEARCH FIELD (Click to open overlay) */}
        <Pressable
          style={styles.searchBox}
          onPress={() => setIsSearchActive(true)}
        >
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <Text style={{ color: "#9CA3AF", flex: 1 }}>
            Rechercher une commande...
          </Text>
        </Pressable>

        {/* ORDERS LIST */}
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => {

            const items = item.orderItems ?? [];

            const clothList = [...new Set(
              items.map((i: any) => i.clothType)
            )].join(", ");

            const previewImages = items
              .flatMap((i: any) => [i.modelImage, i.fabricImage])
              .filter(Boolean)
              .slice(0, 2);

            return (
              <Pressable
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: "/orders/[id]",
                    params: { id: item.id.toString() },
                  })
                }
              >
                <View style={styles.orderInfo}>
                  <ThemedText style={styles.orderTitle}>
                    {clothList || "Aucun habit"}
                  </ThemedText>

                  <ThemedText style={styles.clientName}>
                    {item.clientName}
                  </ThemedText>

                  <ThemedText style={styles.clientPhone}>
                    {item.clientPhone}
                  </ThemedText>

                  <ThemedText style={styles.orderDate}>
                    {new Date(item.orderDate).toLocaleDateString()}
                  </ThemedText>

                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) }
                    ]}
                  >
                    {getStatusLabel(item.status)}
                  </ThemedText>
                </View>

                <View style={styles.imagesBox}>
                  {previewImages.map((img: any, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: img }}
                      style={styles.smallImage}
                    />
                  ))}
                </View>
              </Pressable>
            );
          }}


        />
      </View>

      {/* ================= SEARCH OVERLAY ================= */}
      {isSearchActive && (
        <View style={styles.searchOverlay}>
          <View style={styles.searchHeader}>
            <TextInput
              placeholder="Rechercher une commande..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInputOverlay}
              autoFocus
            />
            <Pressable onPress={() => { setIsSearchActive(false); setSearch(''); }}>
              <Text style={{ color: "#2563EB", fontWeight: "600", marginLeft: 8 }}>Annuler</Text>
            </Pressable>
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => {

              const items = item.orderItems ?? [];

              const clothList = [...new Set(
                items.map((i: any) => i.clothType)
              )].join(", ");

              const previewImages = items
                .flatMap((i: any) => [i.modelImage, i.fabricImage])
                .filter(Boolean)
                .slice(0, 2);

              return (
                <Pressable
                  style={styles.orderCard}
                  onPress={() =>
                    router.push({
                      pathname: "/orders/[id]",
                      params: { id: item.id.toString() },
                    })
                  }
                >
                  <View style={styles.orderInfo}>
                    <ThemedText style={styles.orderTitle}>
                      {clothList || "Aucun habit"}
                    </ThemedText>

                    <ThemedText style={styles.clientName}>
                      {item.clientName}
                    </ThemedText>

                    <ThemedText style={styles.clientPhone}>
                      {item.clientPhone}
                    </ThemedText>
                  

                    <ThemedText style={styles.orderDate}>
                      {new Date(item.orderDate).toLocaleDateString()}
                    </ThemedText>

                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) }
                      ]}
                    >
                      {getStatusLabel(item.status)}
                    </ThemedText>
                  </View>

                  <View style={styles.imagesBox}>
                    {previewImages.map((img: any, index: number) => (
                      <Image
                        key={index}
                        source={{ uri: img }}
                        style={styles.smallImage}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            }}


          />
        </View>
      )}

      {/* ================= FAB ================= */}
      <Pressable style={styles.fab} onPress={() => router.push("/create")}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </ThemedView>
  );
}

/* ================= KPI CARD ================= */
function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={18} color={color} />
      <ThemedText style={styles.kpiValue}>{value}</ThemedText>
      <ThemedText style={styles.kpiLabel}>{label}</ThemedText>
    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  appName: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 15, color: "#E5E7EB", marginTop: 2 },

  icons: { flexDirection: "row", alignItems: "center" },

  notificationBubble: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  bubbleText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  banner: { width: "100%", height: 160, borderRadius: 16, marginBottom: 12 },

  /* KPI */
  kpiRow: { flexDirection: "row", marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
    borderTopWidth: 3,
    elevation: 2,
  },
  kpiValue: { fontSize: 18, fontWeight: "800", marginTop: 4, color: "#111827" },
  kpiLabel: { fontSize: 12, color: "#6B7280" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
    elevation: 2,
  },

  orderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    elevation: 2,
  },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  clientName: { fontSize: 14, color: "#374151" },
  clientPhone: { fontSize: 14, 
  color: "#000000",  
  fontWeight: "700", },
  orderDate: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  statusText: { marginTop: 6, fontSize: 13, fontWeight: "700" },

  imagesBox: { flexDirection: "row", gap: 6 },
  smallImage: { width: 54, height: 54, borderRadius: 10 },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  /* ================= SEARCH OVERLAY ================= */
  searchOverlay: {
    position: "absolute",
    top: 135,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },

  searchInputOverlay: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
});
