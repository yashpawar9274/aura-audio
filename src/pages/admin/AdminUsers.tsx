import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, Loader2, Shield, User, Plus, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role?: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "user",
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      // Check if role entry exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }

      toast({ title: "Success", description: `User role updated to ${newRole}` });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const createStaff = async () => {
    if (!newUserEmail) {
      toast({ title: "Missing Email", description: "Please provide an email.", variant: "destructive" });
      return;
    }

    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("profiles").insert({
        id,
        email: newUserEmail,
        full_name: newUserName || null,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: id, role: newUserRole });
      if (roleErr) throw roleErr;

      toast({ title: "Staff Created", description: "New staff added to profiles." });
      setAddOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserRole("user");
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || String(error), variant: "destructive" });
    }
  };

  const startEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const { error } = await supabase.from("profiles").update({ full_name: editingUser.full_name }).eq("id", editingUser.id);
      if (error) throw error;
      if (editingUser.role) await updateUserRole(editingUser.id, editingUser.role as "admin" | "user");
      setEditOpen(false);
      setEditingUser(null);
      fetchUsers();
      toast({ title: "Updated", description: "User updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and roles</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="mt-4">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-2" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button onClick={createStaff}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                          {user.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || "No name"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-600"
                          : "bg-secondary text-muted-foreground"
                      )}>
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value as "admin" | "user")}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(user)}>
                          <Edit2 className="h-4 w-4" />
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
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input value={editingUser.full_name} onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveEdit}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
