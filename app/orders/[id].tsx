import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Dimensions,
  FlatList,
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
import { getOrderById, markOrderAsDelivered } from "@/database/orderRepository";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import ImageViewing from "react-native-image-viewing";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const windowWidth = Dimensions.get("window").width;

  // Hooks pour gérer le modal d'images
  const [modalVisible, setModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const data = getOrderById(id);
    setOrder(data);
  }, [id]);

  if (!order) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Ionicons name="person-circle-outline" size={64} color="#fff" />
            <View>
              <ThemedText style={styles.clientName}>
                {order.clientName}
              </ThemedText>
              <View style={styles.statusBadge}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.light.tint}
                />
                <ThemedText style={styles.statusText}>
                  {order.status}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* ================= INFOS ================= */}
        <Card title="Informations générales" icon="information-circle-outline">
          <InfoRow label="Vêtement" value={order.title || "-"} />
          <InfoRow
            label="Date commande"
            value={new Date(order.orderDate).toLocaleDateString()}
          />
          <InfoRow
            label="Livraison prévue"
            value={
              order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString()
                : "Non définie"
            }
          />
        </Card>

        {/* ================= ARTICLES ================= */}
        <FlatList
          data={order.orderItems}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const images = [item.modelImage, item.fabricImage].filter(Boolean) as string[];

            return (
              <Card key={item.id} title={item.clothType} icon="shirt-outline">
                {/* Images côte à côte */}
                {images.length > 0 ? (
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                    {images.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentImages(images);
                          setImageIndex(index);
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: img }}
                          style={{
                            width: windowWidth * 0.4,
                            height: windowWidth * 0.38,
                            borderRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={{ marginTop: 8, color: "#6B7280" }}>
                    Aucune image disponible
                  </ThemedText>
                )}

                {/* Mesures FlatList */}
                {item.measurements?.length ? (
                  <FlatList
                    data={item.measurements}
                    keyExtractor={(m) => m.id}
                    contentContainerStyle={{ marginTop: 8, gap: 4 }}
                    renderItem={({ item: m }) => (
                      <InfoRow label={m.label} value={m.value.toString()} />
                    )}
                  />
                ) : (
                  <ThemedText style={{ marginTop: 8, color: "#6B7280" }}>
                    Aucune mesure ajoutée
                  </ThemedText>
                )}
              </Card>
            );
          }}
        />

        {/* ================= NOTES ================= */}
        <Card title="Notes du couturier" icon="document-text-outline">
          <ThemedText style={styles.noteText}>
            {order.notes ? order.notes : "Aucune note ajoutée"}
          </ThemedText>
        </Card>

        {/* ================= ACTIONS ================= */}
        <View style={styles.actions}>
          <PrimaryButton title="Modifier la commande" />

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              order.status === "livrée" && { opacity: 0.5 },
            ]}
            disabled={order.status === "livrée"}
            onPress={() => {
              try {
                markOrderAsDelivered(order.id);
                Alert.alert("Succès", "La commande a été marquée comme livrée.");
                setOrder({ ...order, status: "livrée" }); // met à jour l'UI
              } catch (error) {
                Alert.alert("Erreur", "Impossible de mettre à jour la commande.");
              }
            }}
          >
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

        {/* ================= MODAL IMAGE ================= */}
        <ImageViewing
          images={currentImages.map((uri) => ({ uri }))}
          imageIndex={imageIndex}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      </ScrollView>
    </ThemedView>
  );
}

/* ======================= UI COMPONENTS ================= */
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
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

/* ======================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },

  headerTop: { flexDirection: "row", alignItems: "center", gap: 16 },

  clientName: { color: "#fff", fontSize: 22, fontWeight: "700" },

  statusBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  statusText: { color: Colors.light.tint, fontWeight: "600", fontSize: 13 },

  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },

  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  infoLabel: { color: "#6B7280", fontSize: 14 },

  infoValue: { color: "#111827", fontSize: 14, fontWeight: "500" },

  noteText: { color: "#374151", fontSize: 14, lineHeight: 22 },

  actions: { marginHorizontal: 20, marginBottom: 40, gap: 12 },

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
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  secondaryText: { color: Colors.light.tint, fontWeight: "600", fontSize: 14 },
});