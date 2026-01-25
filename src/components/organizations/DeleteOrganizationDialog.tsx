'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
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

interface DeleteOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== organization.slug) {
      toast({
        title: 'Error',
        description: 'Please type the organization slug to confirm deletion',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await organizationApi.delete(organization.id);
      
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });

      router.push('/organizations');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete organization. Please try again.';
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
      setConfirmText('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the organization
            and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium mb-2">This will delete:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>The organization "{organization.name}"</li>
              <li>All member associations</li>
              <li>All pending invitations</li>
              <li>All organization data</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-bold">{organization.slug}</span> to confirm
            </Label>
            <Input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={organization.slug}
              disabled={isLoading}
            />
          </div>
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || confirmText !== organization.slug}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Organization'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
