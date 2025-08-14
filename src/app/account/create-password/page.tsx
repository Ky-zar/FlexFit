import SetPasswordForm from '@/components/auth/SetPasswordForm';
import Logo from '@/components/Logo';
import { Suspense } from 'react';

function CreatePasswordContent({ email }: { email: string }) {
  if (!email) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-destructive">Error: Email parameter is missing.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="justify-center flex mb-4">
            <Logo />
          </div>
          <h1 className="font-headline text-2xl font-semibold tracking-tight">
            Set Your Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome! Create a password to secure your new account.
          </p>
        </div>
        <SetPasswordForm email={email} />
      </div>
    </div>
  );
}


export default function CreatePasswordPage({ searchParams }: { searchParams: { email: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePasswordContent email={searchParams.email} />
    </Suspense>
  )
}