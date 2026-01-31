import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="border-2 shadow-2xl animate-scale-in">
        <CardHeader className="space-y-2 bg-muted rounded-t-xl">
          <CardTitle className="text-3xl font-bold text-primary">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-muted/50 rounded-b-xl">
          <div className="text-sm text-muted-foreground text-center">
            <Link href="/forgot-password" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors">
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </Suspense>
  );
}
