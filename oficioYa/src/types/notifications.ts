export type NotifEventId = 'nueva_solicitud' | 'solicitud_aceptada' | 'pro_en_camino'

export interface NotifPayload {
  eventId: NotifEventId
  title: string
  body: string
  url: string
}

export type NotifPermission = 'default' | 'granted' | 'denied'
