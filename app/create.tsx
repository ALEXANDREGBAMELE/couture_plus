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
/* ===================== MESURES ===================== */
/* ===================== MESURES ===================== */
const MEASUREMENT_LABELS: Record<string, string> = {
  chest: "Poitrine",
  waist: "Taille",
  hip: "Hanche",
  dress_length: "Longueur robe",
  bust_length: "Longueur buste",
  skirt_length: "Longueur jupe",
  back_width: "Carrure dos",
  shoulder: "Épaule",
  sleeve_length: "Longueur manche",
  arm_circumference: "Tour de bras",
  wrist: "Poignet",
  neck: "Cou",
  bust_height: "Hauteur poitrine",
  bust_distance: "Écart poitrine",
  pant_length: "Longueur pantalon",
  inseam: "Entrejambe",
  thigh: "Cuisse",
  knee: "Genou",
  bottom: "Bas",
  front_rise: "Montant devant",
  back_rise: "Montant derrière",
  jacket_length: "Longueur veste",
  camisole_length: "Longueur camisole",
  boubou_length: "Longueur boubou",
  sleeve_width: "Largeur manche",
  skirt_waist: "Taille jupe",
  skirt_hip: "Hanche jupe",
};

const MEASURES_BY_TYPE: Record<string, string[]> = {
  robe: [
    "chest",
    "waist",
    "hip",
    "dress_length",
    "bust_height",
    "bust_distance",
    "shoulder",
    "sleeve_length",
  ],
  pantalon: [
    "waist",
    "hip",
    "pant_length",
    "inseam",
    "thigh",
    "knee",
    "bottom",
    "front_rise",
    "back_rise",
  ],
  chemise: [
    "chest",
    "waist",
    "shoulder",
    "sleeve_length",
    "neck",
    "back_width",
  ],
  veste: [
    "chest",
    "waist",
    "shoulder",
    "sleeve_length",
    "jacket_length",
  ],
  boubou: [
    "chest",
    "waist",
    "hip",
    "boubou_length",
    "sleeve_length",
    "shoulder",
  ],
  jupe: [
    "waist",
    "hip",
    "skirt_length",
    "skirt_waist",
    "skirt_hip",
  ],
  camisole: [
    "chest",
    "waist",
    "hip",
    "camisole_length",
    "bust_height",
    "bust_distance",
  ],
};

