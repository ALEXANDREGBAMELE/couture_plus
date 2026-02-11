import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

/* ================= DATA ================= */

const ordersData = [
  {
    id: "1",
    title: "Robe dame",
    client: "Marie Kouassi",
    date: "2026-02-06",
    status: "new",
    modelImage: require("@/assets/images/model.jpg"),
    fabricImage: require("@/assets/images/fabric.jpg"),
  },
  {
    id: "2",
    title: "Tenue homme",
    client: "Koffi Yao",
    date: "2026-02-05",
    status: "progress",
    modelImage: require("@/assets/images/model.jpg"),
    fabricImage: require("@/assets/images/fabric.jpg"),
  },
  {
    id: "3",
    title: "Costume Homme",
    client: "Koffi Yao",
    date: "2026-02-05",
    status: "progress",
    modelImage: require("@/assets/images/model.jpg"),
    fabricImage: require("@/assets/images/fabric.jpg"),
  },
  {
    id: "4",
    title: "Jupe",
    client: "Francis Wodié",
    date: "2026-02-01",
    status: "done",
    modelImage: require("@/assets/images/model.jpg"),
    fabricImage: require("@/assets/images/fabric.jpg"),
  },
];

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
  const [notificationCount, setNotificationCount] = useState(3); // Exemple dynamique

  /* KPI */
  const kpi = useMemo(() => {
    return {
      total: ordersData.length,
      new: ordersData.filter((o) => o.status === "new").length,
      progress: ordersData.filter((o) => o.status === "progress").length,
      done: ordersData.filter((o) => o.status === "done").length,
    };
  }, []);

  const filteredOrders = ordersData.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase())
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
            onPress={() => router.push("/notifications")}
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
              onPress={() => router.push(`/orders/${item.id}`)}
            >
              <View style={styles.orderInfo}>
                <ThemedText style={styles.orderTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.clientName}>{item.client}</ThemedText>
                <ThemedText style={styles.orderDate}>{item.date}</ThemedText>
                <ThemedText
                  style={[styles.statusText, { color: getStatusColor(item.status) }]}
                >
                  {getStatusLabel(item.status)}
                </ThemedText>
              </View>

              <View style={styles.imagesBox}>
                <Image source={item.modelImage} style={styles.smallImage} />
                <Image source={item.fabricImage} style={styles.smallImage} />
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
  kpiValue: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  kpiLabel: { fontSize: 12, color: "#6B7280" },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
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
