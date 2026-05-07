import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <SignUp
        routing="hash"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "rounded-2xl bg-white shadow-none ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
            headerTitle: "text-zinc-900 dark:text-zinc-50",
            headerSubtitle: "text-zinc-500",
            socialButtonsBlockButton: "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
            dividerLine: "bg-zinc-200 dark:bg-zinc-700",
            dividerText: "text-zinc-400",
            formFieldLabel: "text-zinc-700 dark:text-zinc-300",
            formFieldInput:
              "h-10 rounded-lg border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 focus:border-zinc-400 focus:ring-zinc-200",
            formButtonPrimary:
              "h-10 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
            footerActionText: "text-zinc-500",
            footerActionLink: "text-zinc-900 font-medium dark:text-zinc-50",
          },
        }}
      />
    </div>
  );
}
