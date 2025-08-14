
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          Terms of Service
        </h1>
        <p className="lead mt-6">
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the FlexFit website (the "Service") operated by FlexFit ("us", "we", or "our").
        </p>
        
        <h2 className="mt-12 font-headline text-2xl font-bold">1. Accounts</h2>
        <p>
          When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>

        <h2 className="mt-8 font-headline text-2xl font-bold">2. Bookings and Payments</h2>
        <p>
          By booking a class or purchasing a membership, you agree to pay the fees associated with that service. All payments are non-refundable unless otherwise stated. We reserve the right to change our prices at any time.
        </p>

        <h2 className="mt-8 font-headline text-2xl font-bold">3. Cancellation Policy</h2>
        <p>
          If you need to cancel a class booking, please do so at least 24 hours in advance to avoid being charged. Memberships are subject to their own cancellation terms as outlined in your membership agreement.
        </p>

        <h2 className="mt-8 font-headline text-2xl font-bold">4. Limitation of Liability</h2>
        <p>
          In no event shall FlexFit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

         <h2 className="mt-8 font-headline text-2xl font-bold">5. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
         Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
      </div>
    </div>
  );
}
