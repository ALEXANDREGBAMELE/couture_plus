import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/primaryButton";
import { Colors } from "@/constants/theme";
import { createOrderOffline } from "@/database/orderRepository";
import { useRouter } from "expo-router";

type Category = "dame" | "homme" | "enfant"
type OrderItem = {
  id: string;
  category: Category;
  clothType: string;
  measurements: Record<string, string>;
  modelImage: string | null;
  fabricImage: string | null;
};

/* ===================== MESURES ===================== */
export const MEASUREMENT_LABELS: Record<string, string> = {
  chest: "Poitrine",
  waist: "Taille",
  hip: "Hanche",
  belt: "Ceinture",
  shoulder: "Épaule",
  sleeve_length: "Longueur manche",
  sleeve_width: "Largeur manche",
  neck: "Tour de cou",
  sleeve_cuff: "Tour de manche",
  wrist: "Poignet",

   skirt_length: "Longueur jupe",
  dress_length: "Longueur robe",
  top_length: "Longueur haut",
  shirt_length: "Longueur chemise",
  pant_length: "Longueur pantalon",
  jacket_length: "Longueur veste",
  boubou_length: "Longueur boubou",

  bust_height: "Hauteur poitrine",
  bust_distance: "Écart poitrine",

  inseam: "Entrejambe",
  thigh: "Cuisse",
  knee: "Genou",
  bottom: "Bas",

  front_rise: "Montant devant",
  back_rise: "Montant derrière",
  basin: "Bassin",
};

/* ===================== TYPES & MESURES ===================== */
export const CLOTH_TYPES = {
  dame: ["haut", "robe", "jupe", "pantalon", "boubou", "ensemble", "veste"],
  homme: ["chemise", "pantalon", "boubou", "ensemble", "veste", "costume"],
  enfant: ["haut", "robe", "pantalon", "boubou", "ensemble"],
};

export const MEASURES: Record<Category, Record<string, string[]>> = {
  dame: {
    haut: ["chest","bust_distance","waist","shoulder","top_length","sleeve_length","sleeve_cuff","hip" ],
    robe: ["chest","bust_height","bust_distance","shoulder","waist","dress_length","basin","hip","sleeve_length","sleeve_cuff"],
    jupe: ["basin", "belt","waist","hip","","skirt_length","bottom"],
    pantalon: ["basin","belt","waist","hip","pant_length","inseam","thigh","knee","bottom"],
    boubou: ["chest","waist","hip","boubou_length","shoulder","sleeve_length","sleeve_cuff"],
    ensemble: ["chest","waist","hip","top_length","pant_length","shoulder","sleeve_length"],
    veste: ["chest","waist","shoulder","jacket_length","sleeve_length","sleeve_cuff"]
  },
  homme: {
    chemise: ["chest","waist","shoulder","shirt_length","sleeve_length","sleeve_cuff","wrist"],
    pantalon: ["waist","hip","belt","pant_length","inseam","thigh","knee","bottom"],
    boubou: ["chest","waist","boubou_length","shoulder","sleeve_length","sleeve_cuff"],
    ensemble: ["chest","waist","top_length","shoulder","sleeve_length","sleeve_cuff","pant_length","belt","inseam","thigh","knee","bottom"],
    veste: ["chest","waist","shoulder","jacket_length","sleeve_length","sleeve_cuff"],
    costume: ["chest","waist","shoulder","jacket_length","sleeve_length","sleeve_cuff","belt","basin","pant_length","thigh","inseam","knee","bottom"]
  },
  enfant: {
    haut: ["chest","top_length","shoulder","sleeve_length"],
    robe: ["chest","dress_length","shoulder"],
    pantalon: ["waist","pant_length"],
    boubou: ["chest","boubou_length","sleeve_cuff"],
    ensemble: ["chest","top_length","pant_length"]
  }
};

