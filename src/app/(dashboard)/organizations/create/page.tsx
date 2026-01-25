'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, ArrowLeft, ArrowRight, Building2, CreditCard } from 'lucide-react';
import { createOrganizationSchema, type CreateOrganizationFormData } from '@/lib/schemas/organization';
import { organizationApi } from '@/lib/api/organization';
import { planApi, Plan } from '@/lib/api/plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Basic Info', icon: Building2 },
  { id: 2, name: 'Select Plan', icon: CreditCard },
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planApi.list();
        setPlans(data);
        // Select free plan by default
        const freePlan = data.find(p => p.slug === 'free');
        if (freePlan) {
          setSelectedPlanId(freePlan.id);
          setValue('planId', freePlan.id);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
        toast({
          title: 'Error',
          description: 'Failed to load plans',
          variant: 'destructive',
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchPlans();
  }, [setValue]);

  const onSubmit = async (data: CreateOrganizationFormData) => {
    setIsLoading(true);

    try {
      const organization = await organizationApi.create({
        ...data,
        planId: selectedPlanId,
      });
      
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });

      router.push(`/organizations/${organization.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create organization. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setValue('planId', planId);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      const isValid = await trigger(['name', 'slug']);
      if (isValid) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="ghost" className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
        <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Create Organization</h1>
          <p className="text-primary-foreground/80 text-sm">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-all',
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="border-2 animate-fade-in">
            <CardHeader className="bg-muted rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the details for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Acme Inc"
                  {...register('name')}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="acme-inc"
                  {...register('slug')}
                  disabled={isLoading}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive font-medium">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Brief description of your organization"
                  {...register('description')}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Plan Selection */}
        {currentStep === 2 && (
          <Card className="border-2 animate-fade-in">
            <CardHeader className="bg-muted rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Select a Plan
              </CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingPlans ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isLoading}
                      className={cn(
                        'relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left w-full',
                        selectedPlanId === plan.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50',
                        isLoading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          selectedPlanId === plan.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        )}
                      >
                        {selectedPlanId === plan.id && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                          <span className="text-lg font-bold text-primary">
                            {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}/mo`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>
                              {plan.features.max_members === -1
                                ? 'Unlimited members'
                                : `Up to ${plan.features.max_members} members`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>
                              {plan.features.max_projects === -1
                                ? 'Unlimited projects'
                                : `Up to ${plan.features.max_projects} projects`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/organizations">
              <Button type="button" variant="ghost" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext} disabled={isLoading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !selectedPlanId}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Organization
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
