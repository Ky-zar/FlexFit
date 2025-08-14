
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { MembershipTier } from '@/lib/types';
import MembershipClientPage from './client-page';

async function getMembershipTiers(): Promise<MembershipTier[]> {
  const tiersCol = collection(db, 'membershipTiers');
  const q = query(tiersCol, orderBy('monthlyPrice'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipTier));
}

export default async function MembershipPage() {
  const tiers = await getMembershipTiers();

  return <MembershipClientPage tiers={tiers} />;
}
