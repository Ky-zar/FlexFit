import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <div className="justify-center flex mb-4">
                <Logo/>
            </div>
          <h1 className="font-headline text-2xl font-semibold tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          This login is for authorized personnel only.
        </p>
      </div>
    </div>
  );
}
