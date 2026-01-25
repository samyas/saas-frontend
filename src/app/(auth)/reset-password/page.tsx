'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
          <CardDescription>Invalid or missing reset token</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/forgot-password" className="text-primary hover:underline underline-offset-4">
            Request new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline underline-offset-4">
            Back to login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
