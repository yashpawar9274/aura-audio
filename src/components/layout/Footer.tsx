import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight } from "lucide-react";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "AirPods Pro", href: "/products?category=pro" },
    { label: "AirPods", href: "/products?category=standard" },
    { label: "AirPods Max", href: "/products?category=premium" },
    { label: "Accessories", href: "/products?category=accessories" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              AIRPODS<span className="font-light text-background/60 ml-1">store</span>
            </Link>
            <p className="mt-4 text-background/60 max-w-sm">
              Premium audio, redefined. Experience the future of wireless audio with our curated collection of AirPods.
            </p>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40 focus:border-background/40"
                />
                <Button variant="secondary" size="icon" className="shrink-0 bg-background text-foreground hover:bg-background/90">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            © 2024 AirPods Store. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-background/40 hover:text-background transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
