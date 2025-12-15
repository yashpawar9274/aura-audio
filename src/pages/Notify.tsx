import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { NotifyMeButton } from "@/components/notify/NotifyMeButton";

const Notify = () => {
  return (
    <>
      <Helmet>
        <title>Notify Me - Get Product Launch Alerts</title>
        <meta name="description" content="Subscribe to get notified when products launch." />
        <link rel="canonical" href="/notify" />
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto py-12 space-y-6">
          <h1 className="text-3xl font-bold">Get Notified</h1>
          <p className="text-muted-foreground">Subscribe to receive email alerts when products are available.</p>

          <div className="mt-6">
            <NotifyMeButton />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Notify;
