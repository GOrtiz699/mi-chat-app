import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";
import { GlassButton } from "./GlassButton";

interface EmptyStateProps {
  /** Glifo decorativo (no emoji), por ejemplo "✦" */
  glyph?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

/** Estado vacío centrado: glifo en orbe de vidrio + título + acción opcional. */
export function EmptyState({
  glyph = "✦",
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.orb}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
      {actionLabel && onAction ? (
        <GlassButton title={actionLabel} onPress={onAction} style={styles.action} />
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
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.sm,
  },
  glyph: {
    color: colors.accent.tertiary,
    fontSize: 34,
    lineHeight: 40,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.sm,
  },
});
