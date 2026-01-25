'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { verifyOtpSchema, type VerifyOtpFormData } from '@/lib/schemas/auth';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { toast } from '@/lib/hooks/use-toast';
import { getPostLoginRedirect } from '@/lib/utils/post-login-redirect';

interface VerifyOtpFormProps {
  email: string;
  returnUrl?: string;
}

export function VerifyOtpForm({ email, returnUrl }: VerifyOtpFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email },
  });

  const onSubmit = async (data: VerifyOtpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyOtp(data);
      login(response.accessToken, response.refreshToken, response.user);
      
      toast({
        title: 'Success',
        description: 'Your email has been verified successfully.',
      });

      // Redirect to returnUrl or use smart redirect logic
      if (returnUrl) {
        console.log('[VERIFY-OTP] Redirecting to returnUrl:', returnUrl);
        router.push(returnUrl);
      } else {
        try {
          const redirectUrl = await getPostLoginRedirect();
          console.log('[VERIFY-OTP] Redirecting to:', redirectUrl);
          router.push(redirectUrl);
        } catch (redirectError) {
          console.error('[VERIFY-OTP] Redirect error:', redirectError);
          router.push('/organizations');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await authApi.resendOtp({ email });
      toast({
        title: 'Success',
        description: response.message,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otpCode">Verification Code</Label>
          <Input
            id="otpCode"
            type="text"
            placeholder="123456"
            maxLength={6}
            {...register('otpCode')}
            disabled={isLoading}
            className="text-center text-2xl tracking-widest"
          />
          {errors.otpCode && (
            <p className="text-sm text-destructive">{errors.otpCode.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResendOtp}
          disabled={isResending || isLoading}
          className="text-sm"
        >
          {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
        </Button>
      </div>
    </div>
  );
}
