
'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { MembershipTier } from '@/lib/types';
import { useEffect } from 'react';

async function getMembershipTiers(): Promise<MembershipTier[]> {
  const tiersCol = collection(db, 'membershipTiers');
  // Assuming you have an 'order' field to sort by (e.g., 1 for Basic, 2 for Premium, 3 for Pro)
  const q = query(tiersCol, orderBy('monthlyPrice'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipTier));
}

export default function MembershipPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    getMembershipTiers().then(data => {
      setTiers(data);
      setLoading(false);
    });
  }, []);

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

      <div className="flex justify-center items-center gap-4 my-10">
        <Label htmlFor="billing-cycle" className={!isAnnual ? 'text-primary' : ''}>Monthly</Label>
        <Switch id="billing-cycle" checked={isAnnual} onCheckedChange={setIsAnnual} />
        <Label htmlFor="billing-cycle" className={isAnnual ? 'text-primary' : ''}>Annual (Save 30%)</Label>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
             <Card key={i}><CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-1/3" /><div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></CardContent><CardFooter><Skeleton className="h-12 w-full" /></CardFooter></Card>
          ))
        ) : (
          tiers.map((tier) => (
            <Card key={tier.id} className={`flex flex-col ${tier.popular ? 'border-2 border-primary shadow-lg relative' : ''}`}>
              {tier.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">Most Popular</div>}
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="text-center">
                    <div className="text-4xl font-bold">
                        ${isAnnual ? (tier.annualPrice / 12).toFixed(2) : tier.monthlyPrice.toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">/ month</span>
                    </div>
                    {isAnnual && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Billed annually at ${tier.annualPrice.toFixed(2)}
                        </p>
                    )}
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className={`w-full ${tier.popular ? '' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`}>
                  <Link href={`/membership/checkout?tierId=${tier.id}&annual=${isAnnual}`}>{`Choose ${tier.name}`}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
