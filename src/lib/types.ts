
import { Timestamp } from 'firebase/firestore';

export interface GymClass {
  id: string;
  title: string;
  date: string; // Keep as ISO string 'YYYY-MM-DD' for simplicity
  time: string;
  trainer: string;
  maxSpots: number;
  bookedSpots: number;
  description: string;
  price?: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  classId: string;
  name: string;
  email: string;
  spots: number;
  bookingDate: string | Timestamp; // Allow string for client-side, Timestamp for server
  gymClass?: GymClass;
  status: BookingStatus;
  membershipId?: string | null;
}

export interface Announcement {
  id:string;
  title: string;
  content: string;
  date: Timestamp;
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
  joinDate: string | Timestamp; // Allow string for client-side, Timestamp for server
}

export type BookingState = {
    errors?: {
        classId?: string[];
        name?: string[];
        email?: string[];
        spots?: string[];
        membershipId?: string[];
    };
    message?: string | null;
    redirectUrl?: string | null;
    success?: boolean;
}
