'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { toast } from '@/lib/hooks/use-toast';
import { getPostLoginRedirect, getReturnUrl } from '@/lib/utils/post-login-redirect';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get email from URL params (used for invitation flow)
  const prefilledEmail = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: prefilledEmail ? { email: prefilledEmail } : undefined,
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('[LOGIN] Form submitted');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[LOGIN] Calling login API...');
      const response = await authApi.login(data);
      console.log('[LOGIN] Login successful, setting tokens and user');
      
      // Set tokens and user in auth context
      login(response.accessToken, response.refreshToken, response.user);
      
      // Verify tokens are set in cookies
      console.log('[LOGIN] Checking cookies...');
      console.log('[LOGIN] Cookies:', document.cookie);
      
      // Give a tiny moment for tokens to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: 'Success',
        description: 'You have been logged in successfully.',
      });

      // Smart redirect based on user's organizations and invitation status
      const returnUrl = getReturnUrl(searchParams);
      console.log('[LOGIN] Return URL from params:', returnUrl);
      
      try {
        console.log('[LOGIN] Calling getPostLoginRedirect...');
        const redirectUrl = await getPostLoginRedirect(returnUrl);
        console.log('[LOGIN] Redirecting to:', redirectUrl);
        router.push(redirectUrl);
      } catch (redirectError) {
        console.error('[LOGIN] Redirect error:', redirectError);
        // Fallback to organizations page if redirect logic fails
        console.log('[LOGIN] Fallback redirect to /organizations');
        router.push('/organizations');
      }
    } catch (err: any) {
      console.error('[LOGIN] Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to login. Please try again.';
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <ErrorMessage message={error} />}

      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          disabled={isLoading || !!prefilledEmail}
          className={`border-2 transition-all ${prefilledEmail ? 'bg-muted' : ''}`}
        />
        {errors.email && (
          <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
        )}
        {prefilledEmail && (
          <p className="text-xs text-muted-foreground">
            Email is pre-filled from your invitation and cannot be changed.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
          className="border-2 transition-all"
        />
        {errors.password && (
          <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg py-6" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}
