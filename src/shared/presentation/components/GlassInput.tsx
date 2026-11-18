import { useState, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Etiqueta flotante encima del campo */
  label?: string;
  /** Mensaje de error; activa borde rojo y texto bajo el campo */
  error?: string | null;
  icon?: ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  maxLength?: number;
  multiline?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "send" | "search";
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Campo de texto de vidrio: borde que se ilumina en violeta al enfocar. */
export function GlassInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "sentences",
  autoCorrect,
  maxLength,
  multiline = false,
  editable = true,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
  accessibilityLabel,
  style,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.status.error
    : focused
      ? colors.accent.primary
      : colors.glass.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          { borderColor },
          focused && !error && styles.fieldFocused,
          !editable && styles.fieldDisabled,
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.accent.primary}
          cursorColor={colors.accent.primary}
          style={[styles.input, multiline && styles.multilineInput]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          editable={editable}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.text.secondary,
    paddingHorizontal: spacing.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glass.fill,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.md,
  },
  multilineField: {
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    minHeight: 80,
  },
  fieldFocused: {
    backgroundColor: colors.glass.fillStrong,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    paddingVertical: 0, // Android centra el texto sin el padding nativo
  },
  multilineInput: {
    minHeight: 48,
    textAlignVertical: "top",
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.status.error,
    paddingHorizontal: spacing.xs,
  },
});
