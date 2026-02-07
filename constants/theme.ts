import { Platform } from "react-native";

/**
 * Atelier+ Design System
 * Orange • Noir • Blanc
 */

const orangePrimary = "#F97316";

export const Colors = {
  light: {
    text: "#111827",          // Noir pro
    background: "#F9FAFB",    // Gris très clair
    card: "#FFFFFF",
    border: "#E5E7EB",

    tint: orangePrimary,      // Orange Atelier+
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: orangePrimary,
  },

  dark: {
    text: "#F9FAFB",
    background: "#0F172A",    // Bleu-noir profond
    card: "#111827",
    border: "#1F2937",

    tint: orangePrimary,
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: orangePrimary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
