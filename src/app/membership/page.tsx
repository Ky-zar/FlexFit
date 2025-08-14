import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const membershipTiers = [
  {
    name: 'Basic',
    price: '$29',
    description: 'Perfect for getting started and accessing our core facilities.',
    features: [
      'Access to all gym equipment',
      'Locker room access',
      'Standard gym hours (6am - 10pm)',
    ],
    cta: 'Choose Basic',
  },
  {
    name: 'Premium',
    price: '$59',
    description: 'Unlock group classes and get more from your membership.',
    features: [
      'All Basic plan features',
      'Unlimited group fitness classes (Yoga, HIIT, etc.)',
      '24/7 gym access',
      '1x guest pass per month',
    ],
    cta: 'Choose Premium',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'The ultimate fitness experience with personalized training.',
    features: [
      'All Premium plan features',
      '2x personal training sessions per month',
      'Nutritional guidance session',
      'FlexFit merchandise welcome kit',
    ],
    cta: 'Choose Pro',
  },
];

export default function MembershipPage() {
  return (
    <div className="py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Membership Plans
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you and start your fitness journey today.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {membershipTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="text-4xl font-bold">
                {tier.price} <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className={`w-full ${tier.popular ? '' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`}>
                <Link href="/schedule">{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
