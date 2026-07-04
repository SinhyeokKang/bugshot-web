import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Shared markdown renderer (privacy now, docs-portal later).
// GFM tables + heading slugs; each table wrapped in an overflow-x-auto
// container so wide tables scroll instead of overflowing the page body
// (global `word-break: keep-all` keeps Korean cells from wrapping).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-gray max-w-none prose-headings:scroll-mt-24 prose-a:font-medium prose-a:text-brand prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
