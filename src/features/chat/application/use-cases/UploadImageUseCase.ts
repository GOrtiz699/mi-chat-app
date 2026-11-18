import { ChatError } from "../../../../shared/domain/errors/AppError";
import { ChatImage } from "../../domain/entities/ChatImage";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { IImageProcessor } from "../../domain/services/IImageProcessor";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_SIDE_PX = 1280;
const JPEG_QUALITY = 0.7;

export class UploadImageUseCase {
  constructor(
    private readonly chatRepo: IChatRepository,
    private readonly imageProcessor: IImageProcessor,
  ) {}

  /**
   * Valida MIME y tamaño, comprime/redimensiona (máx. 1280 px de lado, JPEG 0.7),
   * sube el resultado y devuelve la ruta (image_path) del objeto creado.
   */
  async execute(
    roomId: string,
    userId: string,
    file: ChatImage,
  ): Promise<string> {
    // 1) Tipo MIME: obligatorio y restringido a jpeg/png/webp.
    const mimeType = file.mimeType?.toLowerCase();
    if (!mimeType || !(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
      throw new ChatError(
        `Tipo de imagen no soportado (${file.mimeType ?? "desconocido"}). Solo JPEG, PNG o WebP.`,
      );
    }

    // 2) Tamaño original (si el picker lo informa). El chequeo definitivo se hace tras comprimir.
    if (file.fileSize !== undefined && file.fileSize > MAX_BYTES) {
      throw new ChatError("La imagen supera el límite de 5 MB.");
    }

    // 3) Comprimir/redimensionar antes de subir.
    const processed = await this.imageProcessor.process(file, MAX_SIDE_PX, JPEG_QUALITY);

    // 4) Tamaño real del archivo resultante.
    if (processed.fileSize > MAX_BYTES) {
      throw new ChatError(
        "La imagen supera el límite de 5 MB incluso tras comprimirla. Prueba con una más pequeña.",
      );
    }

    // 5) Subir y devolver la ruta.
    return this.chatRepo.uploadImage(roomId, userId, processed);
  }
}
