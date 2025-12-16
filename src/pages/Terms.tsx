import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - SoundPods Store</title>
        <meta name="description" content="Read our terms of service governing the use of SoundPods Store website and services." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <p className="text-muted-foreground mb-6">Last updated: December 2025</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using SoundPods Store, you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not 
                use our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Products and Pricing</h2>
              <p className="text-muted-foreground">
                All prices are listed in Indian Rupees (INR) and are subject to change 
                without notice. We reserve the right to modify or discontinue products 
                at any time. Product images are for illustration purposes and may vary 
                from actual products.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Orders and Payment</h2>
              <p className="text-muted-foreground">
                By placing an order, you warrant that you are legally capable of entering 
                into binding contracts. We reserve the right to refuse or cancel orders 
                at any time for reasons including product availability, errors in pricing 
                or product information, or suspected fraudulent activity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground">
                Delivery times are estimates and may vary. We are not responsible for 
                delays caused by shipping carriers or circumstances beyond our control. 
                Risk of loss passes to you upon delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground">
                Please refer to our Return & Refund Policy for detailed information 
                about our return procedures, eligibility, and refund processing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account 
                credentials. You agree to notify us immediately of any unauthorized 
                access or use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at 
                soundpods28@gmail.com 
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
