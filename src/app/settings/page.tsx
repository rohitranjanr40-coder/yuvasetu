
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function SettingsPage() {
  // In a real app, you'd get this from your Firebase project config.
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id";
  const hostingUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/hosting/main`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account and application settings.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>
            Once deployed, you can connect a domain name to give your application a professional, branded URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Connect your domain</p>
              <p className="text-sm text-muted-foreground">
                Follow the instructions in the Firebase console to connect domains like <strong>yuvasetu.co.in</strong>.
              </p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link href={hostingUrl} target="_blank" rel="noopener noreferrer">
                <span>Go to Firebase</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-4">
            You will need to verify domain ownership by adding DNS records through your domain registrar. Firebase will then provision a free SSL certificate automatically. This process happens outside of this application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
