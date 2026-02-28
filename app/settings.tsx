import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
  Alert
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();

  const openWhatsApp = async () => {
    const phone = "0707193507";
    const url = `https://wa.me/225${phone}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erreur", "Impossible d’ouvrir WhatsApp");
    }
  };

  const callPhone = async () => {
    const url = `tel:0707193507`;
    await Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>

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

      {/* ================= SUPPORT ================= */}
     <View style={styles.supportCard}>
  <View style={styles.cardLeft}>
    <View style={styles.iconWrapper}>
      <Ionicons name="person-outline" size={22} color={Colors.light.tint} />
    </View>

    <View style={{ flex: 1, marginLeft: 10 }}>
      <ThemedText style={styles.cardTitle}>
        Besoin d’aide ?
      </ThemedText>

      <ThemedText style={styles.cardDescription}>
        Alexandre GBAMELE{"\n"}
        Consultant Développeur Web & Mobile{"\n"}
        Disponible par appel ou WhatsApp
      </ThemedText>
    </View>
  </View>

  <View style={styles.actionsRow}>
    <TouchableOpacity style={styles.actionButton} onPress={callPhone}>
      <Ionicons name="call-outline" size={18} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: "#25D366" }]}
      onPress={openWhatsApp}
    >
      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
    </TouchableOpacity>
  </View>
</View>
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



  cardValue: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: "600",
  },



  actionButton: {
    backgroundColor: Colors.light.tint,
    padding: 10,
    borderRadius: 8,
  },

  supportCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 16,
  marginTop: 20,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
  flexDirection: "row",       // alignement horizontal
  justifyContent: "space-between",
  alignItems: "flex-start",   // pour que le texte commence en haut
},

cardLeft: {
  flexDirection: "row",
  alignItems: "flex-start",
  flex: 1,
},

// Texte
cardDescription: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
  flexShrink: 1,     // permet au texte de s'adapter à l'espace dispo
  flexWrap: "wrap",  // autorise le retour à la ligne
},

actionsRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},
});