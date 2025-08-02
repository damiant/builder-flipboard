export type Events = Event[]

export interface Event {
  uid: string
  title: string
  description: string
  event_type: EventType
  print_description: string
  hosted_by_camp?: string
  all_day: boolean
  contact?: string
  occurrence_set: OccurrenceSet[]
  check_location?: boolean
  other_location?: string
  located_at_art?: string
}

export interface EventType {
  label: string
}

export interface OccurrenceSet {
  start_time: string
  end_time: string
}

export type Camps = Camp[]

export interface Camp {
  uid: string
  name: string
  hometown?: string
  description: string
  landmark: string
  location_string: string
  imageUrl?: string
  images?: any[]
  url?: string
  camp_type?: string
}

export type Arts = Art[]

export interface Art {
  uid: string
  name: string
  url?: string
  contact_email?: string
  hometown: string
  description?: string
  artist: string
  category?: string
  location: any
  location_string: any
  images: Image[]
}

export interface Image {
  thumbnail_url: string
}
