export interface Venue {
  id: string;
  name: string;
  address: string;
  district: string;
  instagram?: string;
  imageUrl?: string;
  hasDamsizPolicy: boolean;
  tags: string[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  imageUrl?: string;
  venue: Venue;
}

export type OfferType = 'none' | '2drink' | '3drink' | 'custom';
export type GroupStatus = 'open' | 'full' | 'closed';

export interface GroupMember {
  id: string;
  userId: string;
  role: 'creator' | 'member';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    gender: string;
    trustScore: number;
    totalMeetups: number;
  };
}

export interface Group {
  id: string;
  offerType: OfferType;
  customNote?: string;
  maxMembers: number;
  status: GroupStatus;
  creatorId: string;
  creator: { id: string; name: string; trustScore: number };
  event: Event;
  members: GroupMember[];
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: { id: string; name: string };
}

export const OFFER_LABELS: Record<OfferType, string> = {
  none: 'Teklif yok',
  '2drink': '🍺 2 Yerli içecek',
  '3drink': '🍺🍺 3 Yerli içecek',
  custom: '✍️ Özel not',
};

export const OFFER_COLORS: Record<OfferType, string> = {
  none: '#666688',
  '2drink': '#E67E22',
  '3drink': '#E74C3C',
  custom: '#8E44AD',
};
