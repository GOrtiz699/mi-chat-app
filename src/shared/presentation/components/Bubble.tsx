import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  colors,
  gradients,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

interface BubbleProps {
  isOwn: boolean;
  /** Autor (solo se muestra en burbujas ajenas) */
  author?: string;
  /** Hora ya formateada (la formatea el caller) */
  time: string;
  /** Contenido: texto, imagen o ambos */
  children: ReactNode;
  /** Avatar/nodo a la izquierda de la burbuja ajena */
  leading?: ReactNode;
}

/**
 * Burbuja de mensaje. Propia: degradado violeta → rosa. Ajena: vidrio
 * translúcido (sin BlurView: el blur por burbuja es demasiado costoso).
 */
export function Bubble({ isOwn, author, time, children, leading }: BubbleProps) {
  const bubble: ReactNode = isOwn ? (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.bubble, styles.own]}
    >
      {children}
      <Text style={[styles.time, styles.timeOwn]}>{time}</Text>
    </LinearGradient>
  ) : (
    <View style={[styles.bubble, styles.other]}>
      {author ? <Text style={styles.author}>{author}</Text> : null}
      {children}
      <Text style={[styles.time, styles.timeOther]}>{time}</Text>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}
    >
      {!isOwn && leading ? <View style={styles.leading}>{leading}</View> : null}
      {bubble}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: spacing.xs + 2,
    alignItems: "flex-end",
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  leading: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    gap: spacing.xs,
  },
  own: {
    borderBottomRightRadius: radius.sm,
  },
  other: {
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
    borderBottomLeftRadius: radius.sm,
  },
  author: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  time: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs - 1,
    lineHeight: typography.lineHeight.xs,
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  timeOwn: {
    color: "rgba(245,245,250,0.75)",
  },
  timeOther: {
    color: colors.text.tertiary,
  },
});
