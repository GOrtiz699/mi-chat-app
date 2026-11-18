import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, typography } from "@shared/presentation/theme/tokens";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  /** Nombre del que se derivan las iniciales y el color */
  name: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

/** Paleta de avatares del design system (contraste sobre #0F0C29) */
const AVATAR_COLORS = [
  "#7C5CFF", // violeta
  "#FF6B9D", // coral
  "#3DDBD9", // turquesa
  "#F6C860", // ámbar
  "#8E7CFF", // lavanda
  "#4ADE80", // menta
  "#5EB3FF", // azul
] as const;

const SIZES: Record<AvatarSize, { box: number; fontSize: number; lineHeight: number }> = {
  xs: { box: 24, fontSize: 10, lineHeight: 12 },
  sm: { box: 32, fontSize: 13, lineHeight: 16 },
  md: { box: 40, fontSize: 16, lineHeight: 20 },
  lg: { box: 56, fontSize: 22, lineHeight: 26 },
};

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const compact = name.replace(/[\s._-]+/g, "");
  return compact.slice(0, 2).toUpperCase();
}

/**
 * Avatar de iniciales con color determinístico derivado del nombre.
 * Sin lógica de negocio: mismo nombre → mismo color y mismas iniciales.
 */
export function Avatar({ name, size = "md", style }: AvatarProps) {
  const trimmed = name.trim() || "?";
  const backgroundColor = AVATAR_COLORS[hashName(trimmed) % AVATAR_COLORS.length];
  const initials = getInitials(trimmed);
  const dims = SIZES[size];

  return (
    <View
      style={[
        styles.base,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: radius.pill,
          backgroundColor,
        },
        style,
      ]}
      accessibilityLabel={`Avatar de ${trimmed}`}
    >
      <Text
        style={[
          styles.initials,
          { fontSize: dims.fontSize, lineHeight: dims.lineHeight },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  initials: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
});
