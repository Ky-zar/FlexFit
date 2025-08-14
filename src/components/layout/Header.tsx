
'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/membership', label: 'Membership' },
  { href: '/announcements', label: 'Announcements' },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState(false);
  const isAdminPage = pathname.startsWith('/admin') || pathname === '/login';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(!!currentUser);
    });
    return () => unsubscribe();
  }, []);


  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo />
            </Link>
        </div>
        
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <Link href="/" className="mb-8 block" onClick={handleLinkClick}>
                  <Logo />
                </Link>
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'text-lg',
                        pathname === link.href ? 'text-primary font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                 {!isAdminPage && (
                    <Button asChild className="w-full mt-8">
                        <Link href={ user ? "/account/dashboard" : "/login" } onClick={handleLinkClick}>
                          {user ? 'My Account' : 'Login'}
                        </Link>
                    </Button>
                )}
              </SheetContent>
            </Sheet>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-between">
            <nav className="flex items-center space-x-6 text-sm font-medium">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                    'transition-colors hover:text-primary',
                    pathname === link.href ? 'text-primary' : 'text-foreground/60'
                    )}
                >
                    {link.label}
                </Link>
                ))}
            </nav>

            <nav className="flex items-center">
                {!isAdminPage && (
                    <Button asChild variant={user ? "outline" : "default"}>
                        <Link href={ user ? "/account/dashboard" : "/login" }>
                          {user && <User className="mr-2 h-4 w-4" />}
                          {user ? 'My Account' : 'Login'}
                        </Link>
                    </Button>
                )}
            </nav>
        </div>
      </div>
    </header>
  );
}
