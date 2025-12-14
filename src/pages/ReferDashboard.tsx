import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ReferDashboard() {
  const { user } = useAuth();
  const [loading] = useState(false);

  if (!user) return <div className="p-12">Please sign in to view your referrals.</div>;
  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Referrals — Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We are improving the referral dashboard. The full referral features will be available here soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
