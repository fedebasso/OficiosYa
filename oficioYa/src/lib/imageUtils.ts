// Utilidades de imagen para el chat (modo demo).
// Las fotos se comprimen a dataURL ANTES de enviarse: así sobreviven al refresh
// (los blob: de createObjectURL solo viven durante la sesión y dejan la imagen rota).
// Con Supabase Storage este paso pasa a subir el File y guardar la URL pública;
// la firma de onSendImage(url) ya es compatible.

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Convierte un File de imagen a una dataURL JPEG comprimida y redimensionada.
 * @param maxDim  lado mayor máximo en px (por defecto 900)
 * @param quality calidad JPEG 0..1 (por defecto 0.72)
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 900,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('No se pudo procesar la imagen')
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}
