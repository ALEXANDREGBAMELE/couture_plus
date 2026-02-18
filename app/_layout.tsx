import { Colors } from "@/constants/theme";
import { initTables } from "@/database/orderRepository";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    console.log("🔄 Création des tables...");
    initTables();
    console.log("✔️ Tables créées avec succès !");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.tint,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="create-order"
        options={{ title: "Nouvelle commande" }}
      />

      <Stack.Screen
        name="orders/[id]"
        options={{ title: "Détails commande" }}
      />

      <Stack.Screen
        name="settings"
        options={{ title: "Paramètres" }}
      />
    </Stack>
  );
}
