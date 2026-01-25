"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { subscriptionApi } from "@/lib/api/subscription";
import { planApi } from "@/lib/api/plan";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { toast } from "@/lib/hooks/use-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  organizationId: string;
  planId: string;
  planName: string;
  planPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({
  organizationId,
  planId,
  planName,
  planPrice,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForActivation, setIsWaitingForActivation] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidated, setCouponValidated] = useState(false);
  const [couponValid, setCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // SSE hook for real-time status updates
  const { status } = useSubscriptionStatus({
    organizationId,
    enabled: isWaitingForActivation,
    onStatusChange: (update) => {
      console.log("Subscription status update:", update);
    },
    onComplete: () => {
      setIsWaitingForActivation(false);
      toast({
        title: "Success!",
        description: "Your subscription is now active.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("SSE error:", error);
      setIsWaitingForActivation(false);
      toast({
        title: "Error",
        description: "Failed to get subscription status. Please refresh.",
        variant: "destructive",
      });
    },
  });

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await planApi.validateCoupon(planId, couponCode.trim());
      setCouponValidated(true);
      setCouponValid(result.valid);
      setCouponMessage(result.message);

      if (result.valid) {
        toast({
          title: "Valid Coupon!",
          description: result.message,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate coupon code",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);

    try {
      // If coupon is valid, skip Stripe and create free subscription
      if (couponValidated && couponValid) {
        const response = await subscriptionApi.createSubscription(organizationId, {
          planId,
          paymentMethodId: "coupon", // Dummy payment method ID for coupon-based subscriptions
          couponCode: couponCode.trim(),
        });

        console.log("Free subscription created with coupon:", response);

        // Start listening for status updates via SSE
        setIsProcessing(false);
        setIsWaitingForActivation(true);
        return;
      }

      // Normal Stripe payment flow
      if (!stripe || !elements) {
        return;
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      // Call backend to create subscription
      const response = await subscriptionApi.createSubscription(organizationId, {
        planId,
        paymentMethodId: paymentMethod.id,
        couponCode: couponCode.trim() || undefined, // Include coupon code if provided
      });

      console.log("Subscription created:", response);

      // Start listening for status updates via SSE
      setIsProcessing(false);
      setIsWaitingForActivation(true);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{planName}</p>
            <p className="text-sm text-muted-foreground">Billed monthly</p>
          </div>
          <p className="text-2xl font-bold">
            {couponValidated && couponValid ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${planPrice}/mo`
            )}
          </p>
        </div>
      </div>

      {/* Coupon Section */}
      {!isWaitingForActivation && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Code (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponValidated(false); // Reset validation when code changes
                }}
                disabled={couponValidated && couponValid}
                className="flex-1 border rounded-md p-3 bg-background text-sm disabled:opacity-50"
              />
              <Button
                type="button"
                onClick={handleValidateCoupon}
                disabled={isValidatingCoupon || (couponValidated && couponValid) || !couponCode.trim()}
                variant="outline"
              >
                {isValidatingCoupon ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : couponValidated && couponValid ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Valid
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {couponValidated && (
              <p className={`text-xs ${couponValid ? 'text-green-600' : 'text-destructive'}`}>
                {couponMessage}
              </p>
            )}
            {!couponValidated && (
              <p className="text-xs text-muted-foreground">
                Have a coupon? Enter it here to get this plan for free.
              </p>
            )}
          </div>

          {/* Card Input - Only show if no valid coupon */}
          {!(couponValidated && couponValid) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Details</label>
              <div className="border rounded-md p-3 bg-background">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-muted-foreground">
                Your payment information is secure and encrypted.
              </p>
            </div>
          )}
        </>
      )}

      {/* Status Display */}
      {isWaitingForActivation && (
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Activating your subscription...
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Status: {status?.status || "Processing"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing || isWaitingForActivation}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isProcessing || 
            isWaitingForActivation || 
            (!(couponValidated && couponValid) && !stripe)
          }
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isWaitingForActivation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating...
            </>
          ) : couponValidated && couponValid ? (
            "Activate Free Subscription"
          ) : (
            `Subscribe for $${planPrice}/mo`
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-center text-muted-foreground">
        {couponValidated && couponValid 
          ? "Free forever - no payment required. Cancel anytime."
          : "Powered by Stripe. Cancel anytime."}
      </p>
    </form>
  );
}

interface SubscriptionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  planId: string;
  planName: string;
  planPrice: number;
  onSuccess: () => void;
}

export function SubscriptionPaymentDialog({
  open,
  onOpenChange,
  organizationId,
  planId,
  planName,
  planPrice,
  onSuccess,
}: SubscriptionPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {planName}</DialogTitle>
          <DialogDescription>
            Enter your payment details to upgrade your plan
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm
            organizationId={organizationId}
            planId={planId}
            planName={planName}
            planPrice={planPrice}
            onSuccess={() => {
              onSuccess();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
