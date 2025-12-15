import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ReferAndEarn } from "@/components/referral/ReferAndEarn";

const Refer = () => {
  return (
    <>
      <Helmet>
        <title>Refer & Earn</title>
        <meta name="description" content="Refer & Earn — share with friends and earn rewards" />
        <link rel="canonical" href="/refer" />
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-6">
              <ReferAndEarn />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
};

export default Refer;
