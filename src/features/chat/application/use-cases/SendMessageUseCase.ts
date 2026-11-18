import { ChatError } from "../../../../shared/domain/errors/AppError";
import { Message } from "../../domain/entities/Message";
import { ChatImage } from "../../domain/entities/ChatImage";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { IImageProcessor } from "../../domain/services/IImageProcessor";
import { UploadImageUseCase } from "./UploadImageUseCase";

export class SendMessageUseCase {
  private readonly uploadImageUseCase: UploadImageUseCase;

  constructor(
    private readonly chatRepo: IChatRepository,
    imageProcessor: IImageProcessor,
  ) {
    this.uploadImageUseCase = new UploadImageUseCase(chatRepo, imageProcessor);
  }

  /**
   * Acepta texto, imagen o ambos. Rechaza mensajes sin contenido.
   * Si el INSERT del mensaje falla después de subir la imagen, borra el
   * archivo huérfano antes de propagar el error.
   */
  async execute(
    roomId: string,
    userId: string,
    content: string,
    image?: ChatImage,
  ): Promise<Message> {
    const trimmed = content.trim();

    if (!trimmed && !image) {
      throw new ChatError("El mensaje no puede estar vacío");
    }
    if (trimmed.length > 500) {
      throw new ChatError("Máximo 500 caracteres");
    }

    let imagePath: string | undefined;

    if (image) {
      imagePath = await this.uploadImageUseCase.execute(roomId, userId, image);
    }

    try {
      return await this.chatRepo.sendMessage(
        roomId,
        userId,
        trimmed === "" ? null : trimmed,
        imagePath,
      );
    } catch (error) {
      // Rollback: eliminar el archivo huérfano si el mensaje no llegó a insertarse.
      if (imagePath) {
        try {
          await this.chatRepo.deleteImage(imagePath);
        } catch (cleanupError) {
          // El rollback no debe enmascarar el error original.
          console.warn("[SendMessageUseCase] No se pudo borrar el archivo huérfano:", cleanupError);
        }
      }
      throw error;
    }
  }
}
