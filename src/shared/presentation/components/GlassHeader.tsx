import { BlurView } from "expo-blur";
import { type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  blur,
  colors,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

interface GlassHeaderProps {
  /** Título principal; opcional si pasas `center` (nodo central libre) */
  title?: string;
  subtitle?: string;
  /** Slot izquierdo; si pasas onBack se renderiza un botón ‹ automáticamente */
  leading?: ReactNode;
  /** Slot derecho (acciones) */
  trailing?: ReactNode;
  onBack?: () => void;
  /** Nodo central libre (por ejemplo, Avatar + título de sala). Reemplaza title/subtitle. */
  center?: ReactNode;
}

/** Header de vidrio: BlurView en iOS, relleno translúcido en Android. */
export function GlassHeader({
  title,
  subtitle,
  leading,
  trailing,
  onBack,
  center,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();

  const left = onBack ? (
    <Pressable
      onPress={onBack}
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <Text style={styles.backGlyph}>‹</Text>
    </Pressable>
  ) : (
    leading ?? <View style={styles.sidePlaceholder} />
  );

  const content = center ?? (
    <View style={styles.titleBlock}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  const body = (
    <View style={[styles.inner, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>{content}</View>
      <View style={[styles.side, styles.sideRight]}>
        {trailing ?? <View style={styles.sidePlaceholder} />}
      </View>
    </View>
  );

  return Platform.OS === "ios" ? (
    <BlurView intensity={blur.header} tint="dark" style={styles.container}>
      <View style={styles.tint}>{body}</View>
    </BlurView>
  ) : (
    <View style={[styles.container, styles.containerAndroid]}>{body}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderSoft,
    zIndex: 10,
  },
  containerAndroid: {
    backgroundColor: "rgba(24,20,52,0.92)",
  },
  tint: {
    backgroundColor: "rgba(24,20,52,0.55)",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 56,
    gap: spacing.sm,
  },
  side: {
    minWidth: 44,
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  sidePlaceholder: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    alignItems: "center",
    gap: 1,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.secondary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
  },
  backGlyph: {
    color: colors.text.primary,
    fontSize: 26,
    lineHeight: 30,
    marginTop: -2,
  },
});
