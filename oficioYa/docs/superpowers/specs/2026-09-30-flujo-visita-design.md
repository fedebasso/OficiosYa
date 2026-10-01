# Flujo flexible de visita — diseño aprobado

El usuario aprobó registrar el resultado después de la visita, con tres salidas:
resuelto, presupuesto para trabajo posterior y solo evaluación. La interfaz usa
DM Sans, crema #F5F0E8, naranja #E8683A y tarjetas blancas como el resto de OFIX.

## Primera entrega
- Acceso desde el trabajo activo, sin exigir marcar «En camino» primero.
- Formulario con descripción, mano de obra, materiales, otros costos y total calculado.
- Presupuesto con duración y validez. Cada envío crea una versión inmutable.
- Cliente: confirmar resumen o aceptar presupuesto, pedir cambios con motivo,
  rechazar presupuesto. Solo los participantes pueden actuar.
- Borrador explícitamente guardable y recuperable tras recargar.
- Confirmar un resumen de trabajo resuelto/evaluación guarda estado, importe y fecha
  juntos en la solicitud. Ganancias deriva estos datos; no depende de una segunda escritura.
- Confirmar no significa pagar. No hay transacciones de dinero en esta demo.
- Presupuesto aceptado queda pendiente de realización; no genera ingresos todavía.

## Entregas siguientes
Política de visita configurable y aceptada al solicitar; agenda y reprogramación
con confirmación; ejecución de presupuesto aceptado; mensajes de hitos en chat;
revisión de reseñas y pagos informados. IA y backend quedan fuera de esta fase.

## Compatibilidad
Solicitudes anteriores conservan sus estados. Se agrega un historial opcional de
resultados. No se inventa un costo de visita para solicitudes que no lo registraron.
El primer formulario informa que deben incluirse solo importes acordados.

## Verificación
Pruebas de permisos, importes, versiones y confirmación idempotente. Pruebas de
guardado fallido. Build y lint completos. Recorrido profesional y cliente en navegador.
