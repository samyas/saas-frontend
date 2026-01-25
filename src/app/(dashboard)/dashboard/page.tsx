'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-primary-foreground/80 text-lg">
          Welcome back, {user.firstName}! Here's your account overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift border-2 shadow-lg animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Full Name</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-2 shadow-lg animate-scale-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{user.email}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-2 shadow-lg animate-scale-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.role}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-2 shadow-lg animate-scale-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.status}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-xl animate-fade-in">
        <CardHeader className="bg-muted rounded-t-2xl">
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <CardDescription>
            Your account details and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all">
            <span className="text-sm font-medium">Email Verified</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${user.emailVerified ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'}`}>
              {user.emailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all">
            <span className="text-sm font-medium">Account Created</span>
            <span className="text-sm text-muted-foreground font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all">
            <span className="text-sm font-medium">Last Updated</span>
            <span className="text-sm text-muted-foreground font-medium">
              {new Date(user.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
