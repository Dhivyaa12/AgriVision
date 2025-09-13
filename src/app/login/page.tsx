
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';

const texts = {
    title: "Login to AgriVision",
    description: "Enter your credentials to access your dashboard.",
    username: "Username",
    email: "Email",
    password: "Password",
    loginButton: "Login"
}

export default function LoginPage() {
    const router = useRouter();
    const { t } = useTranslation(texts);
    const { setUser } = useUser();
    const [username, setUsername] = useState('farmer');
    const [email, setEmail] = useState('farmer@example.com');


    const handleLogin = () => {
        setUser({ name: username, email: email, state: 'Maharashtra' });
        router.push('/dashboard');
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
             <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </div>
            <Card className="w-full max-w-sm z-10 animate-fade-in-up">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">{t('username')}</Label>
                        <Input 
                            id="username" 
                            type="text" 
                            placeholder="farmer" 
                            required 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="farmer@example.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('password')}</Label>
                        <Input id="password" type="password" placeholder="••••••••" required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleLogin}>
                        {t('loginButton')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
