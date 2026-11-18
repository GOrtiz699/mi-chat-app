import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { blur, gradients } from "@shared/presentation/theme/tokens";

interface GradientBackgroundProps {
  children?: ReactNode;
}

/**
 * Fondo base de la app: degradado índigo → violeta → azul noche con 3 orbes
 * de color difuminados detrás del vidrio. En iOS un BlurView funde los orbes;
 * en Android se renderizan como degradados translúcidos (sin blur, barato).
 */
export function GradientBackground({ children }: GradientBackgroundProps) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [drift]);

  const orbShiftUp = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -20 }],
    opacity: 0.75 + drift.value * 0.25,
  }));

  const orbShiftDown = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * 16 }],
    opacity: 1 - drift.value * 0.3,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Orbe violeta — arriba a la izquierda */}
      <Animated.View style={[styles.orbViolet, orbShiftUp]} pointerEvents="none">
        <LinearGradient
          colors={gradients.orbPrimary}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbFill}
        />
      </Animated.View>

      {/* Orbe coral — centro derecha */}
      <Animated.View style={[styles.orbCoral, orbShiftDown]} pointerEvents="none">
        <LinearGradient
          colors={gradients.orbSecondary}
          start={{ x: 0.8, y: 0.1 }}
          end={{ x: 0, y: 1 }}
          style={styles.orbFill}
        />
      </Animated.View>

      {/* Orbe turquesa — abajo izquierda */}
      <Animated.View style={[styles.orbTeal, orbShiftUp]} pointerEvents="none">
        <LinearGradient
          colors={gradients.orbTertiary}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 1, y: 0.9 }}
          style={styles.orbFill}
        />
      </Animated.View>

      {/* iOS funde los orbes con blur real; Android se queda con los gradientes */}
      {Platform.OS === "ios" && (
        <BlurView intensity={blur.overlay} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      )}

      {children}
    </View>
  );
}

const ORB_SIZE = 320;

const styles = StyleSheet.create({
  root: { flex: 1 },
  orbViolet: {
    position: "absolute",
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    top: -90,
    left: -90,
    overflow: "hidden",
  },
  orbCoral: {
    position: "absolute",
    width: ORB_SIZE * 0.85,
    height: ORB_SIZE * 0.85,
    borderRadius: ORB_SIZE,
    top: "28%",
    right: -120,
    overflow: "hidden",
  },
  orbTeal: {
    position: "absolute",
    width: ORB_SIZE * 0.95,
    height: ORB_SIZE * 0.95,
    borderRadius: ORB_SIZE,
    bottom: -110,
    left: -110,
    overflow: "hidden",
  },
  orbFill: { flex: 1 },
});
