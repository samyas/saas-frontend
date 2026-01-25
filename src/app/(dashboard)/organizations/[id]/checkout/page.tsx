'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { planApi, Plan } from '@/lib/api/plan';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { SubscriptionPaymentDialog } from '@/components/subscription/subscription-payment-dialog';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const organizationId = params.id as string;
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planApi.list();
        // Filter out free plan for checkout
        setPlans(data.filter(plan => plan.price > 0));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Subscription Activated!',
      description: 'Your new plan is now active.',
    });
    
    // Redirect to organization page
    router.push(`/organizations/${organizationId}`);
  };

  const getFeatureList = (plan: Plan): string[] => {
    const features: string[] = [];
    
    if (plan.features.max_members === -1) {
      features.push('Unlimited members');
    } else {
      features.push(`Up to ${plan.features.max_members} members`);
    }
    
    if (plan.features.max_projects === -1) {
      features.push('Unlimited projects');
    } else {
      features.push(`Up to ${plan.features.max_projects} projects`);
    }
    
    // Add common features
    features.push('Email support');
    features.push('Regular updates');
    features.push('30-day money back guarantee');
    
    return features;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Plans</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href={`/organizations/${organizationId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/organizations/${organizationId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that best fits your team's needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.slug === 'professional' ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.slug === 'professional' && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  RECOMMENDED
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-bold">
                    ${plan.price.toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.interval.toLowerCase()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {getFeatureList(plan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.slug === 'professional' ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Subscribe to {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Secure payment powered by Stripe
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at support@example.com
          </p>
        </div>
      </div>

      {/* Payment Dialog */}
      {selectedPlan && (
        <SubscriptionPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          organizationId={organizationId}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
