import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@clerk/react";
import { 
  useGetResume, 
  getGetResumeQueryKey,
  useMatchJobDescription,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Briefcase, FileText, Loader2, ListChecks, Sparkles, Target } from "lucide-react";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const resumeId = parseInt(id || "0", 10);
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [jobMatchResult, setJobMatchResult] = useState<any>(null);

  const { data: resume, isLoading, isError } = useGetResume(
    resumeId,
    { query: { enabled: !!resumeId && !!userId, queryKey: getGetResumeQueryKey(resumeId) } }
  );

  const matchJob = useMatchJobDescription();

  const handleMatchJob = async () => {
    if (!jobDescription.trim() || !resumeId) return;
    setIsMatching(true);
    try {
      const result = await matchJob.mutateAsync({
        id: resumeId,
        data: { jobDescription }
      });
      setJobMatchResult(result);
      toast({
        title: "Match Analysis Complete",
        description: "We've compared your resume against the job description.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Could not complete job matching. Please try again.",
      });
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Resume Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested analysis could not be found or you don't have access.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const analysis = resume.analysisResult as any;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground truncate max-w-[300px] sm:max-w-[500px]">{resume.fileName}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <FileText className="w-4 h-4" /> Analysis Report
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 w-full justify-start h-auto p-1 bg-muted/50 border">
            <TabsTrigger value="overview" className="py-2.5 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="sections" className="py-2.5 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Section Analysis</TabsTrigger>
            <TabsTrigger value="job-match" className="py-2.5 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Job Match</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
            {!analysis ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-bold mb-2">Analysis in Progress</h3>
                  <p className="text-muted-foreground max-w-md">
                    Our AI is currently analyzing your resume. This usually takes about 10-15 seconds. Please wait...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {/* Score Column */}
                <div className="flex flex-col gap-8">
                  <Card className="border-primary/20 shadow-md bg-gradient-to-b from-card to-card/50">
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">ATS Score</CardTitle>
                      <CardDescription>Overall compatibility</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <CircularProgress value={Math.round(analysis.overallScore)} size={160} strokeWidth={12} label="Score" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ScoreBar label="ATS Compatibility" value={analysis.atsCompatibility} />
                      <ScoreBar label="Keyword Match" value={analysis.keywordMatch} />
                      <ScoreBar label="Formatting" value={analysis.formatting} />
                      <ScoreBar label="Skills Density" value={analysis.skills} />
                      <ScoreBar label="Grammar & Style" value={analysis.grammar} />
                    </CardContent>
                  </Card>
                </div>

                {/* Details Column */}
                <div className="md:col-span-2 flex flex-col gap-8">
                  <Card>
                    <CardHeader className="pb-4 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Key Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {analysis.strengths?.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <Card className="border-red-500/20">
                      <CardHeader className="pb-4 border-b border-red-500/10 bg-red-500/5">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                          <XCircle className="w-5 h-5" />
                          Missing Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingKeywords?.length > 0 ? analysis.missingKeywords.map((kw: string, i: number) => (
                            <Badge key={i} variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">{kw}</Badge>
                          )) : (
                            <span className="text-sm text-muted-foreground">None identified.</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-500/20">
                      <CardHeader className="pb-4 border-b border-yellow-500/10 bg-yellow-500/5">
                        <CardTitle className="text-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                          <AlertTriangle className="w-5 h-5" />
                          Weak Phrases
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2">
                          {analysis.weakPhrases?.length > 0 ? analysis.weakPhrases.map((phrase: string, i: number) => (
                            <Badge key={i} variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20">{phrase}</Badge>
                          )) : (
                            <span className="text-sm text-muted-foreground">None identified.</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-4 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-4">
                        {analysis.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm pt-0.5 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sections" className="mt-0 focus-visible:outline-none">
            {analysis?.sectionAnalysis && (
              <div className="grid gap-6">
                {analysis.sectionAnalysis.map((section: any, i: number) => (
                  <Card key={i} className={!section.present ? "border-dashed border-muted-foreground/30 opacity-70 bg-muted/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg capitalize flex items-center gap-2">
                          {section.name}
                          {!section.present && <Badge variant="secondary" className="ml-2">Missing</Badge>}
                        </CardTitle>
                        {section.present && (
                          <div className={`font-bold px-2.5 py-1 rounded-md text-sm ${
                            section.score >= 80 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                            section.score >= 60 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {section.score}/100
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80 leading-relaxed">{section.feedback}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="job-match" className="mt-0 focus-visible:outline-none">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Target Job Description
                  </CardTitle>
                  <CardDescription>Paste the job description you're targeting</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <Textarea 
                    placeholder="Paste job description here..." 
                    className="min-h-[300px] flex-1 font-mono text-sm resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="border-t bg-muted/10 py-4">
                  <Button 
                    className="w-full" 
                    onClick={handleMatchJob}
                    disabled={!jobDescription.trim() || isMatching}
                  >
                    {isMatching ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Match...</>
                    ) : (
                      "Calculate Match Score"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div>
                {jobMatchResult ? (
                  <div className="space-y-6">
                    <Card className="border-primary/30 shadow-md">
                      <CardHeader className="text-center pb-2">
                        <CardTitle>Job Match Score</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center py-6">
                        <CircularProgress value={Math.round(jobMatchResult.matchScore)} size={140} strokeWidth={10} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-md">Skills Gap Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Matched</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobMatchResult.matchedKeywords?.map((kw: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Missing</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobMatchResult.missingKeywords?.map((kw: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-md flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary" /> Tailoring Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {jobMatchResult.suggestions?.map((sug: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="h-full border-dashed flex flex-col items-center justify-center text-center p-8 bg-muted/10">
                    <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-foreground/70">Ready to Match</h3>
                    <p className="text-muted-foreground max-w-xs">
                      Paste a job description and click calculate to see how well your resume fits the role.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string, value: number }) {
  let colorClass = "bg-red-500";
  if (value >= 80) colorClass = "bg-green-500";
  else if (value >= 60) colorClass = "bg-yellow-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold">{Math.round(value)}/100</span>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

