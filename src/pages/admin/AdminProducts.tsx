import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  in_stock: boolean;
  stock_count: number;
  is_upcoming: boolean;
  is_featured: boolean;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    price: "",
    original_price: "",
    images: "",
    media: "",
    category: "",
    stock_count: "",
    in_stock: true,
    is_upcoming: false,
    is_featured: false,
    is_combo: false,
    combo_components: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
      if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        short_description: product.short_description || "",
        description: product.description || "",
        price: product.price.toString(),
        original_price: product.original_price?.toString() || "",
        images: product.images?.join(", ") || "",
        media: (product as any).specs?.media ? (product as any).specs.media.map((m: any) => `${m.type}:${m.url}`).join("\n") : "",
        category: product.category || "",
        stock_count: product.stock_count?.toString() || "0",
        in_stock: product.in_stock,
        is_upcoming: product.is_upcoming,
        is_featured: product.is_featured,
        is_combo: (product as any).is_combo || false,
        combo_components: ((product as any).combo_components && Array.isArray((product as any).combo_components)) ? (product as any).combo_components.join(', ') : "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        slug: "",
        short_description: "",
        description: "",
        price: "",
        original_price: "",
        images: "",
        media: "",
        category: "",
        stock_count: "0",
        in_stock: true,
        is_upcoming: false,
        is_featured: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        short_description: formData.short_description,
        description: formData.description,
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : null,
        images: formData.images.split(",").map((s) => s.trim()).filter(Boolean),
        category: formData.category,
        stock_count: parseInt(formData.stock_count) || 0,
        in_stock: formData.in_stock,
        is_upcoming: formData.is_upcoming,
        is_featured: formData.is_featured,
        is_combo: formData.is_combo,
        combo_components: formData.combo_components ? formData.combo_components.split(",").map(s => s.trim()).filter(Boolean) : null,
      };

      // parse media lines like "image:https://..." or "video:https://..." and store inside specs.media
      const mediaLines = formData.media.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (mediaLines.length > 0) {
        const mediaArr = mediaLines.map((line) => {
          const [prefix, ...rest] = line.split(":");
          const url = rest.join(":").trim();
          const type = (prefix || "image").toLowerCase().includes("video") ? "video" : "image";
          return { type, url };
        });
        (productData as any).specs = { ...(editingProduct ? (editingProduct as any).specs || {} : {}), media: mediaArr };
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (INR)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price</label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Count</label>
                  <Input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Pro, Standard, Premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Images (comma-separated URLs)</label>
                  <Input
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Media (one per line, prefix with image: or video:)</label>
                  <Textarea
                    value={formData.media}
                    onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                    placeholder={`image:https://...\nvideo:https://...`}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <span className="text-sm">In Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <span className="text-sm">Featured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_upcoming}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_upcoming: checked })}
                  />
                  <span className="text-sm">Upcoming</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_combo}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_combo: checked })}
                  />
                  <span className="text-sm">Combo Product</span>
                </div>
                {formData.is_combo && (
                  <div className="w-full pt-2">
                    <label className="block text-sm font-medium mb-1">Combo Components (comma-separated product ids or slugs)</label>
                    <Textarea value={formData.combo_components} onChange={(e) => setFormData({ ...formData, combo_components: e.target.value })} rows={2} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingProduct ? "Update" : "Create"} Product</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-secondary"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.short_description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.category || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{product.stock_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.is_featured && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600">Featured</span>
                        )}
                        {product.is_upcoming && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-600">Upcoming</span>
                        )}
                        {product.in_stock ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600">In Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
