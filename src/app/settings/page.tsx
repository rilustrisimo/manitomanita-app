'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AuthGuard } from '@/components/auth-guard';

export default function SettingsPage() {
  return (
    <AuthGuard 
      loadingMessage="Loading settings..."
      loginMessage="Please log in"
      loginDescription="Sign in to access your account settings and preferences."
    >
      <SettingsPageContent />
    </AuthGuard>
  );
}

function SettingsPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 pt-24">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Settings</CardTitle>
              <CardDescription>Manage your account and notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                  <h3 className="font-semibold text-lg mb-4">Notifications</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <Label htmlFor="email-notifications">Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive emails about group activity and reminders.</p>
                          </div>
                          <Switch id="email-notifications" defaultChecked />
                      </div>
                       <div className="flex items-center justify-between">
                          <div>
                              <Label htmlFor="comment-notifications">New Comment Alerts</Label>
                              <p className="text-sm text-muted-foreground">Get notified when someone comments on your profile in a group.</p>
                          </div>
                          <Switch id="comment-notifications" defaultChecked />
                      </div>
                  </div>
              </section>
              
              <Separator />

              <section>
                  <h3 className="font-semibold text-lg mb-4">Account Security</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                      </div>
                      <Button>Change Password</Button>
                  </div>
              </section>

               <Separator />

               <section>
                  <h3 className="font-semibold text-lg mb-2 text-destructive">Danger Zone</h3>
                  <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                      <div>
                          <Label>Delete Account</Label>
                          <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                      </div>
                      <Button variant="destructive">Delete My Account</Button>
                  </div>
              </section>
              
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
