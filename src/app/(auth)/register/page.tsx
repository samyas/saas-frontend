import { Suspense } from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="border-2 shadow-2xl animate-scale-in">
        <CardHeader className="space-y-2 bg-muted rounded-t-xl">
          <CardTitle className="text-3xl font-bold text-primary">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <RegisterForm />
        </CardContent>
        <CardFooter className="bg-muted/50 rounded-b-xl">
          <div className="text-sm text-muted-foreground text-center w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </Suspense>
  );
}
