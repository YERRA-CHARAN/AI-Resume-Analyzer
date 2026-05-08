import { Link } from "wouter";
import { UserButton, useAuth } from "@clerk/react";
import { ThemeToggle } from "./theme-toggle";
import { FileText } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">ResumeIQ</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
