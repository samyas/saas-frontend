'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown, Loader2, TrendingUp } from 'lucide-react';
import { subscriptionApi, SubscriptionUsage } from '@/lib/api/subscription';
import { toast } from '@/lib/hooks/use-toast';
import Link from 'next/link';

interface SubscriptionUsageCardProps {
  organizationId: string;
}

export function SubscriptionUsageCard({ organizationId }: SubscriptionUsageCardProps) {
  const [subscription, setSubscription] = useState<SubscriptionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, [organizationId]);

  const loadSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await subscriptionApi.getOrganizationSubscription(organizationId);
      setSubscription(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load subscription';
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>{error || 'Unable to load subscription'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { plan, usage } = subscription;
  const isFreePlan = plan.slug === 'free';
  const isNearingLimit = usage.memberUsagePercent !== null && usage.memberUsagePercent >= 80;
  const isAtLimit = usage.memberUsagePercent === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription & Usage</CardTitle>
            <CardDescription>
              Current plan and resource usage
            </CardDescription>
          </div>
          {!isFreePlan && <Crown className="h-5 w-5 text-amber-500" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{plan.name}</p>
              <Badge variant={isFreePlan ? 'secondary' : 'default'}>
                ${plan.price.toFixed(2)}/{plan.interval.toLowerCase()}
              </Badge>
            </div>
          </div>
          {isFreePlan && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organizations/${organizationId}/checkout`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>

        {/* Member Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Members</p>
            <p className="text-sm text-muted-foreground">
              {usage.currentMembers}
              {!usage.unlimitedMembers && ` / ${usage.maxMembers}`}
              {usage.unlimitedMembers && ' (Unlimited)'}
            </p>
          </div>
          
          {!usage.unlimitedMembers && usage.memberUsagePercent !== null && (
            <>
              <Progress 
                value={usage.memberUsagePercent} 
                className={
                  isAtLimit 
                    ? 'bg-destructive/20 [&>div]:bg-destructive' 
                    : isNearingLimit 
                    ? 'bg-amber-500/20 [&>div]:bg-amber-500' 
                    : ''
                }
              />
              
              {isAtLimit && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Member limit reached</p>
                    <p className="text-sm text-destructive/80 mb-2">
                      You've reached the maximum number of members for the {plan.name} plan.
                    </p>
                    <Button size="sm" variant="destructive" asChild>
                      <Link href={`/organizations/${organizationId}/checkout`}>
                        Upgrade Plan
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
              
              {isNearingLimit && !isAtLimit && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Approaching member limit</p>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      You're using {usage.memberUsagePercent}% of your member capacity. 
                      Consider upgrading soon.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Plan Features */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Plan Features</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              • Members: {plan.features.max_members === -1 ? 'Unlimited' : plan.features.max_members}
            </p>
            <p>
              • Projects: {plan.features.max_projects === -1 ? 'Unlimited' : plan.features.max_projects}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
