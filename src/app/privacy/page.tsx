
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-4">
          <Shield className="h-10 w-10 text-primary" />
          Privacy Policy
        </h1>
        <p className="lead mt-6">
          Your privacy is important to us. It is FlexFit's policy to respect your privacy regarding any information we may collect from you across our website.
        </p>
        
        <h2 className="mt-12 font-headline text-2xl font-bold">1. Information we collect</h2>
        <p>
          We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
        </p>
        <p>
          The types of personal information we may collect include your name, email address, and payment information when you book a class or purchase a membership.
        </p>

        <h2 className="mt-8 font-headline text-2xl font-bold">2. How we use your information</h2>
        <p>
          We use the information we collect to operate our business, including:
        </p>
        <ul>
          <li>To process your bookings and payments.</li>
          <li>To communicate with you about your account, our services, and policy changes.</li>
          <li>To provide you with customer support.</li>
          <li>To improve our website and services.</li>
        </ul>

        <h2 className="mt-8 font-headline text-2xl font-bold">3. Security</h2>
        <p>
          We take the security of your data seriously. We have implemented appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure.
        </p>
        
        <h2 className="mt-8 font-headline text-2xl font-bold">4. Your rights</h2>
        <p>
          You have the right to access, update, or delete your personal information at any time. If you have any questions about this privacy policy, please contact us.
        </p>
        
        <p className="mt-8 text-sm text-muted-foreground">
          This policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
      </div>
    </div>
  );
}
