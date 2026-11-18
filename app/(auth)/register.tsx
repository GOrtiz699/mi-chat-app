import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GradientBackground,
  GlassButton,
  GlassCard,
  GlassInput,
} from "@shared/presentation/components";
import {
  colors,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { register, isLoading, error } = useAuth();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Marca */}
            <View style={styles.brand}>
              <View style={styles.brandDot} />
              <Text style={styles.wordmark}>mi chat</Text>
            </View>

            <Text style={styles.title}>Únete a la charla</Text>
            <Text style={styles.subtitle}>
              Un minuto y ya eres de la casa.
            </Text>

            <GlassCard style={styles.card} intensity={45}>
              {error ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <GlassInput
                label="Usuario"
                placeholder="sin espacios, sin drama"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Nombre de usuario"
              />
              <GlassInput
                label="Correo"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                accessibilityLabel="Correo electrónico"
              />
              <GlassInput
                label="Contraseña"
                placeholder="mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={() => register({ email, password, username })}
                accessibilityLabel="Contraseña"
              />

              <GlassButton
                title="Crear mi cuenta"
                onPress={() => register({ email, password, username })}
                loading={isLoading}
                style={styles.submit}
                accessibilityLabel="Crear mi cuenta"
              />
            </GlassCard>

            <Text style={styles.finePrint}>
              Al registrarte aceptas las reglas de la comunidad.
            </Text>

            <Link href="/(auth)/login" style={styles.link}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.linkStrong}>Inicia sesión</Text>
              </Text>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  brandDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent.secondary,
    shadowColor: colors.accent.secondary,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  wordmark: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    color: colors.text.secondary,
    letterSpacing: 4,
    textTransform: "lowercase",
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.xxl,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    gap: spacing.lg,
  },
  errorBanner: {
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.4)",
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.status.error,
  },
  submit: {
    marginTop: spacing.xs,
  },
  finePrint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  link: {
    marginTop: spacing.lg,
    alignSelf: "center",
  },
  linkText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.secondary,
  },
  linkStrong: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.accent.tertiary,
  },
});
