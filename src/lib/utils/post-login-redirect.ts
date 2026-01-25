import { organizationApi } from '@/lib/api/organization';

/**
 * Determines the appropriate redirect URL after successful login
 * 
 * Logic:
 * 1. If returnUrl is provided (e.g., from invitation flow), redirect there
 * 2. If user has no organizations, redirect to organizations page (shows empty state with create button)
 * 3. If user has 1 organization, redirect to that organization's dashboard
 * 4. If user has multiple organizations, redirect to organizations list to choose
 * 
 * @param returnUrl - Optional return URL from query params
 * @returns The URL to redirect to
 */
export async function getPostLoginRedirect(returnUrl?: string | null): Promise<string> {
  console.log('[POST-LOGIN] Starting redirect logic, returnUrl:', returnUrl);
  
  // Priority 1: Return URL (e.g., from invitation acceptance flow)
  if (returnUrl) {
    console.log('[POST-LOGIN] Using returnUrl:', returnUrl);
    return returnUrl;
  }

  try {
    console.log('[POST-LOGIN] Fetching organizations...');
    // Priority 2: Check user's organizations
    const organizations = await organizationApi.list();
    console.log('[POST-LOGIN] Organizations found:', organizations.length);

    if (organizations.length === 0) {
      // No organizations - redirect to organizations page (shows empty state with create button)
      console.log('[POST-LOGIN] No organizations, redirecting to /organizations');
      return '/organizations';
    } else if (organizations.length === 1) {
      // Single organization - redirect to its dashboard
      const redirectUrl = `/organizations/${organizations[0].id}`;
      console.log('[POST-LOGIN] One organization, redirecting to:', redirectUrl);
      return redirectUrl;
    } else {
      // Multiple organizations - redirect to list to choose
      console.log('[POST-LOGIN] Multiple organizations, redirecting to /organizations');
      return '/organizations';
    }
  } catch (error) {
    console.error('[POST-LOGIN] Failed to fetch organizations for redirect:', error);
    // Fallback to organizations page
    console.log('[POST-LOGIN] Error occurred, fallback to /organizations');
    return '/organizations';
  }
}

/**
 * Extracts returnUrl from URL search params
 * 
 * @param searchParams - URLSearchParams or string
 * @returns The decoded return URL or null
 */
export function getReturnUrl(searchParams: URLSearchParams | string): string | null {
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams) 
    : searchParams;
  
  const returnUrl = params.get('returnUrl');
  return returnUrl ? decodeURIComponent(returnUrl) : null;
}
