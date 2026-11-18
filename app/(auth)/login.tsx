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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

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

            <Text style={styles.title}>Hola de nuevo</Text>
            <Text style={styles.subtitle}>
              Entra y ponte al día con tu gente.
            </Text>

            <GlassCard style={styles.card} intensity={45}>
              {error ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

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
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={() => login({ email, password })}
                accessibilityLabel="Contraseña"
              />

              <GlassButton
                title="Entrar"
                onPress={() => login({ email, password })}
                loading={isLoading}
                style={styles.submit}
                accessibilityLabel="Entrar a mi cuenta"
              />
            </GlassCard>

            <Link href="/(auth)/register" style={styles.link}>
              <Text style={styles.linkText}>
                ¿Todavía no tienes cuenta?{" "}
                <Text style={styles.linkStrong}>Créala aquí</Text>
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
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
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
  link: {
    marginTop: spacing.xl,
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
