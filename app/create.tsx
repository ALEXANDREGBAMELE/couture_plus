import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/primaryButton";
import { Colors } from "@/constants/theme";

/* =======================
   METIER : MESURES
======================= */
const MEASURES_BY_TYPE: Record<string, string[]> = {
  Chemise: ["Poitrine", "Manche", "Longueur"],
  Pantalon: ["Taille", "Hanche", "Longueur"],
  Robe: ["Poitrine", "Taille", "Hanche", "Longueur"],
};

export default function CreateOrderScreen() {
  const [type, setType] =
    useState<keyof typeof MEASURES_BY_TYPE | null>(null);
  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);
  const [fabricPhoto, setFabricPhoto] = useState<string | null>(null);

  const handleMeasureChange = (key: string, value: string) => {
    setMeasures({ ...measures, [key]: value });
  };

  const pickImage = async (
    setter: (uri: string) => void
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HERO ================= */}
        {/* <Image
          source={require("@/assets/images/sewing.jpg")}
          style={styles.hero}
        /> */}

        <ThemedText style={styles.title}>
          Nouvelle commande
        </ThemedText>

        {/* ================= CLIENT ================= */}
        <Section title="Client" icon="person-outline">
          <Label text="Nom du client" />
          <TextInput
            style={styles.input}
            placeholder="Ex : Kouadio Yao"
          />

          <Label text="Téléphone" />
          <TextInput
            style={styles.input}
            placeholder="07 00 00 00 00"
            keyboardType="phone-pad"
          />
        </Section>

        {/* ================= VÊTEMENT ================= */}
        <Section title="Vêtement" icon="shirt-outline">
          <View style={styles.typeRow}>
            {Object.keys(MEASURES_BY_TYPE).map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.typeButton,
                  type === item && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setType(item as any);
                  setMeasures({});
                }}
              >
                <Ionicons
                  name="cut-outline"
                  size={16}
                  color={type === item ? "#fff" : "#6B7280"}
                />
                <ThemedText
                  style={[
                    styles.typeText,
                    type === item && styles.typeTextActive,
                  ]}
                >
                  {item}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* ================= MESURES ================= */}
        {type && (
          <Section title="Mesures (cm)" icon="resize-outline">
            {MEASURES_BY_TYPE[type].map((measure) => (
              <View key={measure}>
                <Label text={measure} />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={`Entrer ${measure}`}
                  value={measures[measure] || ""}
                  onChangeText={(v) =>
                    handleMeasureChange(measure, v)
                  }
                />
              </View>
            ))}
          </Section>
        )}

        {/* ================= PHOTOS ================= */}
        <Section title="Photos" icon="camera-outline">
          <PhotoPicker
            label="Photo du modèle"
            image={modelPhoto}
            onPick={() =>
              pickImage((uri) => setModelPhoto(uri))
            }
          />

          <PhotoPicker
            label="Photo du tissu / pagne"
            image={fabricPhoto}
            onPick={() =>
              pickImage((uri) => setFabricPhoto(uri))
            }
          />
        </Section>

        {/* ================= DATES ================= */}
        <Section title="Livraison" icon="calendar-outline">
          <Label text="Date de livraison" />
          <TextInput
            style={styles.input}
            placeholder="Ex : 20/03/2026"
          />
        </Section>

        {/* ================= NOTES ================= */}
        <Section title="Notes" icon="document-text-outline">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Instructions particulières..."
            multiline
          />
        </Section>

        <PrimaryButton title="Enregistrer la commande (offline)" />
      </ScrollView>
    </ThemedView>
  );
}

/* =======================
   COMPONENTS UI
======================= */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={icon}
          size={18}
          color={Colors.light.tint}
        />
        <ThemedText style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <ThemedText style={styles.label}>{text}</ThemedText>;
}

function PhotoPicker({
  label,
  image,
  onPick,
}: {
  label: string;
  image: string | null;
  onPick: () => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Label text={label} />
      <TouchableOpacity
        style={styles.photoBox}
        onPress={onPick}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.photo} />
        ) : (
          <>
            <Ionicons
              name="add"
              size={32}
              color="#9CA3AF"
            />
            <ThemedText style={{ color: "#9CA3AF" }}>
              Ajouter une photo
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
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

  hero: {
    width: "100%",
    height: 170,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    margin: 20,
    color: "#111827",
  },

  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    gap: 12,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FAFAFA",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  typeButton: {
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  typeButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },

  typeText: {
    color: "#374151",
  },

  typeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  photoBox: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "100%",
  },
});
