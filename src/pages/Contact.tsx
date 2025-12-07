import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@airpodsstore.in",
    href: "mailto:support@airpodsstore.in",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 1800-123-4567",
    href: "tel:+911800123456",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "123 Tech Park, Bangalore, India 560001",
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Mon - Sat: 9:00 AM - 8:00 PM",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | AirPods Store</title>
        <meta
          name="description"
          content="Get in touch with AirPods Store. We're here to help with your orders, product inquiries, and any other questions you might have."
        />
      </Helmet>

      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question or need help? We're here for you. Send us a message
                and we'll respond within 24 hours.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* FAQ Link */}
                <div className="pt-8 border-t border-border">
                  <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check out our FAQ section for answers to common questions about
                    orders, shipping, and returns.
                  </p>
                  <Button variant="outline">View FAQ</Button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <form
                  onSubmit={handleSubmit}
                  className="p-8 rounded-2xl bg-secondary/30 border border-border/50"
                >
                  <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                      >
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-2"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="cart"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Contact;
