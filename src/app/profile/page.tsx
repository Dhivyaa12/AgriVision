
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';


const texts = {
    title: "User Profile",
    description: "View and manage your profile details.",
    username: "Username",
    email: "Email",
    state: "State",
    editProfile: "Edit Profile"
};


export default function ProfilePage() {
    const { t } = useTranslation(texts);
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
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">Farmer</CardTitle>
                        <CardDescription>farmer@example.com</CardDescription>
                    </div>
                </div>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input id="username" value="farmer" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" value="farmer@example.com" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{t('state')}</Label>
              <Input id="state" value="Maharashtra" readOnly />
            </div>
            <Button>{t('editProfile')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
