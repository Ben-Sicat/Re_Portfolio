import { profile } from "@/lib/content";

const links = [
  { href: "#mpcam", label: "M-PCAM", show: "" },
  { href: "#llm", label: "LLM", show: "hidden sm:block" },
  { href: "#scanqc", label: "Scan QC", show: "hidden md:block" },
  { href: "#projects", label: "Projects", show: "hidden lg:block" },
  { href: "#experience", label: "Experience", show: "" },
  { href: "#contact", label: "Contact", show: "" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-linear-to-b from-bg via-bg/85 to-transparent pb-4">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <a href="#top" className="font-display text-lg font-bold tracking-[-0.02em] whitespace-nowrap">
          {profile.name}
        </a>
        <ul className="flex items-center gap-1 rounded-full border border-line bg-bg/70 p-1 text-sm">
          {links.map((l) => (
            <li key={l.href} className={l.show || undefined}>
              <a href={l.href} className="block rounded-full px-2.5 py-1.5 whitespace-nowrap text-muted sm:px-3 transition-colors hover:bg-surface-2 hover:text-fg md:px-4">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
