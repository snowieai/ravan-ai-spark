import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { ApprovalScriptCard } from "@/components/ApprovalScriptCard";

interface ContentItem {
  id: string;
  influencer_name: string;
  scheduled_date: string;
  category: string;
  topic: string;
  script_content: string;
  approval_status: string;
  admin_remarks: string | null;
  submitted_for_approval_at: string;
}

export default function Approvals() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [scripts, setScripts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/influencers");
      return;
    }
    fetchScripts();
  }, [user, isAdmin, navigate]);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_calendar")
        .select("*")
        .neq("approval_status", "not_required")
        .order("submitted_for_approval_at", { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      toast.error("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filteredScripts = scripts.filter((script) => {
    if (activeTab === "all") return true;
    return script.approval_status === activeTab;
  });

  const stats = {
    total: scripts.length,
    pending: scripts.filter((s) => s.approval_status === "pending").length,
    approved: scripts.filter((s) => s.approval_status === "approved").length,
    rejected: scripts.filter((s) => s.approval_status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Script Approval Portal</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Scripts</div>
          </Card>
          <Card className="p-6 text-center border-yellow-500/50">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground mt-1">Pending</div>
          </Card>
          <Card className="p-6 text-center border-green-500/50">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground mt-1">Approved</div>
          </Card>
          <Card className="p-6 text-center border-red-500/50">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground mt-1">Rejected</div>
          </Card>
        </div>

        {/* Tabs Filter */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Scripts Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading scripts...</div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-muted-foreground">No scripts in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts.map((script) => (
              <ApprovalScriptCard
                key={script.id}
                script={script}
                onUpdate={fetchScripts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
