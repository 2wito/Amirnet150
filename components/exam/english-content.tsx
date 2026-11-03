import { cn } from "@/lib/utils";

type EnglishContentProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children" | "dir" | "lang">;

/**
 * Wraps English exam material (question stems, options, passages) so it
 * renders left-to-right inside the Hebrew RTL app, in the exam font.
 */
export function EnglishContent<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: EnglishContentProps<T>) {
  const Component = as ?? "div";
  return (
    <Component dir="ltr" lang="en" className={cn("font-exam text-start", className)} {...rest}>
      {children}
    </Component>
  );
}
