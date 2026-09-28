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

## Estado de validación de esta entrega
Se ejecutaron comprobaciones aisladas del servicio en un entorno JavaScript
con dependencias simuladas. No se ejecutaron build, lint, la suite Node ni
el navegador: la terminal del entorno no pudo iniciar procesos.
Pendientes para la siguiente revisión: chat, reseñas, notificaciones,
registro profesional y recorrido visual completo.
