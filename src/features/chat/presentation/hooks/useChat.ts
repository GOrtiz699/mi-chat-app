import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { GetMessagesUseCase } from "@features/chat/application/use-cases/GetMessagesUseCase";
import { SendMessageUseCase } from "@features/chat/application/use-cases/SendMessageUseCase";
import { SubscribeToRoomUseCase } from "@features/chat/application/use-cases/SubscribeToRoomUseCase";
import { ChatImage } from "@features/chat/domain/entities/ChatImage";
import { Message } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { ExpoImageProcessor } from "@features/chat/infrastructure/services/ExpoImageProcessor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const chatRepo = new SupabaseChatRepository();
const imageProcessor = new ExpoImageProcessor();
const sendMessageUseCase = new SendMessageUseCase(chatRepo, imageProcessor);
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

type SendVariables = { content: string; image?: ChatImage };

function isTempMessage(message: Message): boolean {
  return message.id.startsWith("temp-");
}

/** Un temp message "corresponde" al INSERT de Realtime si usuario y contenido coinciden. */
function matchesTemp(temp: Message, real: Message): boolean {
  return (
    temp.userId === real.userId &&
    (temp.content ?? "") === (real.content ?? "") &&
    !!temp.imageUrl === !!real.imagePath
  );
}

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Paso 1: obtener historial de mensajes con cache
  const {
    data: messages = [],
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["messages", roomId], // Clave única por sala
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    // Los mensajes antiguos no se revalidan automáticamente.
    // Realtime se encarga de los mensajes nuevos.
    staleTime: Infinity,
  });

  // Paso 2: suscribirse al canal Realtime
  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
        // El INSERT ya llegó por onSuccess de la mutación: no duplicar.
        if (old.some((m) => m.id === newMsg.id)) return old;
        // Reemplazar el temporal optimista si corresponde (mismo autor/contenido/imagen).
        const remaining = old.filter(
          (m) => !(isTempMessage(m) && matchesTemp(m, newMsg)),
        );
        return [...remaining, newMsg];
      });
    });
    return unsubscribe; // Cleanup al desmontar: cierra el WebSocket
  }, [roomId, queryClient]);

  // Paso 3: enviar mensaje con optimistic update via useMutation
  const sendMutation = useMutation({
    mutationFn: ({ content, image }: SendVariables) =>
      sendMessageUseCase.execute(roomId, user!.id, content, image),

    // onMutate se ejecuta ANTES de la petición (optimistic update)
    onMutate: async ({ content, image }) => {
      const trimmed = content.trim();
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content: trimmed === "" ? null : trimmed,
        // La imagen local se muestra al instante con estado "subiendo".
        imageUrl: image?.uri,
        uploadStatus: image ? "uploading" : undefined,
        createdAt: new Date(),
        authorUsername: user!.username,
      };
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [
        ...old,
        tempMsg,
      ]);
      return { tempMsg }; // Contexto para onError
    },

    onSuccess: (realMsg, _vars, context) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
        // Si Realtime ya insertó el mensaje real, solo descartar el temporal.
        if (old.some((m) => m.id === realMsg.id)) {
          return old.filter((m) => m.id !== context?.tempMsg.id);
        }
        return old.map((m) => (m.id === context?.tempMsg.id ? realMsg : m));
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
          old.filter((m) => m.id !== context.tempMsg.id),
        );
      }
    },
  });

  return {
    messages,
    /** Encolar un envío (texto, imagen o ambos). Fire-and-forget: usa `sendError` para feedback. */
    sendMessage: (content: string, image?: ChatImage) =>
      sendMutation.mutate({ content, image }),
    /** Variante awaitable: resuelve con true si se envió, false si falló. */
    sendMessageAsync: async (
      content: string,
      image?: ChatImage,
    ): Promise<boolean> => {
      try {
        await sendMutation.mutateAsync({ content, image });
        return true;
      } catch {
        return false;
      }
    },
    isLoading,
    isSending: sendMutation.isPending,
    loadError: loadError?.message ?? null,
    sendError: sendMutation.error?.message ?? null,
    clearSendError: () => sendMutation.reset(),
  };
}
