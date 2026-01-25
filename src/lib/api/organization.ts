import apiClient from './client';
import axios from 'axios';
import {
  Organization,
  OrganizationMember,
  Invitation,
  InvitationPreview,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  SendInvitationRequest,
  AcceptInvitationRequest,
  UpdateMemberRoleRequest,
  PagedResponse,
} from '@/lib/types/organization';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const organizationApi = {
  // Organization CRUD
  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/v1/organizations', data);
    return response.data;
  },

  list: async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>('/v1/organizations');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/v1/organizations/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.put<Organization>(`/v1/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/organizations/${id}`);
  },

  // Members
  listMembers: async (
    organizationId: string, 
    page?: number, 
    size?: number
  ): Promise<PagedResponse<OrganizationMember>> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    
    const response = await apiClient.get<PagedResponse<OrganizationMember>>(
      `/v1/organizations/${organizationId}/members${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },

  removeMember: async (organizationId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/v1/organizations/${organizationId}/members/${memberId}`);
  },

  updateMemberRole: async (
    organizationId: string,
    memberId: string,
    data: UpdateMemberRoleRequest
  ): Promise<void> => {
    await apiClient.put(`/v1/organizations/${organizationId}/members/${memberId}/role`, data);
  },

  // Invitations
  sendInvitation: async (organizationId: string, data: SendInvitationRequest): Promise<Invitation> => {
    const response = await apiClient.post<Invitation>(
      `/v1/organizations/${organizationId}/invitations`,
      data
    );
    return response.data;
  },

  listInvitations: async (organizationId: string): Promise<Invitation[]> => {
    const response = await apiClient.get<Invitation[]>(
      `/v1/organizations/${organizationId}/invitations`
    );
    return response.data;
  },

  cancelInvitation: async (organizationId: string, invitationId: string): Promise<void> => {
    await apiClient.delete(`/v1/organizations/${organizationId}/invitations/${invitationId}`);
  },

  acceptInvitation: async (data: AcceptInvitationRequest): Promise<void> => {
    await apiClient.post('/v1/invitations/accept', data);
  },

  /**
   * Preview invitation details by token (public endpoint - no auth required)
   */
  getInvitationPreview: async (token: string): Promise<InvitationPreview> => {
    // Use axios directly for public endpoint (no auth required)
    const response = await axios.get<InvitationPreview>(`${API_URL}/v1/invitations/${token}`);
    return response.data;
  },
};
