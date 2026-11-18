import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  blur,
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

interface FullscreenImageModalProps {
  /** URI de la imagen o null cuando está cerrado */
  uri: string | null;
  onClose: () => void;
}

/** Visor de imagen a pantalla completa sobre fondo desenfocado. */
export function FullscreenImageModal({ uri, onClose }: FullscreenImageModalProps) {
  return (
    <Modal
      visible={uri !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          Platform.OS !== "ios" && styles.androidBackdrop,
        ]}
      >
        {Platform.OS === "ios" ? (
          <>
            <BlurView
              intensity={blur.overlay}
              tint="dark"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.scrim} pointerEvents="none" />
          </>
        ) : null}

        <Pressable style={styles.root} onPress={onClose}>
          {uri ? (
            <Image
              source={{ uri }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={150}
              style={styles.image}
            />
          ) : null}
          <View style={styles.closeButton} pointerEvents="none">
            <Text style={styles.closeGlyph}>✕</Text>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  androidBackdrop: {
    backgroundColor: "rgba(6,5,20,0.85)",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6,5,20,0.45)",
  },
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: spacing.xxxl + spacing.sm,
    right: spacing.xl,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  closeGlyph: {
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: typography.fontFamily.medium,
  },
});
