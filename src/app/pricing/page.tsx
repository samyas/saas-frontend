'use client';

import { useEffect, useState } from 'react';
import { planApi, Plan } from '@/lib/api/plan';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planApi.list();
        setPlans(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
    
    return features;
  };

  const formatPrice = (price: number, interval: string): string => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)} / ${interval.toLowerCase()}`;
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
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your team
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.slug === 'premium' ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plan.slug === 'premium' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold">
                  {plan.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      ${plan.price.toFixed(2)}
                      <span className="text-base font-normal text-muted-foreground">
                        /{plan.interval.toLowerCase()}
                      </span>
                    </>
                  )}
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
                variant={plan.slug === 'premium' ? 'default' : 'outline'}
                onClick={() => router.push('/register')}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>All plans include email support and regular updates</p>
      </div>
    </div>
  );
}
