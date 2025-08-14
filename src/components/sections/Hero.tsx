import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-background -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Shape Your Body,
              <br />
              <span className="text-primary">Transform Your Life.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Welcome to FlexFit, where your fitness journey begins. We offer a wide range of classes, top-notch equipment, and expert trainers to help you achieve your goals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/schedule">Explore Classes</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#">Join Now</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 w-full rounded-xl shadow-2xl lg:h-auto lg:w-full lg:max-w-lg lg:justify-self-end">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Person working out in a modern gym"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
              data-ai-hint="gym workout"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
