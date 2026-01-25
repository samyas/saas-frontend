export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  role: MemberRole; // Current user's role in this organization
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MemberRole;
  token: string;
  invitedBy: string;
  expiresAt: string;
  accepted: boolean;
  acceptedAt: string | null;
  createdAt: string;
}

export interface InvitationPreview {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  email: string;
  role: MemberRole;
  inviterName: string;
  inviterEmail: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  planId?: string; // Optional: defaults to FREE plan if not specified
}

export interface UpdateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface SendInvitationRequest {
  email: string;
  role: MemberRole;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
