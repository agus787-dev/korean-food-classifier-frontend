import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  {
    label: "Frontend",
    href: "https://github.com/agus787-dev/korean-food-classifier-frontend",
  },
  {
    label: "Backend",
    href: "https://github.com/agus787-dev/korean-food-binary-classifier",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-muted sm:flex-row sm:px-8">
        <p>
          Educational project · Made with curiosity and Korean comfort food.
        </p>
        <nav
          aria-label="Project repositories"
          className="flex items-center gap-5"
        >
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium transition hover:text-accent"
            >
              {label}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
