
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const texts = {
    title: "User Profile",
    description: "View and manage your profile details.",
    username: "Username",
    email: "Email",
    state: "State",
    editProfile: "Edit Profile",
    noUser: "No user is logged in. Redirecting...",
};


export default function ProfilePage() {
    const { t } = useTranslation(texts);
    const { user, defaultUser } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Give a moment for the user state to be loaded from sessionStorage
        const timer = setTimeout(() => {
            if (user === null) {
                router.push('/login');
            } else {
                setIsLoading(false);
            }
        }, 500); // Adjust delay if needed

        return () => clearTimeout(timer);
    }, [user, router]);

    const displayUser = user || defaultUser;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        )
    }
    
    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{t('noUser')}</p>
            </div>
        )
    }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="user avatar" />
                        <AvatarFallback>{displayUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{displayUser.name}</CardTitle>
                        <CardDescription>{displayUser.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input id="username" value={displayUser.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" value={displayUser.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{t('state')}</Label>
              <Input id="state" value={displayUser.state} readOnly />
            </div>
            <Button>{t('editProfile')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