export default function CreateOrderScreen() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [notes, setNotes] = useState("");

  const [currentType, setCurrentType] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  /* ================= PERMISSIONS ================= */
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin d'accéder à vos images pour ajouter des photos"
        );
      }

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin d'accéder à la caméra pour prendre des photos"
        );
      }
    })();
  }, []);

  /* ================= PICK IMAGE / CAMERA ================= */
  const pickImage = async (itemId: string, field: "modelImage" | "fabricImage") => {
    Alert.alert(
      "Ajouter une photo",
      "Choisir la source",
      [
        {
          text: "Galerie",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setOrderItems(prev =>
                prev.map(item => (item.id === itemId ? { ...item, [field]: uri } : item))
              );
            }
          },
        },
        {
          text: "Caméra",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setOrderItems(prev =>
                prev.map(item => (item.id === itemId ? { ...item, [field]: uri } : item))
              );
            }
          },
        },
        { text: "Annuler", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  /* ================= AJOUTER VÊTEMENT ================= */
  const handleAddCloth = () => {
    if (!currentType) return;

    const newItem = {
      id: Date.now().toString(),
      clothType: currentType,
      modelImage: null,
      fabricImage: null,
      measurements: {},
    };

    setOrderItems(prev => [...prev, newItem]);
    setCurrentType(null);
  };

  const handleMeasureChange = (itemId: string, key: string, value: string) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, measurements: { ...item.measurements, [key]: value } }
          : item
      )
    );
  };

  /* ================= DATE PICKER ================= */
  // const onChangeDate = (event: any, selectedDate?: Date) => {
  //   let currentDate: Date | undefined = selectedDate;

  //   if (Platform.OS === "android") {
  //     // Android : event.type indique si l'utilisateur a annulé ou validé
  //     if (event.type === "dismissed") {
  //       setShowDatePicker(false);
  //       return;
  //     }
  //     currentDate = selectedDate || (event?.nativeEvent?.timestamp ? new Date(event.nativeEvent.timestamp) : undefined);
  //     setShowDatePicker(false); // ferme le picker
  //   }

  //   // iOS : selectedDate contient la date choisie
  //   if (currentDate) {
  //     setDeliveryDate(currentDate);
  //   }
  // };

  const onChange = (event?: any, selectedDate?: Date) => {
    const currentDate = selectedDate || deliveryDate || new Date();
    setShowPicker(Platform.OS === 'ios'); // Keep picker open on Android after selection
    // setDate(currentDate);
   
     if (currentDate) {
      setDeliveryDate(currentDate);
    }
  };

  // const showDatepicker = () => {
  //   setShowPicker(true);
  // };

  /* ================= ENREGISTRER ================= */
  const handleSaveOrder = () => {
    if (!clientName || orderItems.length === 0) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    const formattedItems = orderItems.map(item => ({
      clothType: item.clothType,
      modelImage: item.modelImage,
      fabricImage: item.fabricImage,
      measurements: Object.entries(item.measurements).map(([label, value]) => ({
        label,
        value: Number(value),
      })),
    }));

    const orderData = {
      client: { name: clientName, phone: clientPhone },
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
      notes: notes || null,
      orderItems: formattedItems,
      status: "new",
      orderDate: new Date().toISOString(),
    };

    createOrderOffline(orderData as any);

    alert("Commande enregistrée ✔️");
    router.push("/");
  };

  /* ================= RENDER ================= */
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <ThemedText style={styles.title}>Nouvelle commande</ThemedText> */}

        {/* ================= CLIENT ================= */}
        <Section title="Client" icon="person-outline">
          <Label text="Nom du client" required />
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
          />

          <Label text="Téléphone" required />
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={clientPhone}
            onChangeText={setClientPhone}
          />

          {/* <View>
            <Text>Selected Date: {date.toLocaleDateString()}</Text>
            <Button onPress={showDatepicker} title="Select date" />
            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date" // Set mode to 'date' for a date picker
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}  
          </View> */}

          /* ================= DATE PICKER ADAPTÉ ================= */
          <View style={{ marginVertical: 10 }}>
            <Label text="Date de livraison" required />

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <ThemedText style={{ marginLeft: 8, color: deliveryDate ? "#111" : "#6B7280" }}>
                {/* <Text>
                  {date
                    ? date.toLocaleDateString("fr-FR")
                    : "Sélectionner une date"}
                </Text> */}
                {deliveryDate ? deliveryDate.toLocaleDateString("fr-FR") : "Sélectionner une date"}
              </ThemedText>
            </TouchableOpacity>

            {/* {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setShowPicker(Platform.OS === "ios"); // iOS : reste ouvert, Android : ferme
                  setDate(currentDate);
                  setDeliveryDate(currentDate); // stocke dans ton état principal pour l'enregistrement
                }}
              />
            )} */}

            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={deliveryDate ? deliveryDate : new Date()}
                mode="date" // Set mode to 'date' for a date picker
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
          </View>
        </Section>

        {/* ================= AJOUTER VÊTEMENT ================= */}
        <Section title="Ajouter un vêtement" icon="shirt-outline">
          <View style={styles.typeRow}>
            {Object.keys(MEASURES_BY_TYPE).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  currentType === type && styles.typeButtonSelected
                ]}
                onPress={() => setCurrentType(type)}
              >
                <ThemedText
                  style={currentType === type ? styles.typeTextSelected : styles.typeText}
                >
                  
                  {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalise le premier lettre */}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addClothButton} onPress={handleAddCloth}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </Section>

        {/* ================= MESURES & PHOTOS ================= */}
        {orderItems.map(item => (
          <Section key={item.id} title={`Mesures - ${item.clothType}`} icon="resize-outline">
            {MEASURES_BY_TYPE[item.clothType]?.map(key => (
              <View key={key}>
                <Label text={MEASUREMENT_LABELS[key]} required />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={item.measurements?.[key] || ""}
                  onChangeText={v => handleMeasureChange(item.id, key, v)}
                />
              </View>
            ))}

            <PhotoPicker
              label="Modèle"
              image={item.modelImage}
              onPick={() => pickImage(item.id, "modelImage")}
            />

            <PhotoPicker
              label="Tissu"
              image={item.fabricImage}
              onPick={() => pickImage(item.id, "fabricImage")}
            />
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
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function Label({ text, required = false }: any) {
  return (
    <ThemedText style={styles.label}>
      {text}
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
  title: { fontSize: 26, fontWeight: "700", margin: 20, color: "#111" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 18,
    elevation: 2,
  },
  sectionHeader: { flexDirection: "row", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#374151" },
  label: { fontSize: 13, marginBottom: 4, color: "#374151" },
  required: { color: "#F97316" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  photoBox: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  photo: { width: "100%", height: "100%" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  typeButtonSelected: { backgroundColor: "#F97316", borderColor: "#F97316" },
  typeText: { color: "#374151", fontWeight: "500" },
  typeTextSelected: { color: "#fff", fontWeight: "600" },
  addClothButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
