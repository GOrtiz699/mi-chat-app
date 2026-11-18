/* eslint-disable react-hooks/immutability -- Las shared values de reanimated son mutables por diseño (scale.value). */
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useCallback, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  colors,
  gradients,
  radius,
  shadows,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

export type GlassButtonVariant = "primary" | "glass" | "ghost" | "danger";
export type GlassButtonShape = "pill" | "circle";

interface GlassButtonProps {
  /** Texto del botón. Ignorado en shape="circle". */
  title?: string;
  /** Icono (p. ej. "+" o "➤") para usos compactos o circulares */
  icon?: ReactNode;
  onPress: () => void;
  variant?: GlassButtonVariant;
  shape?: GlassButtonShape;
  loading?: boolean;
  disabled?: boolean;
  /** Vibración ligera al presionar (por defecto true) */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Botón del design system:
 * - primary: degradado violeta → rosa con glow violeta.
 * - glass: vidrio translúcido con borde.
 * - ghost: solo texto/icono, sin superficie (acciones secundarias).
 * - danger: vidrio con tinte rojo (acciones destructivas).
 */
export function GlassButton({
  title,
  icon,
  onPress,
  variant = "primary",
  shape = "pill",
  loading = false,
  disabled = false,
  haptic = true,
  style,
  accessibilityLabel,
}: GlassButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [haptic, onPress]);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: 120 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 160 });
  }, [scale]);

  const isDisabled = disabled || loading;
  const contentColor =
    variant === "primary" ? colors.text.onAccent : colors.text.primary;

  const inner = loading ? (
    <ActivityIndicator color={contentColor} size="small" />
  ) : (
    <View style={styles.content}>
      {icon}
      {title ? (
        <Text style={[styles.title, { color: contentColor }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Animated.View
        style={[
          styles.wrapper,
          shape === "circle" && styles.circle,
          animatedStyle,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {variant === "primary" ? (
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.surface, styles.primarySurface, shape === "circle" && styles.circleSurface]}
          >
            {inner}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.surface,
              shape === "circle" && styles.circleSurface,
              variant === "glass" && styles.glass,
              variant === "ghost" && styles.ghost,
              variant === "danger" && styles.danger,
            ]}
          >
            {inner}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.pill,
  },
  primarySurface: {
    ...shadows.glow,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  surface: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSurface: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 28,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  glass: {
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
    elevation: 0,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.35)",
  },
  disabled: {
    opacity: 0.45,
  },
});
