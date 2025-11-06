
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import TutoLogo from './TutoLogo';

interface AuthPageProps {
  onAuthSuccess: (user: User, userType: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here to prevent deadlocks
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer async profile fetching to prevent blocking
        if (session?.user) {
          const userId = session.user.id;
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', userId)
                .maybeSingle();
              
              if (profile && session.user) {
                onAuthSuccess(session.user, profile.user_type);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              toast.error('Failed to load user profile');
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back to Tuto!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const userType = formData.get('userType') as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone,
            user_type: userType,
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Blue Gradient Background */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-dark/20 animate-shimmer" style={{ backgroundSize: '200% 200%' }} />
      
      <div className="relative w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse" />
            <TutoLogo size="lg" className="relative justify-center" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
            Welcome to Tuto
          </h1>
          <p className="text-muted-foreground">Quality education at affordable prices</p>
        </div>

        <Card className="glass border-border/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Access Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="loading-skeleton w-4 h-4 rounded-full" />
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a...</Label>
                    <Select name="userType" required>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password (min. 6 characters)</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="bg-background/50"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="loading-skeleton w-4 h-4 rounded-full" />
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to Tuto's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
