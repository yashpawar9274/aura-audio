import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

export default function Returns() {
  return (
    <>
      <Helmet>
        <title>Return & Refund Policy - AirPods Store</title>
        <meta name="description" content="Learn about our return and refund policies including eligibility, process, and timelines." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold mb-8">Return & Refund Policy</h1>
            
            <p className="text-muted-foreground mb-6">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Return Eligibility</h2>
              <p className="text-muted-foreground mb-4">
                You may return most items within 7 days of delivery for a full refund. 
                To be eligible for a return:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Items must be unused and in original packaging</li>
                <li>All accessories and documentation must be included</li>
                <li>Items must not show signs of wear or damage</li>
                <li>Proof of purchase is required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Non-Returnable Items</h2>
              <p className="text-muted-foreground mb-4">
                The following items cannot be returned:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Products with broken seals (for hygiene reasons)</li>
                <li>Items marked as non-returnable at the time of purchase</li>
                <li>Products damaged due to misuse or negligence</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Return Process</h2>
              <p className="text-muted-foreground mb-4">
                To initiate a return:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Contact our customer support team within 7 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive a return authorization and shipping instructions</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Ship the item using our provided return label</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Refund Timeline</h2>
              <p className="text-muted-foreground">
                Once we receive and inspect your return, we will notify you of the refund 
                status. Approved refunds will be processed within 5-7 business days. 
                The refund will be credited to your original payment method.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Exchanges</h2>
              <p className="text-muted-foreground">
                If you need a different product, please return your item for a refund 
                and place a new order for the desired item.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Damaged or Defective Items</h2>
              <p className="text-muted-foreground">
                If you receive a damaged or defective item, please contact us immediately. 
                We will arrange for a replacement or full refund at no additional cost to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground">
                For return-related queries, please contact us at returns@airpodsstore.com 
                or call our customer support.
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
