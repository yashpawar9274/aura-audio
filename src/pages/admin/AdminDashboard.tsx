import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, MessageSquare, Users, TrendingUp, DollarSign } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingReviews: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  supportCount?: number;
  recentTickets?: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingReviews: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, reviewsRes, usersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status, created_at, order_number, email"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      // fetch support tickets separately
      const { data: tickets } = await supabase.from("support_tickets").select("id, name, email, subject, status, created_at").order("created_at", { ascending: false }).limit(5);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        pendingReviews: reviewsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
        supportCount: (tickets && tickets.length) || 0,
        recentTickets: tickets || [],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: MessageSquare,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Support Requests",
      value: stats.supportCount || 0,
      icon: MessageSquare,
      color: "bg-rose-500/10 text-rose-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-foreground text-background rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-background/60">Total Revenue</p>
            <p className="text-4xl font-bold mt-2">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-background/10 flex items-center justify-center">
            <DollarSign className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {/* Recent Support Tickets */}
      <div className="bg-card rounded-2xl border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Support Requests</h2>
          <a href="/admin/support" className="text-sm text-primary">View all</a>
        </div>
        <div className="p-6">
          {(!stats.recentTickets || stats.recentTickets.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">No support requests</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTickets!.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">{t.subject || 'No subject'}</p>
                    <p className="text-sm text-muted-foreground">{t.name} • {t.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border/50">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        <div className="p-6">
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
