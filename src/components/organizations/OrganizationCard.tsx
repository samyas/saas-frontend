'use client';

import Link from 'next/link';
import { Building2, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Organization } from '@/lib/types/organization';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Link href={`/organizations/${organization.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{organization.name}</CardTitle>
                <CardDescription className="text-sm">
                  @{organization.slug}
                </CardDescription>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {organization.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {organization.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{organization.memberCount} member{organization.memberCount !== 1 ? 's' : ''}</span>
            </div>
            <Badge variant="secondary">
              {organization.role}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground">
            Created {new Date(organization.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
