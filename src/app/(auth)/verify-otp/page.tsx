'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { VerifyOtpForm } from '@/components/auth/VerifyOtpForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl');

  if (!email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
          <CardDescription>Email parameter is missing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please return to the registration page and try again.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/register" className="text-primary hover:underline underline-offset-4">
            Go to Registration
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyOtpForm email={email} returnUrl={returnUrl || undefined} />
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Wrong email?{' '}
          <Link href="/register" className="text-primary hover:underline underline-offset-4">
            Register again
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
