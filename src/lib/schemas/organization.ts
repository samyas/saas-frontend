import { z } from 'zod';
import { MemberRole } from '@/lib/types/organization';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  planId: z.string().uuid().optional(), // Optional: defaults to FREE plan if not specified
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

export const sendInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(MemberRole).refine(
    (val) => Object.values(MemberRole).includes(val),
    { message: 'Please select a valid role' }
  ),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(MemberRole).refine(
    (val) => Object.values(MemberRole).includes(val),
    { message: 'Please select a valid role' }
  ),
});

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;
export type SendInvitationFormData = z.infer<typeof sendInvitationSchema>;
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>;
