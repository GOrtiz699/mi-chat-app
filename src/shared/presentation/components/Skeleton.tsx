import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, radius, spacing } from "@shared/presentation/theme/tokens";

interface SkeletonBoxProps {
  width: DimensionValue;
  height: number;
  /** Radio; por defecto radius.md */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Caja de vidrio pulsante para estados de carga. */
export function SkeletonBox({ width, height, borderRadius = radius.md, style }: SkeletonBoxProps) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.45, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Tarjeta fantasma para la lista de salas mientras carga. */
export function SkeletonRoomCard() {
  return (
    <View style={styles.roomCard}>
      <SkeletonBox width={44} height={44} borderRadius={radius.pill} />
      <View style={styles.roomLines}>
        <SkeletonBox width="55%" height={15} />
        <SkeletonBox width="35%" height={11} />
      </View>
    </View>
  );
}

/** Burbuja fantasma para el chat mientras carga el historial. */
export function SkeletonBubble({ own = false }: { own?: boolean }) {
  return (
    <View style={[styles.bubbleRow, own && styles.bubbleRowOwn]}>
      <SkeletonBox
        width="62%"
        height={own ? 56 : 44}
        borderRadius={radius.lg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
  },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
    marginBottom: spacing.md,
  },
  roomLines: {
    flex: 1,
    gap: spacing.sm,
  },
  bubbleRow: {
    width: "100%",
    flexDirection: "row",
    marginVertical: spacing.xs + 1,
  },
  bubbleRowOwn: {
    justifyContent: "flex-end",
  },
});
