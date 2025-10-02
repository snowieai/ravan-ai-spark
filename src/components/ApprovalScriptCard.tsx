import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Video, Calendar } from "lucide-react";

interface ApprovalScriptCardProps {
  script: {
    id: string;
    influencer_name: string;
    scheduled_date: string;
    category: string;
    topic: string;
    script_content: string;
    approval_status: string;
    admin_remarks: string | null;
    video_status?: string | null;
    video_job_id?: string | null;
    video_error_message?: string | null;
  };
  onUpdate: () => void;
}

export function ApprovalScriptCard({ script, onUpdate }: ApprovalScriptCardProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [showVideoButton, setShowVideoButton] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getInfluencerColor = (name: string) => {
    switch (name?.toLowerCase()) {
      case "kaira": return "text-purple-600";
      case "bailey": return "text-pink-600";
      case "mayra": return "text-blue-600";
      case "aisha": return "text-teal-600";
      default: return "text-foreground";
    }
  };

  const calculateCost = (scriptContent: string) => {
    const words = scriptContent.trim().split(/\s+/).length;
    const durationInSeconds = words / 2.5; // 2.5 words per second
    const cost = (durationInSeconds / 30) * 10; // $10 per 30 seconds
    
    return {
      wordCount: words,
      duration: Math.ceil(durationInSeconds),
      cost: parseFloat(cost.toFixed(2))
    };
  };

  const handleGenerateVideo = async () => {
    if (!user) return;
    
    const jobId = `JOB${Date.now()}`;
    const normalizedCharacter = script.influencer_name.charAt(0).toUpperCase() + 
                                script.influencer_name.slice(1).toLowerCase();
    
    try {
      setVideoGenerating(true);
      
      console.log('Starting video generation:', { 
        jobId, 
        character: normalizedCharacter,
        scriptLength: script.script_content.length 
      });
      
      // Update database with generating status
      const { error: updateError } = await supabase
        .from("content_calendar")
        .update({
          video_status: 'generating',
          video_job_id: jobId,
          word_count: wordCount,
          video_cost_estimate: estimatedCost,
          video_error_message: null, // Clear any previous error
        })
        .eq("id", script.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Failed to update database: ${updateError.message}`);
      }

      // Call Edge Function to trigger N8N (avoids CORS and guarantees server-side call)
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'trigger-video-generation',
        {
          body: {
            jobId,
            character: normalizedCharacter,
            script: script.script_content,
          },
        }
      );

      if (triggerError) {
        console.error('Edge function error:', triggerError);
        throw new Error(triggerError.message || 'Failed to trigger video generation');
      }

      console.log('Edge function responded:', triggerData);

      console.log('✓ Video generation started successfully');
      
      toast.success("Video generation started! Check back in a few minutes.");
      setConfirmDialogOpen(false);
      onUpdate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("❌ Video generation failed:", { error: errorMessage, jobId, character: normalizedCharacter });
      
      toast.error(`Failed to start video generation: ${errorMessage}`);
      
      // Update status to failed with error message
      await supabase
        .from("content_calendar")
        .update({ 
          video_status: 'failed', 
          video_job_id: jobId,
          video_error_message: errorMessage
        })
        .eq("id", script.id);
        
      onUpdate();
    } finally {
      setVideoGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Update database
      const { error: updateError } = await supabase
        .from("content_calendar")
        .update({
          approval_status: "approved",
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_remarks: remarks || null,
        })
        .eq("id", script.id);

      if (updateError) throw updateError;

      // Notify team
      await supabase.functions.invoke("notify-team-script-approved", {
        body: {
          scriptId: script.id,
          influencer: script.influencer_name,
          status: "approved",
          approvedBy: profile?.full_name || "Admin",
          remarks: remarks || "No remarks",
        },
      });

      toast.success("Script approved successfully!");
      setApproveDialogOpen(false);
      setShowVideoButton(true);
      onUpdate();
    } catch (error) {
      console.error("Error approving script:", error);
      toast.error("Failed to approve script");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user || !remarks.trim() || remarks.length < 10) {
      toast.error("Please provide detailed rejection remarks (min 10 characters)");
      return;
    }

    try {
      setLoading(true);

      // Update database
      const { error: updateError } = await supabase
        .from("content_calendar")
        .update({
          approval_status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_remarks: remarks,
        })
        .eq("id", script.id);

      if (updateError) throw updateError;

      // Notify team
      await supabase.functions.invoke("notify-team-script-approved", {
        body: {
          scriptId: script.id,
          influencer: script.influencer_name,
          status: "rejected",
          approvedBy: profile?.full_name || "Admin",
          remarks: remarks,
        },
      });

      toast.success("Script rejected. Team has been notified.");
      setRejectDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error rejecting script:", error);
      toast.error("Failed to reject script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${getInfluencerColor(script.influencer_name)}`}>
              🎬 {script.influencer_name?.charAt(0).toUpperCase() + script.influencer_name?.slice(1)}
            </h3>
            <p className="text-sm text-muted-foreground">
              📅 {new Date(script.scheduled_date).toLocaleDateString()}
            </p>
          </div>
          <Badge className={getStatusColor(script.approval_status)}>
            {script.approval_status}
          </Badge>
        </div>

        <div className="mb-4">
          <Badge variant="outline" className="mb-2">
            {script.category}
          </Badge>
          <p className="text-sm text-foreground line-clamp-2">
            {script.topic}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDialogOpen(true)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Full Script
          </Button>

          {script.approval_status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setApproveDialogOpen(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectDialogOpen(true)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {script.approval_status === "approved" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${script.influencer_name.toLowerCase()}-calendar?highlight=${script.id}`)}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View in Calendar
              </Button>
              
              {script.video_status === 'generating' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full"
                >
                  <Video className="h-4 w-4 mr-2 animate-pulse" />
                  Generating Video...
                </Button>
              )}
              
              {script.video_status === 'completed' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/video-results?content_id=${script.id}`)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  View Generated Videos
                </Button>
              )}
              
              {script.video_status === 'failed' && script.video_error_message && (
                <div className="w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Video Generation Failed</p>
                  <p className="text-xs text-red-500 dark:text-red-500">{script.video_error_message}</p>
                </div>
              )}
              
              {(script.video_status !== 'generating' && script.video_status !== 'completed') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const calc = calculateCost(script.script_content);
                    setWordCount(calc.wordCount);
                    setEstimatedDuration(calc.duration);
                    setEstimatedCost(calc.cost);
                    setCostDialogOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Generate Video with AI
                </Button>
              )}
            </>
          )}

          {script.admin_remarks && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-xs font-semibold mb-1">Admin Remarks:</p>
              <p className="text-xs text-muted-foreground">{script.admin_remarks}</p>
            </div>
          )}
        </div>
      </Card>

      {/* View Script Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Script - {script.influencer_name}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">{script.script_content}</div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Approve Script for {script.influencer_name}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Optional Remarks:</label>
              <Textarea
                placeholder="Add any comments or suggestions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
            {showVideoButton ? (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-semibold">✨ Script Approved!</p>
                <Button className="w-full" variant="secondary">
                  <Video className="h-4 w-4 mr-2" />
                  Create Video with AI
                </Button>
                <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? "Approving..." : "Approve Script"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>❌ Reject Script for {script.influencer_name}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-destructive">
                Rejection Remarks: (Required, min 10 characters)
              </label>
              <Textarea
                placeholder="Please explain why this script is being rejected..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="border-destructive"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={loading || remarks.length < 10}
              >
                {loading ? "Rejecting..." : "Reject Script"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cost Estimation Dialog */}
      <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📊 Video Generation Cost Estimate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Word Count:</span>
                <span className="font-bold">{wordCount} words</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Duration:</span>
                <span className="font-bold">{estimatedDuration} seconds</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">Estimated Cost:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">${estimatedCost}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Cost is calculated at 2.5 words/second, $10 per 30 seconds
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCostDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setCostDialogOpen(false);
                  setConfirmDialogOpen(true);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎬 Generate Video with AI?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to generate a video for <strong>{script.influencer_name}</strong>?</p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
              <p className="text-sm font-semibold">Estimated Cost: ${estimatedCost}</p>
              <p className="text-xs text-muted-foreground mt-1">This will start video generation immediately.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={handleGenerateVideo}
                disabled={videoGenerating}
              >
                {videoGenerating ? "Starting..." : "Confirm & Generate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
