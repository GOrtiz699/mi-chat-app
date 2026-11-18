import { ChatImage } from "../entities/ChatImage";

/**
 * Imagen ya comprimida/redimensionada y lista para subir.
 * La produce la implementación de IImageProcessor (infraestructura).
 */
export interface ProcessedImage {
  /** URI local del JPEG resultante */
  uri: string;
  width: number;
  height: number;
  mimeType: "image/jpeg";
  /** Tamaño real en bytes del archivo resultante (verificado contra 5 MB) */
  fileSize: number;
}

/**
 * Puerto de dominio para procesar imágenes (comprimir/redimensionar).
 * Application orquesta; Infrastructure implementa (expo-image-manipulator).
 */
export interface IImageProcessor {
  /**
   * Redimensiona para que el lado mayor sea <= maxSide px (sin agrandar)
   * y recomprime a JPEG con la calidad indicada.
   */
  process(image: ChatImage, maxSide: number, quality: number): Promise<ProcessedImage>;
}
