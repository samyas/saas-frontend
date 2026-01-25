import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and settings
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Settings Coming Soon</CardTitle>
          <CardDescription>
            Application settings and preferences will be available in a future update
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            You'll be able to customize your experience, manage notifications, and configure various application settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
