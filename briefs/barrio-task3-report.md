# Barrio Task 3: Persistir zone en TicketConfirm

## STATUS
✅ COMPLETED

## Cambios realizados

1. **Agregar `zone` a `LocationState`**: Se añadió el campo `zone: string` a la interfaz.
2. **Leer `zone` del state**: Se actualizo la destructuración para incluir `zone`.
3. **Pasar `location` en `addRequest`**: Se agregó `location: zone || undefined` al objeto de parámetros.

## Commit Hash
`1b68f6d`

## Línea única
feat: persistir barrio del cliente en ServiceRequest.location
