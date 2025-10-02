import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LogOut, ArrowLeft, Film, ChevronDown, ChevronUp } from "lucide-react";
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
  video_status?: string | null;
  video_job_id?: string | null;
  video_error_message?: string | null;
}

export default function Approvals() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading: authLoading, refreshProfile } = useAuth();
  const [scripts, setScripts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApprovedOpen, setIsApprovedOpen] = useState(false);
  const [isRejectedOpen, setIsRejectedOpen] = useState(false);
  const deniedToastShown = useRef(false);

  // Refresh profile on mount to ensure latest admin role is loaded
  useEffect(() => {
    refreshProfile?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    fetchScripts();
  }, [user, authLoading]);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_calendar")
        .select("*")
        .or("approval_status.neq.not_required,status.eq.pending_approval")
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

  const pendingScripts = scripts.filter((s) => s.approval_status === "pending");
  const approvedScripts = scripts.filter((s) => s.approval_status === "approved");
  const rejectedScripts = scripts.filter((s) => s.approval_status === "rejected");

  const stats = {
    total: scripts.length,
    pending: pendingScripts.length,
    approved: approvedScripts.length,
    rejected: rejectedScripts.length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Script Approval Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/video-library")}>
              <Film className="h-4 w-4 mr-2" />
              Video Library
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {authLoading && (
          <div className="text-center py-12 text-muted-foreground">Checking permissions...</div>
        )}
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

        {/* Scripts Sections */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading scripts...</div>
        ) : (
          <div className="space-y-8">
            {/* Pending Scripts - Always Visible at Top */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-foreground">Pending Scripts</h2>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {stats.pending}
                </Badge>
              </div>
              {pendingScripts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No pending scripts</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingScripts.map((script) => (
                    <ApprovalScriptCard
                      key={script.id}
                      script={script}
                      onUpdate={fetchScripts}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Approved Scripts - Collapsible */}
            <Collapsible open={isApprovedOpen} onOpenChange={setIsApprovedOpen}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">Approved Scripts</h2>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {stats.approved}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isApprovedOpen ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {approvedScripts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No approved scripts</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedScripts.map((script) => (
                      <ApprovalScriptCard
                        key={script.id}
                        script={script}
                        onUpdate={fetchScripts}
                      />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Rejected Scripts - Collapsible */}
            <Collapsible open={isRejectedOpen} onOpenChange={setIsRejectedOpen}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">Rejected Scripts</h2>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                    {stats.rejected}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isRejectedOpen ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {rejectedScripts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No rejected scripts</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rejectedScripts.map((script) => (
                      <ApprovalScriptCard
                        key={script.id}
                        script={script}
                        onUpdate={fetchScripts}
                      />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
}
