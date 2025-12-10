import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
const navLinks = [{
  href: "/",
  label: "Home"
}, {
  href: "/products",
  label: "Products"
}, {
  href: "/about",
  label: "About"
}, {
  href: "/contact",
  label: "Contact"
}];
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    itemCount
  } = useCartContext();
  const {
    user
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", isScrolled ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-soft" : "bg-transparent")}>
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-foreground">AURAPODS</span>
          <span className="text-muted-foreground font-light ml-1">store</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => <Link key={link.href} to={link.href} className={cn("text-sm font-medium transition-colors hover:text-foreground relative py-2", location.pathname === link.href ? "text-foreground" : "text-muted-foreground")}>
              {link.label}
              {location.pathname === link.href && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />}
            </Link>)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => navigate(user ? "/profile" : "/auth")}>
            <User className="h-5 w-5" />
          </Button>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>}
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn("md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300 overflow-hidden", isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
          {navLinks.map(link => <Link key={link.href} to={link.href} className={cn("text-lg font-medium py-2 transition-colors", location.pathname === link.href ? "text-foreground" : "text-muted-foreground")}>
              {link.label}
            </Link>)}
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Account
            </Button>
          </div>
        </div>
      </div>
    </header>;
}