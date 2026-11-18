/* eslint-disable react-hooks/immutability -- Las shared values de reanimated son mutables por diseño (scale.value). */
import { BlurView } from "expo-blur";
import { useCallback, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { blur, colors, radius, shadows, spacing } from "@shared/presentation/theme/tokens";

interface GlassCardProps {
  children: ReactNode;
  /** Intensidad del BlurView en iOS (por defecto card). En Android se ignora. */
  intensity?: number;
  /** Relleno interno; false para controlar el padding desde afuera */
  padded?: boolean;
  /** Si se pasa onPress, la tarjeta se vuelve presionable con feedback de escala */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Superficie de vidrio: BlurView en iOS; en Android un relleno translúcido
 * (el blur nativo es costoso/incómodo allí). Borde 1 px + sombra suave.
 */
export function GlassCard({
  children,
  intensity = blur.card,
  padded = true,
  onPress,
  style,
  accessibilityLabel,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: 120 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 180 });
  }, [scale]);

  const surface = (
    <View style={[styles.surface, padded && styles.padded, style]}>
      {children}
    </View>
  );

  const glassBody =
    Platform.OS === "ios" ? (
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        {surface}
      </BlurView>
    ) : (
      surface
    );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View style={[styles.wrapper, animatedStyle]}>{glassBody}</Animated.View>
      </Pressable>
    );
  }

  return <View style={styles.wrapper}>{glassBody}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    ...shadows.card,
  },
  blur: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  surface: {
    backgroundColor: Platform.OS === "ios" ? colors.glass.fill : colors.glass.fillStrong,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Platform.OS === "ios" ? "transparent" : colors.glass.border,
  },
  padded: {
    padding: spacing.xl,
  },
});
