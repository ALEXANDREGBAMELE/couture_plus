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
import { getOrders } from "@/database/orderRepository";

/* ================= HELPERS ================= */

const getStatusLabel = (status: string) => {
  switch (status) {
    case "new":
      return "Nouvelle";
    case "progress":
      return "En cours";
    case "done":
      return "Livrée";
    default:
      return "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "#2563EB"; // bleu
    case "progress":
      return "#F97316"; // orange
    case "done":
      return "#16A34A"; // vert
    default:
      return "#6B7280";
  }
};

/* ================= SCREEN ================= */

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [notificationCount, setNotificationCount] = useState<number>(0);


  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = () => {
    const result = db.getAllSync("SELECT * FROM notifications WHERE read = 0");
    setNotificationCount(result.length);
  };

  // ou dans useFocusEffect pour rafraîchir automatiquement
  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotifications();
    }, [])
  );

  /* KPI */
  const [orders, setOrders] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const data = getOrders(); // tes commandes SQLite
      setOrders(data);
    }, [])
  );

  const kpi = useMemo(() => ({
    total: orders.length,
    new: orders.filter(o => o.status === "new").length,
    progress: orders.filter(o => o.status === "progress").length,
    done: orders.filter(o => o.status === "done").length,
  }), [orders]);


const filteredOrders = useMemo(() => {
  if (!search.trim()) return orders;

  const lowerSearch = search.toLowerCase();

  return orders.filter(o => {
    const orderDateStr = o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "";

    return (
      o.title.toLowerCase().includes(lowerSearch) ||
      o.clientName.toLowerCase().includes(lowerSearch) ||
      (o.clientPhone?.toLowerCase().includes(lowerSearch)) ||
      orderDateStr.includes(lowerSearch)
    );
  });
}, [search, orders]);



  useFocusEffect(
    useCallback(() => {

      const data = getOrders();
      setOrders(data);
      
    }, [])
  );

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
              fetchUnreadNotifications(); // mettre à jour
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
          <KpiCard
            label="Nouvelles"
            value={kpi.new}
            color="#2563EB"
            icon="sparkles"
          />
          <KpiCard
            label="En cours"
            value={kpi.progress}
            color="#F97316"
            icon="reload"
          />
          <KpiCard
            label="Livrées"
            value={kpi.done}
            color="#16A34A"
            icon="checkmark-circle"
          />
          <KpiCard
            label="Total"
            value={kpi.total}
            color="#374151"
            icon="cube"
          />
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Rechercher une commande..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* LIST */}
      <FlatList
  data={filteredOrders}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ paddingBottom: 120 }}
  renderItem={({ item }) => (
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
        <ThemedText style={styles.orderTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.clientName}>{item.clientName}</ThemedText>
        <ThemedText style={styles.orderDate}>
          {new Date(item.orderDate).toLocaleDateString()}
        </ThemedText>
        <ThemedText
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {getStatusLabel(item.status)}
        </ThemedText>
      </View>

      <View style={styles.imagesBox}>
        {item.modelImage && (
          <Image source={{ uri: item.modelImage }} style={styles.smallImage} />
        )}
        {item.fabricImage && (
          <Image source={{ uri: item.fabricImage }} style={styles.smallImage} />
        )}
      </View>
    </Pressable>
  )}
/>

      </View>

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
  kpiValue: { fontSize: 18, fontWeight: "800", marginTop: 4 , color: "#111827" },
  kpiLabel: { fontSize: 12, color: "#6B7280" },

  searchBox: {
  flexDirection: "row",
  alignItems: "center",   // <-- alignement vertical centré
  backgroundColor: "#fff",
  borderRadius: 14,
  paddingHorizontal: 12,  // padding horizontal
  paddingVertical: 8,     // padding vertical
  marginBottom: 16,
  gap: 8,
  elevation: 2,
},
  searchInput: { flex: 1 },

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
  orderDate: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  statusText: { marginTop: 6, fontSize: 13, fontWeight: "700" },

  imagesBox: { flexDirection: "row", gap: 6 },
  smallImage: { width: 54, height: 54, borderRadius: 10 },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
