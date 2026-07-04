import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Shared markdown renderer (privacy + docs). Every element is mapped to
// shadcn's Typography classes verbatim (ui.shadcn.com/docs/components/typography)
// instead of the prose plugin, so rendered markdown matches shadcn 1:1.
// Tables get an overflow-x-auto wrapper so wide tables scroll instead of
// overflowing the page body (global `word-break: keep-all` keeps KR cells wide).
const components: Components = {
  h1: ({ children, id }) => (
    <h1
      id={id}
      className="mb-6 scroll-m-20 text-4xl font-semibold tracking-tight"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mt-16 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="mt-8 scroll-m-20 text-2xl font-medium tracking-tight"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4
      id={id}
      className="mt-6 scroll-m-20 text-xl font-medium tracking-tight"
    >
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-brand underline underline-offset-4"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-border py-2 pl-8 text-muted-foreground [&>p]:mt-0 [&>p]:leading-7">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc pl-8 leading-7 [&>li]:mt-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal pl-8 leading-7 [&>li]:mt-1">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ className, children }) =>
    className ? (
      // fenced block (has language-* class) — styled by <pre>
      <code className={`font-mono text-sm ${className}`}>{children}</code>
    ) : (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg border bg-muted p-4">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm [&_tbody_tr:last-child_td]:border-b-0">
          {children}
        </table>
      </div>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b bg-muted px-5 py-3 text-left font-semibold [&:not(:last-child)]:border-r [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-5 py-3 align-top [&:not(:last-child)]:border-r [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  ),
  // markdown wraps a standalone image in a <p>, so use inline-safe elements
  // (a block <span> caption) instead of <figure>/<figcaption>.
  img: ({ src, alt }) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={typeof src === "string" ? src : undefined}
        alt={alt ?? ""}
        className="block max-w-full"
      />
      {alt ? (
        <span className="mt-2 block text-center text-sm text-muted-foreground">
          {alt}
        </span>
      ) : null}
    </>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
