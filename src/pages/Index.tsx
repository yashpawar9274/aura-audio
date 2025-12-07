import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Features } from "@/components/home/Features";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AirPods Store - Premium Wireless Audio | Shop Now</title>
        <meta
          name="description"
          content="Shop premium AirPods and wireless audio accessories. Experience pure sound with active noise cancellation, spatial audio, and seamless Apple integration. Free shipping on orders above ₹5,000."
        />
        <meta name="keywords" content="AirPods, AirPods Pro, AirPods Max, wireless earbuds, Apple, noise cancellation" />
        <link rel="canonical" href="/" />
      </Helmet>
      
      <Layout>
        <Hero />
        <FeaturedProducts />
        <Features />
        <CTASection />
      </Layout>
    </>
  );
};

export default Index;
