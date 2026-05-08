import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileSearch, Target, Zap, ShieldCheck, CheckCircle2, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-8">
            <Zap className="w-3 h-3 mr-1" />
            ResumeIQ 2.0 is now live
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Pass the ATS. <br className="hidden md:block" />
            <span className="text-primary">Land the Interview.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Get instant, AI-powered feedback on your resume. Identify missing keywords, fix formatting issues, and optimize your experience for the exact jobs you want.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                Start Free Analysis
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                See How It Works
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/20" />
                </div>
              ))}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>Trusted by 10,000+ job seekers</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to optimize your resume</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our proprietary AI analyzes your resume against millions of job descriptions to give you actionable, data-driven feedback.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileSearch className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Deep ATS Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find out exactly how Applicant Tracking Systems parse your resume. We identify missing sections, bad formatting, and parse errors.
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Keyword Gap Detection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Paste a job description and instantly see which critical keywords and hard skills your resume is missing.
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Actionable Scoring</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get a comprehensive score from 0-100 based on impact, brevity, grammar, and style, with line-by-line rewrite suggestions.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-16 text-center">Loved by ambitious professionals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { quote: "I was applying for months with no response. ResumeIQ showed me my formatting was breaking ATS parsers. Fixed it and got 3 interviews the next week.", author: "Sarah J.", role: "Product Manager" },
                { quote: "The keyword matching tool is incredible. It's like having a cheat code for job applications. It highlights exactly what to add for each specific role.", author: "David M.", role: "Software Engineer" },
                { quote: "As a senior designer, I thought my resume was perfect. ResumeIQ pointed out my impact statements lacked metrics. Truly eye-opening.", author: "Elena R.", role: "UX Designer" }
              ].map((t, i) => (
                <div key={i} className="p-6 rounded-2xl border bg-card flex flex-col justify-between">
                  <p className="text-muted-foreground mb-6">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{t.author}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">ResumeIQ</span>
            <span className="mx-2">&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
