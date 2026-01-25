import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, Zap, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="text-xl font-bold">SaaS App</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-20 pb-16">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 flex justify-center animate-fade-in">
              <Badge variant="outline" className="px-3 py-1">
                <Star className="w-3 h-3 mr-2 fill-current" />
                Modern SaaS Platform
                <ArrowRight className="w-3 h-3 ml-2" />
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in">
              Build Better Teams with{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Modern Collaboration
              </span>
            </h1>

            {/* Subheading */}
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-fade-in">
              A modern, full-stack SaaS platform with authentication, user management, 
              and organization features. Built with Next.js, TypeScript, and Spring Boot.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                  ))}
                </div>
                <span>1000+ Users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
                <span className="ml-1">5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help your team collaborate and grow
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all animate-scale-in">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Secure Authentication</h3>
              <p className="text-muted-foreground text-sm">
                JWT-based authentication with email verification, password reset, and automatic token refresh.
              </p>
            </div>

            <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">User Management</h3>
              <p className="text-muted-foreground text-sm">
                Complete user profile management with role-based access control and account settings.
              </p>
            </div>

            <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Modern Stack</h3>
              <p className="text-muted-foreground text-sm">
                Built with Next.js 14, TypeScript, Tailwind CSS, and powered by a robust Spring Boot backend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center shadow-lg animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
            <p className="mb-8 text-muted-foreground text-lg">
              Create your account in seconds and start exploring the platform.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 SaaS App. Built with Next.js and Spring Boot.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

