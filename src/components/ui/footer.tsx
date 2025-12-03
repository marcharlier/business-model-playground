'use client';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              🧘‍♂️ This is a vibe coding project by{' '}
              <a
                href="https://www.linkedin.com/in/martincharlier/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Martin Charlier
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Purpose</h3>
            <p className="text-sm text-muted-foreground">
              🎛️ A tool to help you explore and validate business ideas through financial modeling and scenario testing.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Support & Feedback</h3>
            <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
                💬 Have ideas for improvements?{' '}
                <a 
                  href="mailto:m@marcharlier.com?subject=Business Model Playground - Feedback"
                  className="text-primary hover:underline"
                >
                  Email me
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                ☕ Useful to you?{' '}
                <a
                  href="https://buymeacoffee.com/martincharlier" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Buy me a coffee
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 