'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { subscriptionApi, SubscriptionUsage, PaymentHistoryResponse } from '@/lib/api/subscription';
import { Loader2, CreditCard, Calendar, AlertTriangle, CheckCircle, ArrowLeft, XCircle, Receipt, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/lib/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default function BillingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const organizationId = params.id as string;
  
  const [subscription, setSubscription] = useState<SubscriptionUsage | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionApi.getOrganizationSubscription(organizationId);
      setSubscription(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await subscriptionApi.getPaymentHistory(organizationId, 0, 10);
      setPayments(data);
    } catch (err: any) {
      console.error('Failed to load payments:', err);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchPayments();
  }, [organizationId]);

  const handleCancelSubscription = async (immediately: boolean) => {
    setActionLoading(true);
    
    try {
      await subscriptionApi.cancelSubscription(organizationId, immediately);
      
      toast({
        title: 'Subscription Cancelled',
        description: immediately 
          ? 'Your subscription has been cancelled immediately.'
          : 'Your subscription will be cancelled at the end of the billing period.',
      });
      
      // Refresh subscription data
      await fetchSubscription();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    
    try {
      await subscriptionApi.reactivateSubscription(organizationId);
      
      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been reactivated successfully.',
      });
      
      // Refresh subscription data
      await fetchSubscription();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reactivate subscription',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePaymentMethods = async () => {
    setActionLoading(true);
    
    try {
      const returnUrl = `${window.location.origin}/organizations/${organizationId}/billing`;
      const response = await subscriptionApi.createBillingPortalSession(organizationId, returnUrl);
      
      // Redirect to Stripe billing portal
      window.location.href = response.checkoutUrl;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to open billing portal',
        variant: 'destructive',
      });
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const blob = await subscriptionApi.downloadPaymentInvoice(organizationId, paymentId);
      
      // Generate filename with timestamp
      const filename = `invoice-${new Date().toISOString().split('T')[0]}-${paymentId.substring(0, 8)}.pdf`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Invoice Downloaded',
        description: 'Your invoice has been downloaded successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      TRIAL: { variant: 'secondary' as const, label: 'Trial', icon: Calendar },
      PAST_DUE: { variant: 'destructive' as const, label: 'Past Due', icon: AlertTriangle },
      CANCELLED: { variant: 'outline' as const, label: 'Cancelled', icon: XCircle },
      EXPIRED: { variant: 'outline' as const, label: 'Expired', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/organizations/${organizationId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Billing Information</CardTitle>
            <CardDescription>{error || 'Unknown error occurred'}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchSubscription}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isFree = subscription.plan.price === 0;
  const canUpgrade = isFree || subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED';

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/organizations/${organizationId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organization
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">{subscription.plan.name}</h3>
              <p className="text-muted-foreground">{subscription.plan.description}</p>
              <div className="text-3xl font-bold mt-4">
                {subscription.plan.price === 0 ? (
                  'Free'
                ) : (
                  <>
                    ${subscription.plan.price.toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground">
                      /{subscription.plan.interval.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {!isFree && subscription.currentPeriodEnd && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Billing Period
                </div>
                <p className="text-sm">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Subscription will be cancelled on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Usage Information */}
            {subscription.usage && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Usage</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Team Members</span>
                      <span className="font-medium">
                        {subscription.usage.currentMembers}
                        {!subscription.usage.unlimitedMembers && ` / ${subscription.usage.maxMembers}`}
                        {subscription.usage.unlimitedMembers && ' (Unlimited)'}
                      </span>
                    </div>
                    {!subscription.usage.unlimitedMembers && subscription.usage.memberUsagePercent !== null && (
                      <Progress value={subscription.usage.memberUsagePercent} className="h-2" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            {canUpgrade && (
              <Button asChild>
                <Link href={`/organizations/${organizationId}/checkout`}>
                  {isFree ? 'Upgrade Plan' : 'Choose New Plan'}
                </Link>
              </Button>
            )}

            {!isFree && subscription.status === 'ACTIVE' && (
              <Button 
                variant="outline" 
                onClick={handleManagePaymentMethods}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  'Manage Payment Methods'
                )}
              </Button>
            )}

            {!isFree && subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={actionLoading}>
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period ({subscription.currentPeriodEnd && formatDate(subscription.currentPeriodEnd)}).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleCancelSubscription(false)}>
                      Cancel at Period End
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Button 
                variant="default" 
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reactivate Subscription'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>
                  {subscription.plan.features.max_members === -1
                    ? 'Unlimited team members'
                    : `Up to ${subscription.plan.features.max_members} team members`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>
                  {subscription.plan.features.max_projects === -1
                    ? 'Unlimited projects'
                    : `Up to ${subscription.plan.features.max_projects} projects`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Email support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Regular updates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History with Invoice Download */}
        {!isFree && payments && payments.content.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <CardTitle>Payment History</CardTitle>
              </div>
              <CardDescription>View and download invoices for your payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.content.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Have questions about your subscription or billing? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                support@example.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
