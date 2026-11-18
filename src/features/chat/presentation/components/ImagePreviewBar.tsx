import { ChatImage } from "@features/chat/domain/entities/ChatImage";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

interface ImagePreviewBarProps {
  image: ChatImage;
  /** Deshabilita el botón de quitar mientras se envía/sube */
  isSending: boolean;
  onRemove: () => void;
}

function formatSize(bytes?: number): string | null {
  if (bytes === undefined || Number.isNaN(bytes)) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Vista previa de la imagen seleccionada: thumbnail + metadatos + quitar. */
export function ImagePreviewBar({ image, isSending, onRemove }: ImagePreviewBarProps) {
  const sizeLabel = formatSize(image.fileSize);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image.uri }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.thumbnail}
      />
      <View style={styles.meta}>
        <Text style={styles.title}>Imagen lista para enviar</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {image.mimeType.replace("image/", "").toUpperCase()}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
          {` · ${image.width}×${image.height}`}
        </Text>
        {isSending ? <Text style={styles.uploading}>Subiendo…</Text> : null}
      </View>
      <Pressable
        style={({ pressed }) => [styles.removeButton, pressed && styles.removePressed]}
        onPress={onRemove}
        disabled={isSending}
        accessibilityRole="button"
        accessibilityLabel="Quitar imagen seleccionada"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: "rgba(27,24,56,0.85)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.borderSoft,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.secondary,
  },
  uploading: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.accent.tertiary,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  removePressed: {
    opacity: 0.7,
  },
  removeText: {
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
  },
});
