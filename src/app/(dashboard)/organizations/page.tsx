'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { organizationApi } from '@/lib/api/organization';
import { Organization, MemberRole } from '@/lib/types/organization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { toast } from '@/lib/hooks/use-toast';
import Link from 'next/link';

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const data = await organizationApi.list();
      setOrganizations(data);
      
      // Auto-redirect owners to their organization (since they can only have one)
      if (data.length > 0 && data[0].role === MemberRole.OWNER) {
        router.push(`/organizations/${data[0].id}`);
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load organizations';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if current user has any organizations and what their role is
  const isOwner = organizations.length > 0 && organizations.some(org => org.role === MemberRole.OWNER);
  const canCreateOrganization = !isOwner; // Only non-owners can create organizations

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            {isOwner ? 'Your organizations' : 'Organizations you are a member of'}
          </p>
        </div>
        {canCreateOrganization && (
          <Link href="/organizations/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </Link>
        )}
      </div>

      {organizations.length === 0 ? (
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No Organizations Yet</CardTitle>
            <CardDescription>
              Get started by creating your first organization
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Organizations allow you to collaborate with team members, manage projects, and control access.
            </p>
            {canCreateOrganization && (
              <Link href="/organizations/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Organization
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
