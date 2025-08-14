import { Megaphone, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Announcement } from '@/lib/types';
import { PLACEHOLDER_ANNOUNCEMENTS } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getAnnouncements(): Promise<Announcement[]> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(PLACEHOLDER_ANNOUNCEMENTS);
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Latest Announcements
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Stay up-to-date with the latest news and updates from FlexFit.
        </p>
      </div>

      <div className="mt-12 max-w-2xl mx-auto space-y-8">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <Megaphone className="h-6 w-6 text-primary" />
                  {announcement.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(parseISO(announcement.date + 'T00:00:00'), 'MMMM d, yyyy')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No announcements at this time.</p>
        )}
      </div>
    </div>
  );
}
