import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

/* =======================
   MOCK DATA
======================= */
const ordersData = [
  { id: "1", title: "Robe dame", date: "2026-02-06", status: "new" },
  { id: "2", title: "Tenue homme", date: "2026-02-05", status: "progress" },
  { id: "3", title: "Pantalon enfant", date: "2026-02-02", status: "done" },
  { id: "4", title: "Jupe", date: "2026-02-01", status: "progress" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  /* KPI */
  const kpi = useMemo(() => {
    return {
      total: ordersData.length,
      new: ordersData.filter(o => o.status === "new").length,
      progress: ordersData.filter(o => o.status === "progress").length,
      done: ordersData.filter(o => o.status === "done").length,
    };
  }, []);

  const filteredOrders = ordersData
    .filter(o =>
      o.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  return (
    <ThemedView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.appName}>
            Atelier+
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            La couture sans oubli
          </ThemedText>
        </View>

        <Pressable onPress={() => router.push("/settings")}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* ================= CONTENT ================= */}
      <View style={styles.content}>
        {/* IMAGE */}
        <Image
          source={require("@/assets/images/sewing.jpg")}
          style={styles.banner}
        />

        {/* KPI – JUSTE SOUS L’IMAGE */}
        <View style={styles.kpiContainer}>
          <KpiCard label="Nouvelles" value={kpi.new} icon="sparkles" />
          <KpiCard label="En cours" value={kpi.progress} icon="time" />
          <KpiCard label="Livrées" value={kpi.done} icon="checkmark-done" />
          <KpiCard label="Total" value={kpi.total} icon="list" />
        </View>

        {/* CREATE BUTTON */}
        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/create")}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <ThemedText style={styles.createText}>
            Créer une commande
          </ThemedText>
        </Pressable>

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

        {/* LISTE */}
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.orderItem}
              onPress={() =>
                router.push(`/orders/${item.id}`)
              }
            >
              <View style={styles.orderMarker} />
              <View style={styles.orderContent}>
                <ThemedText style={styles.orderTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.orderDate}>
                  Enregistrée le {item.date}
                </ThemedText>
              </View>
            </Pressable>
          )}
        />
      </View>
    </ThemedView>
  );
}

/* =======================
   KPI CARD
======================= */
function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.kpiCard}>
      <Ionicons name={icon} size={22} color={Colors.light.tint} />
      <ThemedText style={styles.kpiValue}>{value}</ThemedText>
      <ThemedText style={styles.kpiLabel}>{label}</ThemedText>
    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  subtitle: {
    fontSize: 15,
    color: "#E5E7EB",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  banner: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 14,
  },

  /* KPI */
  kpiContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 2,
  },

  kpiValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
    color: "#232a38",
  },

  kpiLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },

  createText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  orderItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },

  orderMarker: {
    width: 5,
    backgroundColor: Colors.light.tint,
  },

  orderContent: {
    padding: 14,
    flex: 1,
  },

  orderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  orderDate: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
});
