import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Users, Heart, Leaf } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We source only authentic, high-quality products directly from authorized distributors.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Our dedicated support team is here to ensure your complete satisfaction.",
  },
  {
    icon: Heart,
    title: "Passion for Audio",
    description:
      "We're audiophiles ourselves, committed to bringing you the best listening experience.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description:
      "We use eco-friendly packaging and partner with recycling programs.",
  },
];

const About = () => {
  const [settingsHtml, setSettingsHtml] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('about_html').eq('id', 'main').maybeSingle();
        if (!mounted) return;
        if (data && data.about_html) setSettingsHtml(data.about_html);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us | AirPods Store</title>
        <meta
          name="description"
          content="Learn about AirPods Store - your trusted destination for premium wireless audio products. Discover our story, mission, and commitment to quality."
        />
      </Helmet>

      <Layout>
        <div className="pt-28 pb-24">
          {settingsHtml ? (
            <section className="container mx-auto px-6">
              <div className="max-w-3xl prose prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: settingsHtml }} />
            </section>
          ) : (
            // fallback to static content
            <>
              {/* Hero Section */}
              <section className="container mx-auto px-6 mb-20">
                <div className="max-w-3xl">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    Redefining the Way
                    <br />
                    <span className="text-muted-foreground">You Experience Sound</span>
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    We're passionate about delivering premium audio experiences. Since
                    our founding, we've been on a mission to make high-quality wireless
                    audio accessible to everyone.
                  </p>
                </div>
              </section>

              {/* Story Section */}
              <section className="bg-secondary/30 py-20 mb-20">
                <div className="container mx-auto px-6">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                      <div className="space-y-4 text-muted-foreground">
                        <p>
                          Founded in 2020, AirPods Store began with a simple vision: to
                          create a trusted destination where audio enthusiasts could find
                          genuine, premium wireless products.
                        </p>
                        <p>
                          What started as a small online store has grown into one of
                          India's most trusted retailers of Apple audio products. We've
                          served over 50,000 happy customers and continue to grow every
                          day.
                        </p>
                        <p>
                          Our team of audio enthusiasts personally tests every product we
                          sell, ensuring that you receive only the best quality products
                          that meet our high standards.
                        </p>
                      </div>
                    </div>
                    <div className="bg-foreground text-background p-8 rounded-2xl">
                      <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                          <div className="text-4xl font-bold mb-2">50K+</div>
                          <div className="text-background/60">Happy Customers</div>
                        </div>
                        <div>
                          <div className="text-4xl font-bold mb-2">4.9</div>
                          <div className="text-background/60">Average Rating</div>
                        </div>
                        <div>
                          <div className="text-4xl font-bold mb-2">100%</div>
                          <div className="text-background/60">Authentic Products</div>
                        </div>
                        <div>
                          <div className="text-4xl font-bold mb-2">24/7</div>
                          <div className="text-background/60">Customer Support</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Values Section */}
              <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {values.map((value) => (
                    <div
                      key={value.title}
                      className="text-center p-6 rounded-2xl border border-border/50 hover:shadow-soft transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-6 w-6 text-background" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="container mx-auto px-6">
                <div className="bg-foreground text-background rounded-3xl p-12 text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Ready to Experience Premium Audio?
                  </h2>
                  <p className="text-background/70 mb-8 max-w-lg mx-auto">
                    Browse our collection and find the perfect audio companion for your
                    lifestyle.
                  </p>
                  <Link to="/products">
                    <Button
                      size="xl"
                      className="bg-background text-foreground hover:bg-background/90 rounded-full"
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default About;
