import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <div className="justify-center flex mb-4">
                <Logo/>
            </div>
          <h1 className="font-headline text-2xl font-semibold tracking-tight">
            Login to Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your dashboard.
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Welcome back to FlexFit.
        </p>
      </div>
    </div>
  );
}
