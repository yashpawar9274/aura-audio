import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Refer = () => {
  return (
    <>
      <Helmet>
        <title>Refer & Earn — Coming Soon</title>
        <meta name="description" content="Refer & Earn is coming soon." />
        <link rel="canonical" href="/refer" />
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto py-24 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Refer & Earn — Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">We're working on an improved Refer & Earn experience. It will be available here soon.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
};

export default Refer;
