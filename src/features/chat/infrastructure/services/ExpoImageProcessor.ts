import { File } from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { ChatImage } from "@features/chat/domain/entities/ChatImage";
import {
  IImageProcessor,
  ProcessedImage,
} from "@features/chat/domain/services/IImageProcessor";

/**
 * Implementa el procesamiento de imágenes con el nuevo API contextual de
 * expo-image-manipulator (SDK 58): manipulate -> resize (opcional) ->
 * renderAsync -> saveAsync(JPEG, compress 0.7).
 *
 * - Redimensiona solo si algún lado supera maxSide (nunca agranda).
 * - El lado mayor queda en <= maxSide; el otro se calcula preservando la relación de aspecto.
 * - El resultado siempre es JPEG; fileSize se lee del archivo real generado.
 */
export class ExpoImageProcessor implements IImageProcessor {
  async process(
    image: ChatImage,
    maxSide: number,
    quality: number,
  ): Promise<ProcessedImage> {
    // maxWidth/maxHeight: decodificar ya reducido (memoria), sin agrandar imágenes pequeñas.
    const context = ImageManipulator.ImageManipulator.manipulate(image.uri, {
      maxWidth: maxSide,
      maxHeight: maxSide,
    });

    const longestSide = Math.max(image.width, image.height);
    if (longestSide > maxSide) {
      context.resize(
        image.width >= image.height
          ? { width: maxSide, height: null }
          : { width: null, height: maxSide },
      );
    }

    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      format: ImageManipulator.SaveFormat.JPEG,
      compress: quality,
    });

    const fileSize = new File(saved.uri).size;

    return {
      uri: saved.uri,
      width: saved.width,
      height: saved.height,
      mimeType: "image/jpeg",
      fileSize,
    };
  }
}
