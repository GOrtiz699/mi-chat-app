import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Room } from "@features/chat/domain/entities/Message";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Avatar,
  EmptyState,
  ErrorState,
  GlassButton,
  GlassCard,
  GlassHeader,
  GradientBackground,
  SkeletonRoomCard,
} from "@shared/presentation/components";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@shared/presentation/theme/tokens";

function formatRoomDate(date: Date): string {
  return `creada el ${date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })}`;
}

export default function RoomsScreen() {
  const { rooms, isLoading, error, createRoom, isCreating, createError } = useRooms();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const openChat = useCallback(
    (room: Room) => {
      router.push(`/chat/${room.id}?name=${encodeURIComponent(room.name)}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    const trimmed = roomName.trim();
    if (!trimmed || isCreating) return;
    createRoom(trimmed, {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  }, [roomName, isCreating, createRoom]);

  const renderRoom = useCallback(
    ({ item }: { item: Room }) => (
      <GlassCard
        padded={false}
        onPress={() => openChat(item)}
        style={styles.roomCard}
        accessibilityLabel={`Abrir sala ${item.name}`}
      >
        <View style={styles.roomRow}>
          <Avatar name={item.name} size="lg" />
          <View style={styles.roomMeta}>
            <Text style={styles.roomName} numberOfLines={1}>
              # {item.name}
            </Text>
            <Text style={styles.roomDate}>{formatRoomDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </GlassCard>
    ),
    [openChat],
  );

  const renderHeader = (
    <GlassHeader
      title="Salas"
      subtitle="Tu gente, tu vibe"
      leading={
        <View style={styles.headerBrand}>
          <View style={styles.headerDot} />
        </View>
      }
      trailing={
        <Pressable
          onPress={logout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={styles.logoutPill}
        >
          <Avatar name={user?.username ?? "?"} size="xs" />
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      }
    />
  );

  if (isLoading) {
    return (
      <GradientBackground>
        {renderHeader}
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonRoomCard key={i} />
          ))}
        </View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        {renderHeader}
        <ErrorState
          title="No pudimos cargar las salas"
          message={error}
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      {renderHeader}

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={[
          styles.list,
          rooms.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={8}
        ListEmptyComponent={
          <EmptyState
            glyph="✧"
            title="Todavía no hay salas"
            subtitle="Crea la primera y convence a tu gente de unirse."
            actionLabel="Crear sala"
            onAction={() => setModalVisible(true)}
          />
        }
      />

      {/* FAB crear sala */}
      <GlassButton
        icon={<Text style={styles.fabGlyph}>+</Text>}
        onPress={() => setModalVisible(true)}
        shape="circle"
        style={styles.fab}
        accessibilityLabel="Crear una sala nueva"
      />

      {/* Modal crear sala */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
            accessibilityLabel="Cerrar"
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva sala</Text>
            <Text style={styles.modalSubtitle}>
              Un nombre corto y pegajoso.
            </Text>

            {createError ? (
              <View style={styles.modalError} accessibilityRole="alert">
                <Text style={styles.modalErrorText}>{createError}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la sala"
              placeholderTextColor={colors.text.tertiary}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
              selectionColor={colors.accent.primary}
              cursorColor={colors.accent.primary}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              accessibilityLabel="Nombre de la sala"
            />

            <View style={styles.modalActions}>
              <GlassButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setModalVisible(false)}
                style={styles.modalCancel}
                haptic={false}
              />
              <GlassButton
                title="Crear"
                onPress={handleCreate}
                loading={isCreating}
                style={styles.modalCreate}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  listEmpty: {
    flexGrow: 1,
  },
  headerBrand: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.tertiary,
    shadowColor: colors.accent.tertiary,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
  },
  logoutText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.secondary,
  },
  roomCard: {
    marginBottom: spacing.md,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  roomMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  roomName: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    color: colors.text.primary,
  },
  roomDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.text.tertiary,
  },
  chevron: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.text.tertiary,
  },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xxxl,
  },
  fabGlyph: {
    color: colors.text.onAccent,
    fontSize: 28,
    lineHeight: 30,
    fontFamily: typography.fontFamily.regular,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(6,5,20,0.6)",
  },
  modalCard: {
    backgroundColor: "#1B1838",
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.text.secondary,
    marginTop: -spacing.xs,
  },
  modalError: {
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.4)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalErrorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.status.error,
  },
  modalInput: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.border,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalCancel: {
    minWidth: 92,
  },
  modalCreate: {
    minWidth: 110,
  },
});
