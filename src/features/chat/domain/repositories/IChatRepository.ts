import { Message, Room } from "../entities/Message";
import { ProcessedImage } from "../services/IImageProcessor";

export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  /**
   * Envía un mensaje con texto, imagen o ambos.
   * @param content Texto ya trimmeado, o null si el mensaje es solo imagen.
   * @param imagePath Ruta devuelta por uploadImage, o undefined si no hay imagen.
   */
  sendMessage(
    roomId: string,
    userId: string,
    content: string | null,
    imagePath?: string,
  ): Promise<Message>;
  /**
   * Sube la imagen procesada a chat-images/{userId}/{roomId}/{timestamp}-{uuid}.jpg
   * y devuelve la RUTA del objeto (image_path), nunca una URL.
   */
  uploadImage(
    roomId: string,
    userId: string,
    file: ProcessedImage,
  ): Promise<string>;
  /** URL firmada (1h) del objeto en el bucket privado. Cacheada internamente. */
  getSignedUrl(path: string): Promise<string>;
  /** Borra un objeto por ruta. Uso: rollback cuando el mensaje no pudo insertarse tras subir la imagen. */
  deleteImage(path: string): Promise<void>;
  // Devuelve la funcion unsubscribe, compatible con el return de useEffect
  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void;
}
