import { useState } from "react";
import { useAuth } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { 
  useListResumes, 
  useGetDashboardStats, 
  useCreateResume, 
  useAnalyzeResume,
  useDeleteResume,
  getListResumesQueryKey,
  getGetDashboardStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/ui/circular-progress";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { FileText, Trash2, ChevronRight, BarChart2, Upload, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { userId } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: resumes, isLoading: isLoadingResumes } = useListResumes(
    { userId: userId || "" },
    { query: { enabled: !!userId, queryKey: getListResumesQueryKey({ userId: userId || "" }) } }
  );

  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(
    { userId: userId || "" },
    { query: { enabled: !!userId, queryKey: getGetDashboardStatsQueryKey({ userId: userId || "" }) } }
  );

  const createResume = useCreateResume();
  const analyzeResume = useAnalyzeResume();
  const deleteResume = useDeleteResume();

  const handleUpload = async (file: File, base64: string) => {
    if (!userId) return;
    setIsUploading(true);
    try {
      // 1. Create resume
      const newResume = await createResume.mutateAsync({
        data: {
          userId,
          fileName: file.name,
          fileType: file.type,
          fileContent: base64
        }
      });
      
      // 2. Analyze resume
      await analyzeResume.mutateAsync({
        id: newResume.id,
        data: {}
      });

      // 3. Invalidate queries
      queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId }) });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey({ userId }) });

      toast({
        title: "Resume analyzed successfully",
        description: "Your resume has been uploaded and analyzed.",
      });

      // 4. Redirect to analysis page
      setLocation(`/analysis/${newResume.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error processing your resume. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!userId) return;
    try {
      await deleteResume.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId }) });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey({ userId }) });
      toast({
        title: "Resume deleted",
        description: "The resume has been permanently removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete the resume.",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and optimize your resumes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Upload */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Quick Upload */}
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  New Analysis
                </CardTitle>
                <CardDescription>Upload a resume to get an instant ATS score</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUpload={handleUpload} isLoading={isUploading} />
              </CardContent>
            </Card>

            {/* Key Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /></div>
                    <div className="flex justify-between items-center"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /></div>
                    <div className="flex justify-between items-center"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Total Resumes</span>
                      <span className="text-2xl font-bold">{stats.totalResumes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Average Score</span>
                      <span className="text-2xl font-bold">{stats.averageScore ? Math.round(stats.averageScore) : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Best Score</span>
                      <span className="text-2xl font-bold text-green-500">{stats.bestScore ? Math.round(stats.bestScore) : '--'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No data available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - History & Charts */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Score History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Progression</CardTitle>
                <CardDescription>Track your resume improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-[250px] w-full rounded-xl" />
                ) : stats?.scoreHistory && stats.scoreHistory.length > 1 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.scoreHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => format(new Date(val), "MMM d")}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          labelFormatter={(val) => format(new Date(val), "MMM d, yyyy")}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <BarChart2 className="h-10 w-10 mb-2 opacity-20" />
                    <p>Upload at least two resumes to see your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingResumes ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                  </div>
                ) : resumes && resumes.length > 0 ? (
                  <div className="space-y-4">
                    {resumes.map(resume => (
                      <div key={resume.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <Link href={`/analysis/${resume.id}`} className="font-semibold hover:text-primary transition-colors line-clamp-1">
                              {resume.fileName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(resume.createdAt), "MMM d, yyyy • h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {resume.overallScore ? (
                            <div className="hidden sm:flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">Score</span>
                              <span className={`font-bold px-2 py-1 rounded-md text-xs ${
                                resume.overallScore >= 80 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                resume.overallScore >= 60 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                                'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                {Math.round(resume.overallScore)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Pending</span>
                          )}
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(resume.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Link href={`/analysis/${resume.id}`}>
                              <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No resumes yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload your first resume to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