/* ===================== MAIN SCREEN ===================== */
export default function CreateOrderScreen() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<"dame" | "homme" | "enfant" | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  /* ================= PERMISSIONS ================= */
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Accès aux images nécessaire");
      }
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert("Permission refusée", "Accès caméra nécessaire");
      }
    })();
  }, []);

  /* ================= PICK IMAGE ================= */
  const pickImage = async (itemId: string, field: "modelImage" | "fabricImage") => {
    Alert.alert("Ajouter une photo", "Choisir la source", [
      {
        text: "Galerie",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled && result.assets?.[0]?.uri) {
            const uri = result.assets[0].uri;
            setOrderItems(prev => prev.map(item => item.id === itemId ? { ...item, [field]: uri } : item));
          }
        }
      },
      {
        text: "Caméra",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled && result.assets?.[0]?.uri) {
            const uri = result.assets[0].uri;
            setOrderItems(prev => prev.map(item => item.id === itemId ? { ...item, [field]: uri } : item));
          }
        }
      },
      { text: "Annuler", style: "cancel" }
    ]);
  };

  /* ================= AJOUTER VÊTEMENT ================= */
  const handleAddCloth = (type: string) => {
    if (!selectedCategory) return;
    const newItem = {
      id: Date.now().toString(),
      category: selectedCategory,
      clothType: type,
      measurements: {},
      modelImage: null,
      fabricImage: null
    };
    setOrderItems(prev => [...prev, newItem]);
    setSelectedType(null);
  };

  /* ================= MESURES ================= */
  const handleMeasureChange = (itemId: string, key: string, value: string) => {
    setOrderItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, measurements: { ...item.measurements, [key]: value } }
        : item
    ));
  };

  const handleCategoryChange = (newCategory: "dame" | "homme" | "enfant") => {

  // Si aucune catégorie encore choisie
  if (!selectedCategory) {
    setSelectedCategory(newCategory);
    return;
  }

  // Si même catégorie on ne fait rien
  if (selectedCategory === newCategory) return;

  // Si il y a déjà des vêtements ajoutés
  if (orderItems.length > 0) {

    Alert.alert(
      "Attention ⚠️",
      "Si vous changez de catégorie maintenant, toutes les mesures déjà saisies seront perdues. Voulez-vous continuer ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Continuer",
          style: "destructive",
          onPress: () => {
            setSelectedCategory(newCategory);
            setSelectedType(null);
            setOrderItems([]); // 🔥 ON VIDE TOUT
          }
        }
      ]
    );

    return;
  }

  // Sinon on change normalement
  setSelectedCategory(newCategory);
};

  /* ================= DATE PICKER ================= */
  const onChange = (event?: any, selectedDate?: Date) => {
    const currentDate = selectedDate || deliveryDate || new Date();
    setShowPicker(Platform.OS === 'ios');
    if (currentDate) setDeliveryDate(currentDate);
  };

  /* ================= ENREGISTRER ================= */
 const handleSaveOrder = () => {

  // Vérifier client
  if (!clientName.trim()) {
    Alert.alert("Erreur", "Veuillez saisir le nom du client");
    return;
  }

  // Vérifier qu'une catégorie a été choisie au moins une fois
  if (orderItems.length === 0) {
    Alert.alert("Erreur", "Veuillez ajouter au moins un vêtement");
    return;
  }

  // Vérifier que chaque vêtement a au moins une mesure remplie
  const hasEmptyMeasures = orderItems.some(item => {
    const measures = Object.values(item.measurements || {});
    return measures.length === 0 || measures.every(m => !m);
  });

  if (hasEmptyMeasures) {
    Alert.alert("Erreur", "Veuillez renseigner les mesures");
    return;
  }

  /* ================= FORMATAGE ================= */

  const formattedItems = orderItems.map(item => ({
    clothType: item.clothType,
    modelImage: item.modelImage,
    fabricImage: item.fabricImage,
    measurements: Object.entries(item.measurements).map(([label, value]) => ({
      label,
      value: Number(value)
    })),
  }));

  const orderData = {
    client: { name: clientName, phone: clientPhone },
    deliveryDate: deliveryDate.toISOString(),
    notes: notes || null,
    orderItems: formattedItems,
    status: "new",
    orderDate: new Date().toISOString(),
  };

  createOrderOffline(orderData as any);
  Alert.alert("Succès", "Commande enregistrée ✔️");
  router.push("/");
};

  /* ================= RENDER ================= */
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ================= CLIENT ================= */}
        <Section title="Client" icon="person-outline">
          <Label text="Nom du client" required />
          <TextInput style={styles.input} value={clientName} onChangeText={setClientName} />

          <Label text="Téléphone" required />
          <TextInput style={styles.input} keyboardType="phone-pad" value={clientPhone} onChangeText={setClientPhone} />

          <Label text="Date de livraison" required />
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <ThemedText style={{ marginLeft: 8, color: "#111" }}>
              {deliveryDate ? deliveryDate.toLocaleDateString("fr-FR") : "Sélectionner une date"}
            </ThemedText>
          </TouchableOpacity>
          {showPicker && <DateTimePicker value={deliveryDate} mode="date" display="default" onChange={onChange} />}
        </Section>

        {/* ================= AJOUTER VÊTEMENT ================= */}
        <Section title="Ajouter un vêtement" icon="shirt-outline">
          <Label text="Catégorie" required />
          <View style={styles.typeRow}>
            {["dame","homme","enfant"].map(cat => (
              <TouchableOpacity key={cat} style={[styles.typeButton, selectedCategory === cat && styles.typeButtonSelected]} onPress={()=>{handleCategoryChange(cat as "dame" | "homme" | "enfant");}}>
                <ThemedText style={selectedCategory === cat ? styles.typeTextSelected : styles.typeText}>{cat.toUpperCase()}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCategory && (
            <>
              <Label text="Type de vêtement" required />
              <View style={styles.typeRow}>
                {CLOTH_TYPES[selectedCategory].map(type => (
                  <TouchableOpacity key={type} style={[styles.typeButton, selectedType === type && styles.typeButtonSelected]} onPress={()=>setSelectedType(type)}>
                    <ThemedText style={selectedType === type ? styles.typeTextSelected : styles.typeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedType && (
            <TouchableOpacity style={styles.addClothButton} onPress={()=>handleAddCloth(selectedType)}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </Section>

        {/* ================= ARTICLES AJOUTÉS ================= */}
        {orderItems.map((item, index) => (
          <Section key={item.id} title={`${item.clothType?.toUpperCase() || "-"}`} icon="resize-outline">
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setExpandedItem(expandedItem === index ? null : index)}>
                <Ionicons name={expandedItem === index ? "chevron-up" : "chevron-down"} size={22} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOrderItems(prev => prev.filter((_, i) => i !== index))}>
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>

            {expandedItem === index && (
              <>
                {MEASURES[item.category]?.[item.clothType]?.map(key => (
                  <View key={key}>
                    <Label text={MEASUREMENT_LABELS[key] || key} />
                    <TextInput style={styles.input} keyboardType="numeric" value={item.measurements?.[key] || ""} onChangeText={v => handleMeasureChange(item.id, key, v)} />
                  </View>
                ))}

                <PhotoPicker label="Modèle" image={item.modelImage} onPick={() => pickImage(item.id, "modelImage")} />
                <PhotoPicker label="Tissu" image={item.fabricImage} onPick={() => pickImage(item.id, "fabricImage")} />
              </>
            )}
          </Section>
        ))}

        <View style={{ margin: 20, marginTop: 10, marginBottom: 50 }}>
          <PrimaryButton title="Enregistrer la commande" onPress={handleSaveOrder} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ================= UI COMPONENTS ================= */
function Section({ title, icon, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={Colors.light.tint} />
        <ThemedText style={styles.sectionTitle}>{title || "-"}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function Label({ text, required = false }: any) {
  return (
    <ThemedText style={styles.label}>
      {text || "-"}
      {required && <ThemedText style={styles.required}> *</ThemedText>}
    </ThemedText>
  );
}

function PhotoPicker({ label, image, onPick }: any) {
  return (
    <View>
      <Label text={label} />
      <TouchableOpacity style={styles.photoBox} onPress={onPick}>
        {image ? <Image source={{ uri: image }} style={styles.photo} /> : <Ionicons name="add" size={32} color="#9CA3AF" />}
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", paddingTop: 10 },
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 20, marginHorizontal: 20, marginBottom: 18, elevation: 2 },
  sectionHeader: { flexDirection: "row", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#374151" },
  label: { fontSize: 13, marginBottom: 4, color: "#374151" },
  required: { color: "#F97316" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 8, backgroundColor: "#FAFAFA" },
  dateInput: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: "#FAFAFA" },
  photoBox: { height: 140, borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", justifyContent: "center", alignItems: "center", marginBottom: 12, backgroundColor: "#FAFAFA" },
  photo: { width: "100%", height: "100%" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeButton: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 20, backgroundColor: "#F9FAFB" },
  typeButtonSelected: { backgroundColor: "#F97316", borderColor: "#F97316" },
  typeText: { color: "#374151", fontWeight: "500" },
  typeTextSelected: { color: "#fff", fontWeight: "600" },
  addClothButton: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "#F97316", justifyContent: "center", alignItems: "center", elevation: 4 },
});