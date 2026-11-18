export interface Message {
    id: string;
    roomId: string;
    userId:string;
    /** Texto del mensaje. NULL cuando el mensaje es solo imagen (la BD también lo permite). */
    content: string | null;
    /** Ruta del objeto en el bucket privado chat-images. No es una URL. */
    imagePath?: string;
    /** URL firmada temporal (1h) para renderizar; opcional en mensajes que aún no la resuelven. */
    imageUrl?: string;
    /**
     * Estado transitorio SOLO para el optimistic update en UI:
     * presente en el mensaje temporal mientras se comprime/sube la imagen.
     * La data real que viene del servidor nunca lo trae.
     */
    uploadStatus?: 'uploading' | 'error';
    createdAt: Date;
    authorUsername?: string; //Desnomalización controlada para la UI
}

export interface Room {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
}
