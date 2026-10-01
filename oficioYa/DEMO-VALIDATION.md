# Demo: solicitudes y agenda

## Alcance
Las solicitudes y la agenda se conservan en el navegador. La cuenta
pro@demo.com representa a Carlos Méndez, perfil público 1.
La persistencia local no sincroniza dispositivos diferentes.

## Verificación
- Ejecutar: node --test tests/demo-requests.test.mjs
- Ejecutar: npm run build
- Ejecutar: npm run lint
- Cliente demo: solicitar un servicio a Carlos, recargar y comprobar la solicitud.
- Cerrar sesión, entrar como profesional y aceptar la misma solicitud.
- Volver como cliente y comprobar el estado.
- Cancelar/rechazar y comprobar que el horario se libera tras recargar.
- Modificar agenda como profesional y comprobarla en el perfil público.
- Solicitar a un profesional sin agenda desde el flujo de ticket.
- Simular un fallo al guardar y comprobar que permanece el formulario.
- Confirmar que la descripción original se conserva en la simulación de IA.

## Validación del 29 de septiembre de 2026

Rama: `codex/demo-solicitudes-persistentes`, sobre el commit `26603fa`.

- `npm test`: 8 pruebas aprobadas. Cubren persistencia de solicitudes, aislamiento
  de cuentas al listar, rechazo de reservas duplicadas, liberación al cancelar,
  espera del guardado al finalizar y propagación de errores de ganancias.
- `npm run build`: aprobado, incluida la generación del service worker.
- `npm run lint`: aprobado.
- Navegador local: cliente demo crea una solicitud a Carlos para el 30/09 a las
  10:00; la solicitud permanece tras recargar. Al cambiar a profesional aparece
  la misma solicitud. Aceptar, pasar a en camino y finalizar por $1.500 funciona.
  El cobro aparece en Ganancias y permanece tras recargar.

## Correcciones de esta revisión

- Finalizar espera el guardado del estado antes de registrar ganancias o anunciar éxito.
- El modal bloquea envíos repetidos mientras guarda; conserva el monto y muestra
  el error para reintentar si falla.
- Ganancias comunica errores de almacenamiento y del backend, en lugar de ignorarlos.
- La pantalla de ganancias muestra un error con opción de reintentar si falla la carga.
- La suite completa se puede ejecutar con `npm test`.

## Pendientes y límites

- Las pruebas automatizadas usan dependencias controladas; no verifican un Supabase real.
- Estado de solicitud y ganancias todavía se guardan por separado. Si el segundo
  guardado falla, hay que reintentar desde el modal abierto. Falta hacer recuperable
  ese caso si se cierra la página entre ambas escrituras.
- Revisar chat, reseñas, notificaciones, registro profesional y tamaños móviles.
- Completar en navegador los casos de agenda editada, cancelación, profesional
  sin agenda y recuperación ante almacenamiento lleno.
- En Ganancias, revisar que el total y la lista acompañen a la semana seleccionada.

## Flujo de visita — 30/09/2026

- Primera entrega: resultado de visita (resuelto, presupuesto o evaluación),
  desglose, borradores por cuenta/solicitud, versiones y respuesta del cliente.
- npm test: 16/16; npm run lint y npm run build: aprobados.
- Navegador: profesional recupera borrador tras recargar, envía resumen de
  $1.500 de mano de obra + $300 de materiales; cliente confirma y la confirmación
  permanece al recargar. Se muestra que la confirmación no acredita un pago.
- La confirmación del nuevo flujo guarda estado, respuesta e importe juntos.
  Ganancias recupera ese importe desde la solicitud, sin necesitar otra escritura.
  Esto resuelve el límite de doble escritura indicado arriba para este nuevo flujo.
- Presupuestos: aceptación, rechazo, revisiones y vencimiento verificados por
  pruebas automatizadas; falta revisión completa de esos recorridos en navegador.
- Pendiente siguiente entrega: ejecución y cierre de presupuesto aceptado,
  política/costo de visita por profesional y coordinación de fecha.
- Los clics de la herramienta del navegador apuntaron a controles desplazados;
  la verificación se completó mediante teclado. No se modificó código por ese síntoma.
- Cambios locales; sin publicación ni migración a Supabase.

## Cierre de presupuesto aceptado — 01/10/2026

- El profesional puede registrar el trabajo terminado después de que el cliente
  acepta un presupuesto, sin tener que hacerlo durante la visita.
- El cierre recupera los importes presupuestados como referencia y permite
  registrar el costo real de mano de obra, materiales y otros conceptos.
- El cliente confirma el resumen final antes de completar la solicitud y generar
  el ingreso. El presupuesto aceptado permanece en el historial.
- Navegador: presupuesto por $2.800, aceptación, cierre actualizado a $3.000,
  confirmación final, recarga y registro de $3.000 en Ganancias.
- La suite completa, lint y build aprobaron. El texto de confirmación del cierre
  quedó cubierto por una prueba para evitar confundirlo con la respuesta del cliente.
