import apiClient from './client';
import {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MessageResponse,
  User,
} from '@/lib/types/auth';

export const authApi = {
  register: async (data: RegisterRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/v1/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/login', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/v1/auth/resend-otp', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/v1/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/v1/auth/reset-password', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/refresh-token', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/v1/auth/me');
    return response.data;
  },
};
