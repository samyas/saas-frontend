'use client';

import { useState } from 'react';
import { Shield, MoreVertical, Trash2, UserCog } from 'lucide-react';
import { OrganizationMember, MemberRole, PagedResponse } from '@/lib/types/organization';
import { organizationApi } from '@/lib/api/organization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/hooks/use-toast';

interface MembersListProps {
  organizationId: string;
  pagedMembers: PagedResponse<OrganizationMember>;
  currentUserRole: MemberRole;
  onMembersChange: (page?: number) => void;
  onPageChange: (page: number) => void;
}

export function MembersList({
  organizationId,
  pagedMembers,
  currentUserRole,
  onMembersChange,
  onPageChange,
}: MembersListProps) {
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [isLoading, setIsLoading] = useState(false);

  const canManageMembers = currentUserRole === MemberRole.OWNER || currentUserRole === MemberRole.ADMIN;
  const canChangeRoles = currentUserRole === MemberRole.OWNER; // Only owners can change roles

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRole) return;

    setIsLoading(true);
    try {
      await organizationApi.updateMemberRole(organizationId, selectedMember.id, { role: newRole });
      
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });

      setShowRoleDialog(false);
      setSelectedMember(null);
      onMembersChange();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update member role';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      await organizationApi.removeMember(organizationId, selectedMember.id);
      
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });

      setShowDeleteDialog(false);
      setSelectedMember(null);
      onMembersChange();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove member';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleDialog = (member: OrganizationMember) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setShowRoleDialog(true);
  };

  const openDeleteDialog = (member: OrganizationMember) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
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

  return (
    <>
      <div className="space-y-4">
        {pagedMembers.content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members found
          </div>
        ) : (
          pagedMembers.content.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {member.userFirstName} {member.userLastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.userEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {member.role}
                </Badge>

                {canManageMembers && member.role !== MemberRole.OWNER && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canChangeRoles && (
                        <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(member)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={pagedMembers.currentPage}
        totalPages={pagedMembers.totalPages}
        hasNext={pagedMembers.hasNext}
        hasPrevious={pagedMembers.hasPrevious}
        onPageChange={onPageChange}
      />

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.userFirstName} {selectedMember?.userLastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as MemberRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MemberRole.MEMBER}>Member</SelectItem>
                <SelectItem value={MemberRole.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isLoading}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.userFirstName} {selectedMember?.userLastName} from the organization?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
