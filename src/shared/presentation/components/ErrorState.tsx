import { StyleSheet, Text, View } from "react-native";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";
import { GlassButton } from "./GlassButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  /** Etiqueta del botón de reintento; se omite el botón si no hay onRetry */
  retryLabel?: string;
  onRetry?: () => void;
}

/** Estado de error centrado con reintento opcional. */
export function ErrorState({
  title = "Algo se rompió",
  message,
  retryLabel = "Reintentar",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.orb}>
        <Text style={styles.glyph}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <GlassButton
          title={retryLabel}
          variant="glass"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  orb: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.4)",
    marginBottom: spacing.sm,
  },
  glyph: {
    color: colors.status.error,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: typography.fontFamily.bold,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.text.primary,
    textAlign: "center",
  },
  message: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 300,
  },
  retry: {
    marginTop: spacing.sm,
  },
});
