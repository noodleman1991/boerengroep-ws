import {
    Apple, ArrowRight, Bike, BookOpen, Calendar, Camera, Clock, Download, ExternalLink, Film, Globe, GraduationCap,
    HandHeart, Heart, Home, Info, Leaf, Mail, MapPin, Megaphone, Mic, Music, Newspaper, Phone, Podcast, Soup, Sprout,
    Tractor, Users, Wheat,
} from 'lucide-react';

/** The symbols editors can name in a block. A small set keeps pages light and consistent. */
export const BLOCK_ICONS = {
    Apple, ArrowRight, Bike, BookOpen, Calendar, Camera, Clock, Download, ExternalLink, Film, Globe, GraduationCap,
    HandHeart, Heart, Home, Info, Leaf, Mail, MapPin, Megaphone, Mic, Music, Newspaper, Phone, Podcast, Soup, Sprout,
    Tractor, Users, Wheat,
} as const;

/** The symbol with this name, or nothing when the name is unknown or empty. */
export function BlockIcon({ name, className }: { name?: string | null; className?: string }) {
    const Symbol = name ? BLOCK_ICONS[name.trim() as keyof typeof BLOCK_ICONS] : undefined;
    return Symbol ? <Symbol className={className} aria-hidden="true" /> : null;
}
