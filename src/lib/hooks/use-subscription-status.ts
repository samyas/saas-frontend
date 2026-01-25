"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/utils/token";

interface SubscriptionUpdate {
  status: string;
  planId: string;
  subscriptionId: string;
}

interface UseSubscriptionStatusOptions {
  organizationId: string;
  enabled: boolean;
  onStatusChange?: (update: SubscriptionUpdate) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useSubscriptionStatus({
  organizationId,
  enabled,
  onStatusChange,
  onComplete,
  onError,
}: UseSubscriptionStatusOptions) {
  const [status, setStatus] = useState<SubscriptionUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !organizationId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const token = getAccessToken();

    if (!token) {
      onError?.(new Error("No access token found"));
      return;
    }

    // Create SSE connection with token as query parameter
    // EventSource doesn't support custom headers, so we pass token via URL
    const eventSource = new EventSource(
      `${apiUrl}/v1/organizations/${organizationId}/subscription/status?token=${encodeURIComponent(token)}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("subscription-update", (event) => {
      const data = JSON.parse(event.data) as SubscriptionUpdate;
      setStatus(data);
      onStatusChange?.(data);

      // If status is ACTIVE, complete the connection
      if (data.status === "ACTIVE") {
        onComplete?.();
        eventSource.close();
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
      onError?.(new Error("Connection error"));
      eventSource.close();
    };

    // Cleanup
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [organizationId, enabled, onStatusChange, onComplete, onError]);

  return { status, isConnected };
}
