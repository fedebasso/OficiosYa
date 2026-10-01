# Registro y respuesta de visita

**Objetivo:** entregar la primera parte del flujo aprobado dentro de la demo existente.
**Arquitectura:** historial dentro de ServiceRequest; transiciones puras validadas;
una única escritura local por envío/respuesta. Página compartida con acciones por rol.

- [x] Definir VisitReport y comandos submit/respond; probar participantes,
  importes no negativos, total calculado, versión vigente y finalización única.
- [x] Agregar requestService.updateVisit usando sesión real de la demo y guardado
  de la solicitud completa. Mantener respuesta anterior en el historial.
- [x] Crear página TrabajoVisita con borrador por cuenta/solicitud, formulario,
  resumen, respuesta e historial. Integrar accesos en ambos roles.
- [x] Leer importes confirmados desde solicitudes para recuperar Ganancias tras recargar.
- [x] Ejecutar npm test, npm run lint, npm run build y probar el flujo en navegador.

Se preservan las modificaciones locales previas. No publicar ni migrar Supabase.
