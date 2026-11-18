import { supabase } from "@shared/infrastructure/supabase/client";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";
import {
  Message,
  Room,
} from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";
import { ProcessedImage } from "@features/chat/domain/services/IImageProcessor";

const BUCKET = "chat-images";
const SIGNED_URL_TTL_SECONDS = 3600; // 1 hora
const CACHE_SAFETY_MARGIN_MS = 5 * 60 * 1000; // renovar 5 min antes de que caduque

// ---- Tipos de las filas tal como las devuelve PostgREST (sin `any`) ----

interface ProfileJoin {
  username: string;
}

interface MessageRow {
  id: string;
  room_id: string;
  user_id: string;
  content: string | null;
  image_path: string | null;
  created_at: string;
  profiles: ProfileJoin | null;
}

interface RoomRow {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

const MESSAGE_SELECT =
  "id, room_id, user_id, content, image_path, created_at, profiles(username)";

/** UUID v4 ligero para nombres de archivo (colisiones improbables gracias al timestamp). */
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class SupabaseChatRepository implements IChatRepository {
  /**
   * Caché de URLs firmadas: las URLs de Storage llevan firma y caducan en 1h.
   * Guardamos en disco el `path` (lo persiste Postgres) y resolvemos la URL
   * firmada en memoria bajo demanda, renovando antes de que caduque.
   */
  private readonly signedUrlCache = new Map<
    string,
    { url: string; expiresAt: number }
  >();

  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as RoomRow[]).map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ name, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return this.mapRoom(data as RoomRow);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw error;

    const rows = (data ?? []) as unknown as MessageRow[];
    const messages = rows.map(this.mapMessage);
    return this.withSignedUrls(messages);
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string | null,
    imagePath?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: userId,
        content: content && content.trim() !== "" ? content : null,
        image_path: imagePath ?? null,
      })
      .select(MESSAGE_SELECT)
      .single();
    if (error) throw error;

    const message = this.mapMessage(data as unknown as MessageRow);
    if (message.imagePath) {
      message.imageUrl = await this.getSignedUrl(message.imagePath);
    }
    return message;
  }

  async uploadImage(
    roomId: string,
    userId: string,
    file: ProcessedImage,
  ): Promise<string> {
    // React Native + Blob => fallos espurios con Storage. Se sube como ArrayBuffer
    // leído desde el archivo (base64 -> ArrayBuffer).
    const base64 = await new File(file.uri).base64();
    const arrayBuffer = decode(base64);

    const path = `${userId}/${roomId}/${Date.now()}-${uuidv4()}.jpg`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    return path;
  }

  async getSignedUrl(path: string): Promise<string> {
    const cached = this.signedUrlCache.get(path);
    if (cached && cached.expiresAt - Date.now() > CACHE_SAFETY_MARGIN_MS) {
      return cached.url;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      throw error ?? new Error(`No se pudo firmar la URL de ${path}`);
    }

    this.signedUrlCache.set(path, {
      url: data.signedUrl,
      expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    });
    return data.signedUrl;
  }

  async deleteImage(path: string): Promise<void> {
    this.signedUrlCache.delete(path);
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  }

  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // El payload no incluye el username -> query extra.
          const row = payload.new as unknown as MessageRow;

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", row.user_id)
            .single();

          const message = this.mapMessage({ ...row, profiles: profile });
          if (message.imagePath) {
            // El INSERT de Realtime trae image_path; hay que resolver su URL firmada.
            try {
              message.imageUrl = await this.getSignedUrl(message.imagePath);
            } catch (signError) {
              console.warn("[SupabaseChatRepository] No se pudo firmar la URL:", signError);
            }
          }

          onMessage(message);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /** Resuelve imageUrl (firmada, cacheada) para todos los mensajes que tengan image_path. */
  private async withSignedUrls(messages: Message[]): Promise<Message[]> {
    await Promise.all(
      messages.map(async (message) => {
        if (!message.imagePath) return;
        try {
          message.imageUrl = await this.getSignedUrl(message.imagePath);
        } catch (signError) {
          console.warn("[SupabaseChatRepository] No se pudo firmar la URL:", signError);
        }
      }),
    );
    return messages;
  }

  private mapRoom = (raw: RoomRow): Room => ({
    id: raw.id,
    name: raw.name,
    createdBy: raw.created_by,
    createdAt: new Date(raw.created_at),
  });

  private mapMessage = (raw: MessageRow): Message => ({
    id: raw.id,
    roomId: raw.room_id,
    userId: raw.user_id,
    content: raw.content ?? null,
    imagePath: raw.image_path ?? undefined,
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });
}
