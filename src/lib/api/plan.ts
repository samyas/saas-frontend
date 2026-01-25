import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: {
    max_members: number;
    max_projects: number;
    [key: string]: any;
  };
  active: boolean;
  hasCoupon?: boolean; // Indicates if plan supports coupon codes
  createdAt: string;
}

export interface ValidateCouponRequest {
  couponCode: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  message: string;
}

export const planApi = {
  /**
   * List all active subscription plans (public endpoint - no auth required)
   */
  list: async (): Promise<Plan[]> => {
    // Use axios directly for public endpoint (no auth required)
    const response = await axios.get<Plan[]>(`${API_URL}/v1/plans`);
    return response.data;
  },

  /**
   * Validate a coupon code for a specific plan (public endpoint - no auth required)
   */
  validateCoupon: async (planId: string, couponCode: string): Promise<ValidateCouponResponse> => {
    const response = await axios.post<ValidateCouponResponse>(
      `${API_URL}/v1/plans/${planId}/validate-coupon`,
      { couponCode }
    );
    return response.data;
  },
};
