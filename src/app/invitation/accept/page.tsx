'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { organizationApi } from '@/lib/api/organization';
import { InvitationPreview } from '@/lib/types/organization';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Mail, User, Calendar, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AcceptInvitationPage() {
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const data = await organizationApi.getInvitationPreview(token);
        setInvitation(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load invitation';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // Auto-accept invitation if user is logged in
  useEffect(() => {
    const autoAcceptInvitation = async () => {
      // Only auto-accept if:
      // 1. User is logged in
      // 2. Invitation data is loaded
      // 3. Invitation is not expired
      // 4. Not already accepting
      if (!user || !invitation || accepting || authLoading || loading) {
        return;
      }

      const isExpired = new Date(invitation.expiresAt) < new Date();
      if (isExpired) {
        return;
      }

      setAccepting(true);
      try {
        await organizationApi.acceptInvitation({ token: token! });
        
        toast({
          title: 'Welcome!',
          description: `You've joined ${invitation.organizationName}`,
        });

        // Redirect to organization page
        router.push(`/organizations/${invitation.organizationId}`);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to accept invitation';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setAccepting(false);
      }
    };

    autoAcceptInvitation();
  }, [user, invitation, accepting, authLoading, loading, token, router]);

  const handleLogin = () => {
    if (!token || !invitation) return;
    const loginUrl = `/login?email=${encodeURIComponent(invitation.email)}&returnUrl=${encodeURIComponent(`/invitation/accept?token=${token}`)}`;
    router.push(loginUrl);
  };

  const handleSignUp = () => {
    if (!token || !invitation) return;
    const signupUrl = `/register?email=${encodeURIComponent(invitation.email)}&returnUrl=${encodeURIComponent(`/invitation/accept?token=${token}`)}`;
    router.push(signupUrl);
  };

  const handleDecline = () => {
    router.push('/organizations');
  };

  if (loading || authLoading || accepting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {accepting && invitation && (
          <p className="text-sm text-muted-foreground">
            Joining {invitation.organizationName}...
          </p>
        )}
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'This invitation is no longer valid.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/organizations')} className="w-full">
              Go to Organizations
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">You've been invited!</CardTitle>
          <CardDescription>
            Review the invitation details below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Organization</p>
              <p className="text-lg font-semibold">{invitation.organizationName}</p>
              <p className="text-xs text-muted-foreground">@{invitation.organizationSlug}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Invited as</p>
                <p className="text-sm font-medium">{invitation.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium capitalize">{invitation.role.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="text-sm font-medium">{invitation.inviterName}</p>
              <p className="text-xs text-muted-foreground">{invitation.inviterEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 pb-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className={`text-sm font-medium ${isExpired ? 'text-destructive' : ''}`}>
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isExpired && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">This invitation has expired</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          {!user ? (
            // Not logged in - show login/signup buttons
            <>
              <p className="text-sm text-muted-foreground text-center w-full">
                You need to log in or create an account to accept this invitation
              </p>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className="flex-1"
                >
                  Log In to Accept
                </Button>
                <Button 
                  onClick={handleSignUp}
                  disabled={isExpired}
                  className="flex-1"
                >
                  Sign Up to Accept
                </Button>
              </div>
            </>
          ) : (
            // Logged in - show decline button (accept happens automatically)
            <div className="flex items-center justify-center gap-2 w-full">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Accepting invitation...
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
