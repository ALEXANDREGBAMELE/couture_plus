import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/primaryButton";
import { Colors } from "@/constants/theme";


export default function OrderDetailsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Ionicons name="person-circle-outline" size={64} color="#fff" />
            <View>
              <ThemedText style={styles.clientName}>
                Marie Kouassi
              </ThemedText>
              <View style={styles.statusBadge}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.light.tint}
                />
                <ThemedText style={styles.statusText}>
                  En cours
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* ================= PHOTOS ================= */}
        <Card title="Références visuelles" icon="images-outline">
          <View style={styles.imageRow}>
            <View style={styles.imageBox}>
              <Image
                source={require("@/assets/images/model.jpg")}
                style={styles.image}
              />
              <ThemedText style={styles.imageLabel}>
                Modèle
              </ThemedText>
            </View>

            <View style={styles.imageBox}>
              <Image
                source={require("@/assets/images/fabric.jpg")}
                style={styles.image}
              />
              <ThemedText style={styles.imageLabel}>
                Tissu / Pagne
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* ================= INFOS ================= */}
        <Card title="Informations générales" icon="information-circle-outline">
          <InfoRow label="Vêtement" value="Robe dame" />
          <InfoRow label="Date commande" value="10 mars 2026" />
          <InfoRow label="Livraison prévue" value="20 mars 2026" />
        </Card>

        {/* ================= MESURES ================= */}
        <Card title="Mesures (cm)" icon="resize-outline">
          <InfoRow label="Poitrine" value="92" />
          <InfoRow label="Taille" value="70" />
          <InfoRow label="Hanche" value="98" />
          <InfoRow label="Longueur" value="145" />
        </Card>

        {/* ================= NOTES ================= */}
        <Card title="Notes du couturier" icon="document-text-outline">
          <ThemedText style={styles.noteText}>
            Robe pour mariage.  
            Tissu fourni par la cliente.  
            Coupe ajustée avec manches longues.
          </ThemedText>
        </Card>

        {/* ================= ACTIONS ================= */}
        <View style={styles.actions}>
          <PrimaryButton title="Modifier la commande" />

          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={Colors.light.tint}
            />
            <ThemedText style={styles.secondaryText}>
              Marquer comme livrée
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* =======================
   UI COMPONENTS
======================= */

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={18} color={Colors.light.tint} />
        <ThemedText style={styles.cardTitle}>
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText style={styles.infoValue}>
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
  },

  header: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  clientName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  statusBadge: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusText: {
    color: Colors.light.tint,
    fontWeight: "600",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: "#6B7280",
    fontSize: 14,
  },

  infoValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },

  noteText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },

  imageRow: {
    flexDirection: "row",
    gap: 12,
  },

  imageBox: {
    flex: 1,
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },

  imageLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },

  actions: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 14,
  },

  secondaryBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },

  secondaryText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
