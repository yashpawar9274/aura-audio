import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the warranty period for AirPods?",
    answer: "All AirPods come with a 6-Month Dealer warranty. Extended warranty options are available at checkout.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for an additional fee. Same-day delivery is available in select cities.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unused products in original packaging. Opened products can be returned within 7 days if defective.",
  },
  {
    question: "Are the AirPods genuine?",
    answer: "Yes, all our AirPods are 100% genuine Apple products sourced directly from authorized distributors. We provide original warranty and support.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email Or Track order on website also. You can also track your order on our Track Order page using your order number and email.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes, we offer Cash on Delivery (COD) for orders within India. COD is available for orders up to ₹50,000.",
  },
  {
    question: "How do I apply a coupon code?",
    answer: "You can apply coupon codes during checkout. Enter your code in the 'Coupon Code' field and click 'Apply' to see your discount.",
  },
  {
    question: "Can I cancel my order?",
    answer: "You can cancel your order before it's shipped by contacting our support team. Once shipped, you'll need to wait for delivery and then initiate a return.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-12">
            Find answers to common questions about our products, shipping, and policies.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Layout>
  );
}