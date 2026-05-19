import {
  SiJirasoftware,
  SiGithub,
  SiLinear,
  SiNotion,
} from "@icons-pack/react-simple-icons";

const platforms = [
  {
    name: "Jira",
    icon: SiJirasoftware,
    description: "OAuth · Auto-upload · Metadata sync",
    invert: false,
  },
  {
    name: "GitHub",
    icon: SiGithub,
    description: "Issues & labels · Markdown formatting",
    invert: true,
  },
  {
    name: "Linear",
    icon: SiLinear,
    description: "Team workflows · Priority mapping",
    invert: false,
  },
  {
    name: "Notion",
    icon: SiNotion,
    description: "Database entries · Rich content blocks",
    invert: true,
  },
];

export function Integrations() {
  return (
    <section className="container max-w-screen-xl py-16 lg:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Integrates with your tools
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          File issues directly to the platforms your team already uses.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex flex-col items-center gap-3 text-center"
          >
            <platform.icon
              color="default"
              size={40}
              className={platform.invert ? "dark:invert" : ""}
            />
            <h3 className="font-semibold">{platform.name}</h3>
            <p className="text-xs text-muted-foreground">
              {platform.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
