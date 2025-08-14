
export interface GymClass {
  id: string;
  title: string;
  date: string;
  time: string;
  trainer: string;
  maxSpots: number;
  bookedSpots: number;
  description: string;
  price?: number;
}

export interface Booking {
  id: string;
  classId: string;
  name: string;
  email: string;
  spots: number;
  bookingDate: string; // Should be ISO string
  gymClass?: GymClass;
  status: 'pending' | 'confirmed' | 'cancelled';
  membershipId?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // Should be ISO string
}

export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  membershipId: string;
  membershipTierId: string;
  membershipIsAnnual: boolean;
  joinDate: string; // ISO String
}
