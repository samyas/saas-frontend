import { apiClient } from './client';

export interface SubscriptionUsage {
  subscriptionId: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY';
    features: {
      max_members: number;
      max_projects: number;
    };
    active: boolean;
    createdAt: string;
  };
  usage: {
    currentMembers: number;
    maxMembers: number | null;
    memberUsagePercent: number | null;
    unlimitedMembers: boolean;
  };
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  stripeCustomerId: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
  couponCode?: string; // Optional coupon code
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string | null;
  status: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId: string;
  stripeInvoiceId: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  content: Payment[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'OVERDUE' | 'VOID' | 'REFUNDED';
  billingName: string;
  billingEmail: string;
  description: string;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  hasPdf: boolean;
}

export interface InvoiceHistoryResponse {
  content: Invoice[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const subscriptionApi = {
  /**
   * Get organization subscription details with usage info
   */
  getOrganizationSubscription: async (organizationId: string): Promise<SubscriptionUsage> => {
    const response = await apiClient.get(`/v1/organizations/${organizationId}/subscription`);
    return response.data;
  },

  /**
   * Create a subscription directly with payment method (no redirect)
   */
  createSubscription: async (
    organizationId: string,
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> => {
    const response = await apiClient.post(
      `/v1/organizations/${organizationId}/subscription/subscribe`,
      request
    );
    return response.data;
  },

  /**
   * Create a Stripe checkout session to subscribe to a plan (DEPRECATED)
   */
  createCheckoutSession: async(
    organizationId: string,
    request: CreateCheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post(
      `/v1/organizations/${organizationId}/subscription/checkout`,
      request
    );
    return response.data;
  },

  /**
   * Cancel a subscription (at period end or immediately)
   */
  cancelSubscription: async (organizationId: string, immediately: boolean = false): Promise<void> => {
    await apiClient.post(`/v1/organizations/${organizationId}/subscription/cancel`, null, {
      params: { immediately },
    });
  },

  /**
   * Reactivate a subscription that was scheduled for cancellation
   */
  reactivateSubscription: async (organizationId: string): Promise<void> => {
    await apiClient.post(`/v1/organizations/${organizationId}/subscription/reactivate`);
  },

  /**
   * Create a billing portal session for managing payment methods
   */
  createBillingPortalSession: async (
    organizationId: string,
    returnUrl: string
  ): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post(
      `/v1/organizations/${organizationId}/subscription/billing-portal`,
      { returnUrl }
    );
    return response.data;
  },

  /**
   * Get payment history for an organization
   */
  getPaymentHistory: async (
    organizationId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaymentHistoryResponse> => {
    const response = await apiClient.get(`/v1/organizations/${organizationId}/payments`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Download invoice PDF for a payment
   */
  downloadPaymentInvoice: async (organizationId: string, paymentId: string): Promise<Blob> => {
    const response = await apiClient.get(
      `/v1/organizations/${organizationId}/payments/${paymentId}/invoice`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
