import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { ChatImage } from "@features/chat/domain/entities/ChatImage";
import { Message } from "@features/chat/domain/entities/Message";
import { FullscreenImageModal } from "@features/chat/presentation/components/FullscreenImageModal";
import { ImagePreviewBar } from "@features/chat/presentation/components/ImagePreviewBar";
import { MessageImage } from "@features/chat/presentation/components/MessageImage";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  Avatar,
  Bubble,
  EmptyState,
  ErrorState,
  GlassButton,
  GlassHeader,
  GradientBackground,
  SkeletonBubble,
} from "@shared/presentation/components";
import {
  blur,
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function inferMimeTypeFromUri(uri: string): string | null {
  const match = /\.(jpe?g|png|webp)(\?|$)/i.exec(uri);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "image/webp";
}

export default function ChatScreen() {
  const { roomId, name } = useLocalSearchParams<{ roomId: string; name?: string }>();
  const roomName = name ? decodeURIComponent(name) : "Sala";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    messages,
    sendMessageAsync,
    isLoading,
    isSending,
    loadError,
    sendError,
    clearSendError,
  } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<ChatImage | null>(null);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const applyPickerResult = useCallback((result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType?.toLowerCase() ?? inferMimeTypeFromUri(asset.uri);
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      Alert.alert("Imagen no soportada", "Solo se pueden enviar imágenes JPEG, PNG o WebP.");
      return;
    }
    if (asset.fileSize !== undefined && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert("Imagen demasiado pesada", "El límite es 5 MB por imagen.");
      return;
    }
    setSelectedImage({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType,
      fileSize: asset.fileSize ?? undefined,
    });
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        permission.canAskAgain
          ? "Necesitas permitir el acceso a tus fotos para adjuntar imágenes."
          : "Activa el acceso a Fotos en Ajustes de tu dispositivo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1, // la compresión real se hace en UploadImageUseCase
    });
    applyPickerResult(result);
  }, [applyPickerResult]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        permission.canAskAgain
          ? "Necesitas permitir el acceso a la cámara para tomar fotos."
          : "Activa el acceso a la Cámara en Ajustes de tu dispositivo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });
    applyPickerResult(result);
  }, [applyPickerResult]);

  const handleAttachPress = useCallback(() => {
    Alert.alert("Adjuntar imagen", "Elige el origen", [
      { text: "Galería", onPress: () => void pickFromLibrary() },
      { text: "Cámara", onPress: () => void takePhoto() },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, [pickFromLibrary, takePhoto]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    const image = selectedImage ?? undefined;
    if (!trimmed && !image) return;
    if (isSending) return;

    // Limpieza optimista; se restaura si falla.
    setInput("");
    setSelectedImage(null);

    const ok = await sendMessageAsync(trimmed, image);
    if (!ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setInput(trimmed);
      if (image) setSelectedImage(image);
    }
  }, [input, selectedImage, isSending, sendMessageAsync]);

  const renderMsg = useCallback(
    ({ item }: { item: Message }) => {
      const isOwn = item.userId === user?.id;
      const hasText = !!item.content;
      const hasImage = !!item.imageUrl;
      const time = item.createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <Bubble
          isOwn={isOwn}
          author={isOwn ? undefined : item.authorUsername}
          time={time}
          leading={!isOwn ? <Avatar name={item.authorUsername ?? "?"} size="xs" /> : undefined}
        >
          {hasImage ? (
            <MessageImage
              uri={item.imageUrl!}
              uploadStatus={item.uploadStatus}
              onOpen={setFullscreenUri}
            />
          ) : null}
          {hasText ? (
            <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
              {item.content}
            </Text>
          ) : null}
        </Bubble>
      );
    },
    [user?.id],
  );

  const chatHeader = (
    <GlassHeader
      onBack={() => router.back()}
      center={
        <View style={styles.headerIdentity}>
          <Avatar name={roomName} size="sm" />
          <View style={styles.headerTexts}>
            <Text style={styles.headerRoomName} numberOfLines={1}>
              # {roomName}
            </Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>en vivo</Text>
            </View>
          </View>
        </View>
      }
    />
  );

  return (
    <GradientBackground>
      {chatHeader}

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {isLoading ? (
          <View style={styles.skeletonList}>
            <SkeletonBubble />
            <SkeletonBubble own />
            <SkeletonBubble />
            <SkeletonBubble own />
          </View>
        ) : loadError ? (
          <ErrorState
            title="No pudimos cargar los mensajes"
            message={loadError}
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMsg}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={16}
            maxToRenderPerBatch={12}
            windowSize={7}
            ListEmptyComponent={
              <EmptyState
                glyph="✧"
                title="Aún no hay mensajes"
                subtitle="¡Rompe el hielo y di algo primero!"
              />
            }
          />
        )}

        {sendError ? (
          <Pressable
            style={styles.sendErrorBar}
            onPress={clearSendError}
            accessibilityRole="button"
            accessibilityLabel="Descartar error"
          >
            <Text style={styles.sendErrorText} numberOfLines={2}>
              {sendError} — toca para descartar
            </Text>
          </Pressable>
        ) : null}

        {selectedImage ? (
          <ImagePreviewBar
            image={selectedImage}
            isSending={isSending}
            onRemove={() => setSelectedImage(null)}
          />
        ) : null}

        {/* Barra de entrada flotante de vidrio */}
        <View style={[styles.inputDock, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.inputBar}>
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={blur.inputBar}
                tint="dark"
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            ) : null}
            <Pressable
              onPress={handleAttachPress}
              disabled={isSending}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Adjuntar imagen"
              style={({ pressed }) => [styles.attachButton, pressed && styles.attachPressed]}
            >
              <Text style={styles.attachGlyph}>＋</Text>
            </Pressable>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribe algo…"
              placeholderTextColor={colors.text.tertiary}
              selectionColor={colors.accent.primary}
              cursorColor={colors.accent.primary}
              multiline
              maxLength={500}
              editable={!isSending}
              accessibilityLabel="Mensaje"
            />
            <GlassButton
              icon={<Text style={styles.sendGlyph}>↑</Text>}
              onPress={handleSend}
              shape="circle"
              loading={isSending}
              style={styles.sendButton}
              accessibilityLabel="Enviar mensaje"
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <FullscreenImageModal
        uri={fullscreenUri}
        onClose={() => setFullscreenUri(null)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerTexts: {
    gap: 2,
  },
  headerRoomName: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    color: colors.text.primary,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent.tertiary,
  },
  liveText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.secondary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  listEmpty: {
    justifyContent: "center",
  },
  skeletonList: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    justifyContent: "center",
  },
  messageText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  ownText: {
    color: colors.text.onAccent,
  },
  otherText: {
    color: colors.text.primary,
  },
  sendErrorBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.4)",
    borderRadius: radius.md,
  },
  sendErrorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.status.error,
  },
  inputDock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    minHeight: 56,
    padding: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: Platform.OS === "ios" ? "rgba(27,24,56,0.55)" : "rgba(27,24,56,0.95)",
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  attachPressed: {
    opacity: 0.7,
  },
  attachGlyph: {
    color: colors.accent.tertiary,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm + 2,
    maxHeight: 120,
  },
  sendButton: {
    alignSelf: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sendGlyph: {
    color: colors.text.onAccent,
    fontSize: 20,
    lineHeight: 22,
    fontFamily: typography.fontFamily.bold,
  },
});
