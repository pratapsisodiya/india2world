import Link from "next/link";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard/chat", label: "AI Chat" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
  { href: "/settings", label: "Settings" },
];

const platformLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/glossary", label: "Glossary" },
  { href: "/dashboard/schemes", label: "Gov. Schemes" },
  { href: "/dashboard/hs-codes", label: "HS Code Lookup" },
  { href: "/dashboard/checklist", label: "Doc Checklist" },
];

const resources = [
  { href: "https://dgft.gov.in", label: "DGFT" },
  { href: "https://www.icegate.gov.in", label: "ICEGATE" },
  { href: "https://apeda.gov.in", label: "APEDA" },
  { href: "https://www.fieo.org", label: "FIEO" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Tricolor stripe */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(to right, #FF9933 33.333%, #ffffff 33.333% 66.666%, #138808 66.666%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="tricolor-gradient inline-block h-5 w-4 rounded-sm ring-1 ring-zinc-300 dark:ring-zinc-700" />
            India2World
          </Link>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            AI-powered export guidance for Indian entrepreneurs, manufacturers, and
            service businesses.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Quick links
          </h3>
          <ul className="mt-3 space-y-2">
            {publicLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-saffron-600 dark:text-zinc-400 dark:hover:text-saffron-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Platform
          </h3>
          <ul className="mt-3 space-y-2">
            {platformLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-saffron-600 dark:text-zinc-400 dark:hover:text-saffron-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Resources
          </h3>
          <ul className="mt-3 space-y-2">
            {resources.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-600 transition-colors hover:text-saffron-600 dark:text-zinc-400 dark:hover:text-saffron-400"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} India2World. Built for Indian exporters.</p>
          <p className="text-xs">
            Always confirm duty rates, scheme terms, and current regulations with
            DGFT, ICEGATE, or a licensed customs broker before acting.
          </p>
        </div>
      </div>
    </footer>
  );
}
