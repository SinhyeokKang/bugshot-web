import {
  CHROME_WEB_STORE_URL,
  GITHUB_URL,
  PRIVACY_POLICY_URL,
} from "@/lib/constants";

const links = [
  { label: "Chrome Web Store", href: CHROME_WEB_STORE_URL, group: "Product" },
  { label: "Privacy Policy", href: PRIVACY_POLICY_URL, group: "Legal" },
  { label: "GitHub", href: GITHUB_URL, group: "Source" },
];

const groups = ["Product", "Legal", "Source"] as const;

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container grid max-w-screen-xl gap-8 sm:grid-cols-3">
        {groups.map((group) => (
          <div key={group}>
            <h4 className="mb-3 text-sm font-semibold">{group}</h4>
            <ul className="space-y-2">
              {links
                .filter((l) => l.group === group)
                .map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container mt-8 max-w-screen-xl border-t pt-8">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bugshot
        </p>
      </div>
    </footer>
  );
}
