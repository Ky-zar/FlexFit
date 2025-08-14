import { notFound, redirect } from 'next/navigation';
import { CreditCard, Lock, Check } from 'lucide-react';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { MembershipTier } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CheckoutForm from '@/components/membership/CheckoutForm';

async function getTierDetails(id: string): Promise<MembershipTier | undefined> {
  if (!id) return undefined;
  const docRef = doc(db, 'membershipTiers', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MembershipTier;
  } else {
    return undefined;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { tierId: string; annual: string };
}) {
  const { tierId, annual } = searchParams;
  const isAnnual = annual === 'true';
  const tier = await getTierDetails(tierId);

  if (!tier) {
    notFound();
  }

  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const billingCycle = isAnnual ? 'Annually' : 'Monthly';
  const today = new Date();
  const nextBillingDate = new Date(today);
  if (isAnnual) {
    nextBillingDate.setFullYear(today.getFullYear() + 1);
  } else {
    nextBillingDate.setMonth(today.getMonth() + 1);
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-center mb-12">
          Complete Your Purchase
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <CheckoutForm tier={tier} isAnnual={isAnnual} />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tier.name} Membership ({billingCycle})</span>
                  <span className="font-semibold">${price.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                 <div className="text-sm text-muted-foreground pt-4">
                    Your next billing date will be on {nextBillingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
                 </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
