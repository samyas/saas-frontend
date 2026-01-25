import apiClient from './client';
import {
  Organization,
  Subscription,
  PagedResponse,
  DisableSubscriptionRequest,
} from '@/lib/types/admin';

export const adminApi = {
  /**
   * List all organizations in the system (super admin only)
   */
  listAllOrganizations: async (
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<Organization>> => {
    const response = await apiClient.get<PagedResponse<Organization>>(
      `/v1/admin/organizations?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * List all subscriptions in the system (super admin only)
   */
  listAllSubscriptions: async (
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<Subscription>> => {
    const response = await apiClient.get<PagedResponse<Subscription>>(
      `/v1/admin/subscriptions?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Disable an organization's subscription (super admin only)
   */
  disableSubscription: async (
    organizationId: string,
    data?: DisableSubscriptionRequest
  ): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>(
      `/v1/admin/organizations/${organizationId}/subscriptions/disable`,
      data || { reason: 'Disabled by super admin' }
    );
    return response.data;
  },
};
