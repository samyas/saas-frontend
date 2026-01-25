'use client';

import { useState } from 'react';
import { Mail, X, Clock } from 'lucide-react';
import { Invitation, MemberRole } from '@/lib/types/organization';
import { organizationApi } from '@/lib/api/organization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/hooks/use-toast';

interface InvitationsListProps {
  organizationId: string;
  invitations: Invitation[];
  currentUserRole: MemberRole;
  onInvitationsChange: () => void;
}

export function InvitationsList({
  organizationId,
  invitations,
  currentUserRole,
  onInvitationsChange,
}: InvitationsListProps) {
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canManageInvitations = currentUserRole === MemberRole.OWNER || currentUserRole === MemberRole.ADMIN;

  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;

    setIsLoading(true);
    try {
      await organizationApi.cancelInvitation(organizationId, selectedInvitation.id);
      
      toast({
        title: 'Success',
        description: 'Invitation cancelled successfully',
      });

      setShowCancelDialog(false);
      setSelectedInvitation(null);
      onInvitationsChange();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel invitation';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowCancelDialog(true);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getRoleBadgeVariant = (role: MemberRole) => {
    switch (role) {
      case MemberRole.OWNER:
        return 'default';
      case MemberRole.ADMIN:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Filter out accepted invitations
  const pendingInvitations = invitations.filter((inv) => !inv.accepted);

  return (
    <>
      <div className="space-y-4">
        {pendingInvitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          pendingInvitations.map((invitation) => {
            const expired = isExpired(invitation.expiresAt);
            
            return (
              <div
                key={invitation.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  expired ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {expired ? (
                        <span className="text-destructive">
                          Expired {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>
                          Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(invitation.role)}>
                    {invitation.role}
                  </Badge>

                  {expired && (
                    <Badge variant="destructive">Expired</Badge>
                  )}

                  {canManageInvitations && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openCancelDialog(invitation)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Invitation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this invitation? The recipient will no longer
              be able to join using this invitation link.
            </DialogDescription>
          </DialogHeader>

          {selectedInvitation && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {selectedInvitation.email}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Role:</span> {selectedInvitation.role}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isLoading}
            >
              Keep Invitation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInvitation}
              disabled={isLoading}
            >
              Cancel Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
