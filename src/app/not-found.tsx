import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[60dvh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <p className="font-serif text-6xl font-bold text-brand">404</p>
        <p className="mt-4 font-serif text-2xl font-semibold">
          Page not found
        </p>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for may have been moved, renamed, or never
          existed.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/">Back to homepage</Button>
          <Button href="/articles" variant="outline">
            Browse articles
          </Button>
        </div>
      </div>
    </div>
  );
}
