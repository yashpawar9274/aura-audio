import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Returns from "./pages/Returns";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminWarrantyCards } from "./pages/admin/AdminWarrantyCards";
import AdminSerials from "./pages/admin/AdminSerials";
import AdminWarrantyCardView from "./pages/admin/AdminWarrantyCardView";
import AdminWarrantyCardPrint from "./pages/admin/AdminWarrantyCardPrint";
import AdminStaffEarnings from "./pages/admin/AdminStaffEarnings";
import { AdminNotifyMe } from "./pages/admin/AdminNotifyMe";
import { AdminReferrals } from "./pages/admin/AdminReferrals";
import AdminContact from "./pages/admin/AdminContact";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import Notify from "./pages/Notify";
import Refer from "./pages/Refer";
import ReferDashboard from "./pages/ReferDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shipping" element={<Shipping />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="warranty" element={<AdminWarrantyCards />} />
                  <Route path="serials" element={<AdminSerials />} />
                  <Route path="warranty/:id" element={<AdminWarrantyCardView />} />
                  <Route path="support" element={<AdminContact />} />
                  <Route path="notify" element={<AdminNotifyMe />} />
                  <Route path="referrals" element={<AdminReferrals />} />
                  <Route path="withdrawals" element={<AdminWithdrawals />} />
                  <Route path="staff-earnings" element={<AdminStaffEarnings />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="/admin/warranty/print/:id" element={<AdminWarrantyCardPrint />} />
                
                <Route path="/notify" element={<Notify />} />
                <Route path="/refer" element={<Refer />} />
                <Route path="/refer/dashboard" element={<ReferDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
