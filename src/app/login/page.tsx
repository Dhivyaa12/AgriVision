
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { loginUser, signupUser } from '@/ai/flows/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useUser();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupState, setSignupState] = useState('');
    
    const defaultTab = searchParams.get('tab') || 'signin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await loginUser({ email: loginEmail, password: loginPassword });
            if (result.success && result.user) {
                setUser(result.user);
                toast({ title: "Login Successful", description: "Welcome back!" });
                router.push('/dashboard');
            } else {
                toast({ variant: 'destructive', title: "Login Failed", description: result.message });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "An unexpected error occurred." });
        }
        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signupName || !signupEmail || !signupPassword || !signupState) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Please fill out all fields." });
            return;
        }
        setLoading(true);
        try {
            const result = await signupUser({ 
                name: signupName, 
                email: signupEmail, 
                password: signupPassword,
                state: signupState 
            });

            if (result.success && result.user) {
                setUser(result.user);
                toast({ title: "Sign Up Successful", description: "Welcome to AgriVision!" });
                router.push('/dashboard');
            } else {
                toast({ variant: 'destructive', title: "Sign Up Failed", description: result.message });
            }
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message || "An unexpected error occurred." });
        }
        setLoading(false);
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </div>
            <Tabs defaultValue={defaultTab} className="w-full max-w-sm z-10 animate-fade-in-up">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
                            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="farmer@example.com"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        required 
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </CardContent>
                            <CardContent>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
                            <CardDescription>Join AgriVision to get started.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSignup}>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <Input 
                                        id="signup-name" 
                                        type="text" 
                                        placeholder="John Doe" 
                                        required 
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input 
                                        id="signup-email" 
                                        type="email" 
                                        placeholder="farmer@example.com" 
                                        required 
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="signup-state">State</Label>
                                     <Select onValueChange={setSignupState} value={signupState} disabled={loading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input 
                                        id="signup-password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        required 
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </CardContent>
                            <CardContent>
                                <Button className="w-full" type="submit" disabled={loading}>
                                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign Up
                                </Button>
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
