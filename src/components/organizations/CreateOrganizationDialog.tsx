'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check } from 'lucide-react';
import { createOrganizationSchema, type CreateOrganizationFormData } from '@/lib/schemas/organization';
import { organizationApi } from '@/lib/api/organization';
import { planApi, Plan } from '@/lib/api/plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/hooks/use-toast';
import { Organization } from '@/lib/types/organization';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (organization: Organization) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
  });

  // Fetch plans when dialog opens
  useEffect(() => {
    if (open) {
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
        } finally {
          setLoadingPlans(false);
        }
      };
      
      fetchPlans();
    }
  }, [open, setValue]);

  const onSubmit = async (data: CreateOrganizationFormData) => {
    setIsLoading(true);

    try {
      // Include selected planId
      const organization = await organizationApi.create({
        ...data,
        planId: selectedPlanId,
      });
      
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });

      reset();
      setSelectedPlanId(undefined);
      onSuccess(organization);
      onOpenChange(false);
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

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSelectedPlanId(undefined);
      onOpenChange(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setValue('planId', planId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Organization Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Acme Inc"
              {...register('name')}
              disabled={isLoading}
              className="border-2"
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="font-medium">Slug</Label>
            <Input
              id="slug"
              type="text"
              placeholder="acme-inc"
              {...register('slug')}
              disabled={isLoading}
              className="border-2"
            />
            {errors.slug && (
              <p className="text-sm text-destructive font-medium">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used in URLs. Must contain only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="A brief description"
              {...register('description')}
              disabled={isLoading}
              className="border-2"
            />
            {errors.description && (
              <p className="text-sm text-destructive font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="font-medium">Select Plan</Label>
            {loadingPlans ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isLoading}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left w-full ${
                      selectedPlanId === plan.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPlanId === plan.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedPlanId === plan.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{plan.name}</p>
                        <p className="text-sm font-bold text-primary">
                          {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}`}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>
                          {plan.features.max_members === -1
                            ? 'Unlimited members'
                            : `${plan.features.max_members} members`}
                        </span>
                        <span>•</span>
                        <span>
                          {plan.features.max_projects === -1
                            ? 'Unlimited projects'
                            : `${plan.features.max_projects} projects`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
