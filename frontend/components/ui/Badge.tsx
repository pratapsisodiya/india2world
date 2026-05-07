import { cn } from "@/lib/cn";

const variants: Record<string, string> = {
  default:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  blue:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
