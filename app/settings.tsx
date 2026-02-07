import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </Pressable>

        <ThemedText style={styles.title}>
          Paramètres
        </ThemedText>
      </View>

      {/* ================= SYNCHRO ================= */}
      <SettingCard
        icon="sync-outline"
        title="Synchronisation"
        description="Les commandes sont synchronisées automatiquement lorsque la connexion Internet est disponible."
        value="Automatique"
      />

      {/* ================= STOCKAGE ================= */}
      <SettingCard
        icon="save-outline"
        title="Stockage local"
        description="Les données sont enregistrées sur le téléphone pour une utilisation hors ligne."
        value="Activé"
      />

      {/* ================= A PROPOS ================= */}
      <SettingCard
        icon="information-circle-outline"
        title="À propos"
        description="Atelier+ – La couture sans oubli"
        value="Version 1.0.0"
      />
    </ThemedView>
  );
}

/* =======================
   UI COMPONENT
======================= */

function SettingCard({
  icon,
  title,
  description,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconWrapper}>
          <Ionicons
            name={icon}
            size={22}
            color={Colors.light.tint}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.cardTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.cardDescription}>
            {description}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.cardValue}>
        {value}
      </ThemedText>
    </View>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  cardValue: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
