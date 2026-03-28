import { Card, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsGeneralPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Card>
        <CardTitle className="mb-4">General</CardTitle>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Workspace settings will be available here. Configure workspace name,
            branding, and subdomain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
