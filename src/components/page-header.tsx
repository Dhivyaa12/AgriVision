
'use client';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter();
  return (
    <section
      className={cn(
        "flex max-w-full flex-col gap-2",
        className
      )}
      {...props}
    >
        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="flex-1">{children}</div>
        </div>
    </section>
  );
}

function PageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "max-w-prose text-balance text-muted-foreground sm:text-lg",
        className
      )}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription };
