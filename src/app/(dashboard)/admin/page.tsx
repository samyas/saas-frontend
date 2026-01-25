'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import {
  Organization,
  Subscription,
  PagedResponse,
  SubscriptionStatus,
} from '@/lib/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Shield, Building2, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

type Tab = 'organizations' | 'subscriptions';

export default function AdminPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('organizations');
  const [loading, setLoading] = useState(false);
  
  // Organizations state
  const [organizations, setOrganizations] = useState<PagedResponse<Organization> | null>(null);
  const [orgsPage, setOrgsPage] = useState(0);
  const [orgsPageSize] = useState(20);
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<PagedResponse<Subscription> | null>(null);
  const [subsPage, setSubsPage] = useState(0);
  const [subsPageSize] = useState(20);
  
  // Disable subscription dialog state
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const [disabling, setDisabling] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [user, router, toast]);

  // Load organizations
  useEffect(() => {
    if (activeTab === 'organizations' && user?.role === 'SUPER_ADMIN') {
      loadOrganizations();
    }
  }, [activeTab, orgsPage, user]);

  // Load subscriptions
  useEffect(() => {
    if (activeTab === 'subscriptions' && user?.role === 'SUPER_ADMIN') {
      loadSubscriptions();
    }
  }, [activeTab, subsPage, user]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listAllOrganizations(orgsPage, orgsPageSize);
      setOrganizations(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listAllSubscriptions(subsPage, subsPageSize);
      setSubscriptions(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSubscription = async () => {
    if (!selectedSubscription) return;

    setDisabling(true);
    try {
      await adminApi.disableSubscription(selectedSubscription.organizationId, {
        reason: disableReason || 'Disabled by super admin',
      });
      
      toast({
        title: 'Success',
        description: 'Subscription has been disabled successfully',
      });
      
      setDisableDialogOpen(false);
      setSelectedSubscription(null);
      setDisableReason('');
      
      // Reload subscriptions
      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to disable subscription',
        variant: 'destructive',
      });
    } finally {
      setDisabling(false);
    }
  };

  const openDisableDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDisableDialogOpen(true);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const variants: Record<SubscriptionStatus, { color: string; label: string }> = {
      ACTIVE: { color: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400', label: 'Active' },
      CANCELED: { color: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400', label: 'Canceled' },
      PAST_DUE: { color: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', label: 'Past Due' },
      TRIALING: { color: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', label: 'Trialing' },
      INCOMPLETE: { color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Incomplete' },
      INCOMPLETE_EXPIRED: { color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', label: 'Expired' },
    };

    const variant = variants[status] || variants.INCOMPLETE;
    return (
      <Badge className={`${variant.color} border-0`}>
        {variant.label}
      </Badge>
    );
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-10 w-10" />
          <h1 className="text-4xl font-bold">Super Admin Panel</h1>
        </div>
        <p className="text-primary-foreground/80 text-lg">
          Manage all organizations and subscriptions across the platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'organizations' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('organizations')}
          className="rounded-b-none"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Organizations
        </Button>
        <Button
          variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('subscriptions')}
          className="rounded-b-none"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Subscriptions
        </Button>
      </div>

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-muted rounded-t-2xl">
            <CardTitle className="text-2xl">All Organizations</CardTitle>
            <CardDescription>
              View and manage all organizations in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : organizations && organizations.content.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Owner ID</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.content.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.slug}</TableCell>
                          <TableCell className="font-mono text-xs">{org.ownerId.substring(0, 8)}...</TableCell>
                          <TableCell>{org.memberCount || 0}</TableCell>
                          <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {organizations.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={orgsPage + 1}
                      totalPages={organizations.totalPages}
                      onPageChange={(page) => setOrgsPage(page - 1)}
                      hasNext={orgsPage < organizations.totalPages - 1}
                      hasPrevious={orgsPage > 0}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No organizations found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-muted rounded-t-2xl">
            <CardTitle className="text-2xl">All Subscriptions</CardTitle>
            <CardDescription>
              View and manage all subscriptions in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : subscriptions && subscriptions.content.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Period</TableHead>
                        <TableHead>Cancel at Period End</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.content.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-mono text-xs">
                            {sub.organizationId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell className="text-sm">
                            {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                              <>
                                {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                              </>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {sub.cancelAtPeriodEnd ? (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-700">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {sub.status !== 'CANCELED' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDisableDialog(sub)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Disable
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {subscriptions.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={subsPage + 1}
                      totalPages={subscriptions.totalPages}
                      onPageChange={(page) => setSubsPage(page - 1)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No subscriptions found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disable Subscription Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Subscription</DialogTitle>
            <DialogDescription>
              This will immediately cancel the subscription for this organization.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Enter reason for disabling this subscription..."
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            </div>
            {selectedSubscription && (
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization ID:</span>
                  <span className="font-mono">{selectedSubscription.organizationId.substring(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(selectedSubscription.status)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisableDialogOpen(false)}
              disabled={disabling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableSubscription}
              disabled={disabling}
            >
              {disabling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
