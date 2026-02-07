import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function RootLayout() {
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
