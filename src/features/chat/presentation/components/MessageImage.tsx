import { Image } from "expo-image";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

// Placeholder neutro mientras carga (blurhash gris).
const PLACEHOLDER_BLURHASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

interface MessageImageProps {
  uri: string;
  /** 'uploading' mientras el mensaje temporal está en vuelo */
  uploadStatus?: "uploading" | "error";
  onOpen: (uri: string) => void;
}

/**
 * Imagen dentro de la burbuja: tarjeta de vidrio con esquinas redondeadas,
 * cache en disco/memoria + placeholder, overlay "Subiendo…" para el
 * optimistic update y tap para ver en pantalla completa.
 */
export function MessageImage({ uri, uploadStatus, onOpen }: MessageImageProps) {
  const uploading = uploadStatus === "uploading";

  return (
    <Pressable
      onPress={() => onOpen(uri)}
      disabled={uploading}
      accessibilityRole="imagebutton"
      accessibilityLabel="Ver imagen en pantalla completa"
      style={({ pressed }) => [styles.frame, pressed && styles.framePressed]}
    >
      <Image
        source={{ uri }}
        placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        contentFit="cover"
        transition={150}
        style={styles.image}
      />
      {uploading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.text.primary} />
          <Text style={styles.overlayText}>Subiendo…</Text>
        </View>
      ) : null}
      {uploadStatus === "error" ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>Error al subir</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.fill,
  },
  framePressed: {
    borderColor: colors.glass.border,
    opacity: 0.92,
  },
  image: {
    width: 224,
    height: 168,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,12,41,0.55)",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  overlayText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
  },
  errorText: {
    color: colors.status.error,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.xs,
  },
});
