/**
 * Imagen candidata a enviarse en el chat.
 * Tipo de dominio puro: presentation lo construye a partir del asset de
 * expo-image-picker (mapeo 1:1, sin tipos de Expo/React aquí).
 */
export interface ChatImage {
  /** URI local del archivo (file://...) */
  uri: string;
  width: number;
  height: number;
  /** MIME declarado por el origen ("image/jpeg" | "image/png" | "image/webp") */
  mimeType: string;
  /** Tamaño en bytes si el origen lo informa; undefined si se desconoce */
  fileSize?: number;
}
