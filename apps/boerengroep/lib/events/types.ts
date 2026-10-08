export type EventStatus = 'scheduled' | 'full' | 'cancelled' | 'postponed';

/** A picture of an event, in the cuts the site uses. */
export type EventImage = {
  /** Small, for rows in a list. */
  thumbnail?: string;
  /** 4:3, for cards. */
  card?: string;
  /** 16:9, for the large event on the home page. */
  wide?: string;
  /** For previews when the link is shared. */
  share?: string;
  /** The whole picture, uncut. Posters are shown this way on the event's own page. */
  original?: string;
  width?: number;
  height?: number;
  alt: string;
};

/** A kind of event, as an editor made it in the admin panel. */
export type EventKind = {
  id: string;
  /** In the reader's language. */
  name: string;
  /** One of the named colours an editor can choose. */
  colour: string;
};

/** An event as the site shows it. */
export type SiteEvent = {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  start: string;
  /** Only set when it lies after the start. */
  end: string | null;
  /** Missing when the editor chose none, or when the kind was removed later. */
  kind?: EventKind;
  status: EventStatus;
  statusNote?: string;
  language?: string;
  place: { address?: string; mapsLink?: string; callLink?: string };
  image?: EventImage;
  people: { name: string; role?: string; affiliation?: string; avatar?: string }[];
  /** Rich text with the sign-up link, when people have to register. */
  registration?: unknown;
  featured: boolean;
  updatedAt?: string;
};
