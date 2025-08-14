import type { GymClass, Booking, Announcement } from './types';
import { format } from 'date-fns';

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date();
dayAfter.setDate(today.getDate() + 2);

export const PLACEHOLDER_CLASSES: GymClass[] = [
  {
    id: 'class1',
    title: 'Sunrise Yoga Flow',
    date: format(today, 'yyyy-MM-dd'),
    time: '07:00 AM',
    trainer: 'Adriana Lima',
    maxSpots: 15,
    bookedSpots: 10,
    description: 'Start your day with an energizing yoga session that connects breath with movement. Suitable for all levels.'
  },
  {
    id: 'class2',
    title: 'HIIT & Core',
    date: format(today, 'yyyy-MM-dd'),
    time: '12:00 PM',
    trainer: 'Chris Hemsworth',
    maxSpots: 20,
    bookedSpots: 20,
    description: 'A high-intensity interval training class focused on burning fat and strengthening your core. Prepare to sweat!'
  },
  {
    id: 'class3',
    title: 'Powerlifting Basics',
    date: format(today, 'yyyy-MM-dd'),
    time: '06:00 PM',
    trainer: 'Dwayne Johnson',
    maxSpots: 12,
    bookedSpots: 5,
    description: 'Learn the fundamentals of the three main lifts: squat, bench press, and deadlift. Perfect for beginners.'
  },
  {
    id: 'class4',
    title: 'Zumba Dance Party',
    date: format(tomorrow, 'yyyy-MM-dd'),
    time: '05:00 PM',
    trainer: 'Shakira',
    maxSpots: 25,
    bookedSpots: 18,
    description: 'Dance your way to fitness with this fun, high-energy Zumba class. No dance experience required!'
  },
  {
    id: 'class5',
    title: 'Advanced Spinning',
    date: format(tomorrow, 'yyyy-MM-dd'),
    time: '07:00 PM',
    trainer: 'Lance Armstrong',
    maxSpots: 18,
    bookedSpots: 15,
    description: 'Push your limits with this challenging spin class featuring intense climbs and sprints.'
  },
  {
    id: 'class6',
    title: 'Full Body Strength',
    date: format(dayAfter, 'yyyy-MM-dd'),
    time: '09:00 AM',
    trainer: 'Jane Fonda',
    maxSpots: 15,
    bookedSpots: 7,
    description: 'A comprehensive workout targeting all major muscle groups for a balanced and strong physique.'
  },
];

export const PLACEHOLDER_BOOKINGS: Booking[] = [
    { id: 'booking1', classId: 'class1', name: 'John Doe', email: 'john.doe@example.com', spots: 1, bookingDate: format(new Date(), 'yyyy-MM-dd') },
    { id: 'booking2', classId: 'class3', name: 'Jane Smith', email: 'jane.smith@example.com', spots: 2, bookingDate: format(new Date(), 'yyyy-MM-dd') },
];

export const PLACEHOLDER_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'announce1',
        title: 'New Year, New Schedule!',
        content: 'Happy New Year, FlexFit family! We\'ve updated our class schedule with more options to help you achieve your fitness goals. Check out the new classes available now!',
        date: format(new Date(), 'yyyy-MM-dd')
    },
    {
        id: 'announce2',
        title: 'Holiday Hours',
        content: 'Please note that the gym will have reduced hours during the upcoming holiday weekend. We will be open from 8 AM to 4 PM on Saturday and closed on Sunday. Have a great weekend!',
        date: format(new Date(today.setDate(today.getDate() - 7)), 'yyyy-MM-dd')
    },
    {
        id: 'announce3',
        title: 'Refer a Friend, Get a Discount!',
        content: 'Love working out at FlexFit? Refer a friend and you\'ll both get 20% off your next month\'s membership. See the front desk for details.',
        date: format(new Date(today.setDate(today.getDate() - 14)), 'yyyy-MM-dd')
    }
];
