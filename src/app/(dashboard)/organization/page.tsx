'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Mail, Settings, Loader2, Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { organizationApi } from '@/lib/api/organization';
import { Organization, OrganizationMember, Invitation, MemberRole, PagedResponse } from '@/lib/types/organization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MembersList } from '@/components/organizations/MembersList';
import { InvitationsList } from '@/components/organizations/InvitationsList';
import { InviteMemberDialog } from '@/components/organizations/InviteMemberDialog';
import { UpdateOrganizationDialog } from '@/components/organizations/UpdateOrganizationDialog';
import { DeleteOrganizationDialog } from '@/components/organizations/DeleteOrganizationDialog';
import { SubscriptionUsageCard } from '@/components/organizations/SubscriptionUsageCard';
import { toast } from '@/lib/hooks/use-toast';
import Link from 'next/link';

type TabType = 'overview' | 'members' | 'invitations' | 'settings';

export default function OrganizationPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [pagedMembers, setPagedMembers] = useState<PagedResponse<OrganizationMember> | null>(null);
  const [currentMembersPage, setCurrentMembersPage] = useState(0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadOrganization();
  }, []);

  useEffect(() => {
    if (organization && activeTab === 'members') {
      loadMembers(currentMembersPage);
    } else if (organization && activeTab === 'invitations') {
      loadInvitations();
    }
  }, [activeTab, currentMembersPage, organization]);

  // Redirect non-admins away from admin-only tabs
  useEffect(() => {
    if (organization) {
      const canManage = organization.role === MemberRole.OWNER || organization.role === MemberRole.ADMIN;
      if (!canManage && (activeTab === 'members' || activeTab === 'invitations' || activeTab === 'settings')) {
        setActiveTab('overview');
      }
    }
  }, [activeTab, organization]);

  const loadOrganization = async () => {
    setIsLoading(true);
    try {
      const orgs = await organizationApi.list();
      if (orgs.length === 0) {
        // No organization found, redirect to create one
        toast({
          title: 'No Organization',
          description: 'You need to create or join an organization first',
          variant: 'destructive',
        });
        router.push('/dashboard');
        return;
      }
      setOrganization(orgs[0]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load organization';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async (page: number = 0) => {
    if (!organization) return;
    
    try {
      const data = await organizationApi.listMembers(organization.id, page, 10);
      setPagedMembers(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load members';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentMembersPage(page);
  };

  const loadInvitations = async () => {
    if (!organization) return;
    
    try {
      const data = await organizationApi.listInvitations(organization.id);
      setInvitations(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load invitations';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleInviteSuccess = (invitation: Invitation) => {
    setInvitations((prev) => [...prev, invitation]);
  };

  const handleUpdateSuccess = (updatedOrg: Organization) => {
    setOrganization(updatedOrg);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Building2, adminOnly: false },
    { id: 'members' as const, label: 'Members', icon: Users, adminOnly: true },
    { id: 'invitations' as const, label: 'Invitations', icon: Mail, adminOnly: true },
    { id: 'settings' as const, label: 'Settings', icon: Settings, adminOnly: true },
  ];

  // Get current user's role in this organization
  const currentUserRole = organization.role;
  const canManage = currentUserRole === MemberRole.OWNER || currentUserRole === MemberRole.ADMIN;

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || canManage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <Badge variant="secondary">{currentUserRole}</Badge>
          </div>
          <p className="text-muted-foreground">@{organization.slug}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Information about this organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{organization.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="text-lg">@{organization.slug}</p>
              </div>
              {organization.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-lg">{organization.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-lg">{new Date(organization.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Role</p>
                <Badge variant="secondary">{currentUserRole}</Badge>
              </div>
            </CardContent>
          </Card>

          {canManage && <SubscriptionUsageCard organizationId={organization.id} />}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Members</h2>
              <p className="text-sm text-muted-foreground">
                Manage organization members and their roles
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {pagedMembers && (
            <MembersList
              organizationId={organization.id}
              pagedMembers={pagedMembers}
              currentUserRole={currentUserRole}
              onMembersChange={(page) => loadMembers(page ?? currentMembersPage)}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pending Invitations</h2>
              <p className="text-sm text-muted-foreground">
                View and manage pending invitations
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          <InvitationsList
            organizationId={organization.id}
            invitations={invitations}
            currentUserRole={currentUserRole}
            onInvitationsChange={loadInvitations}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManage && (
                <>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="font-medium">Billing & Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your subscription, view billing history, and update payment methods
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/organizations/${organization.id}/billing`}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="font-medium">Edit Organization</p>
                      <p className="text-sm text-muted-foreground">
                        Update organization name, slug, and description
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setUpdateDialogOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {currentUserRole === MemberRole.OWNER && (
                    <div className="flex items-center justify-between pb-4">
                      <div>
                        <p className="font-medium text-destructive">Delete Organization</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this organization and all its data
                        </p>
                      </div>
                      <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!canManage && (
                <p className="text-sm text-muted-foreground">
                  Only organization owners and admins can manage settings.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <InviteMemberDialog
        organizationId={organization.id}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={handleInviteSuccess}
      />

      {organization && (
        <>
          <UpdateOrganizationDialog
            organization={organization}
            open={updateDialogOpen}
            onOpenChange={setUpdateDialogOpen}
            onSuccess={handleUpdateSuccess}
          />

          <DeleteOrganizationDialog
            organization={organization}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}
