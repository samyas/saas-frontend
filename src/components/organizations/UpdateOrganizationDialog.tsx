'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { updateOrganizationSchema, type UpdateOrganizationFormData } from '@/lib/schemas/organization';
import { organizationApi } from '@/lib/api/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/hooks/use-toast';
import { Organization } from '@/lib/types/organization';

interface UpdateOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (organization: Organization) => void;
}

export function UpdateOrganizationDialog({
  organization,
  open,
  onOpenChange,
  onSuccess,
}: UpdateOrganizationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateOrganizationFormData>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      description: organization.description || '',
    },
  });

  // Update form when organization changes
  useEffect(() => {
    if (open) {
      reset({
        name: organization.name,
        slug: organization.slug,
        description: organization.description || '',
      });
    }
  }, [organization, open, reset]);

  const onSubmit = async (data: UpdateOrganizationFormData) => {
    setIsLoading(true);

    try {
      const updatedOrg = await organizationApi.update(organization.id, data);
      
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });

      onSuccess(updatedOrg);
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update organization. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update your organization details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Acme Inc"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              type="text"
              placeholder="acme-inc"
              {...register('slug')}
              disabled={isLoading}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used in URLs. Must contain only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="A brief description of your organization"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
